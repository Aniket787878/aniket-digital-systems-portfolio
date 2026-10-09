import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { STOP_U, headAt, lemniscate } from './lemniscate.js'

/*
  The loop as a glass tube with a light inside it. Loaded only through
  React.lazy() from HowLoop.jsx, so three.js stays out of the main bundle.

  Cheap on purpose: no transmission, no postprocessing. The glass is a
  clear physical material whose alpha is lifted wherever it reflects
  something (so the highlights stay bright while the body stays clear)
  plus a fresnel rim; the "bloom" is additive sprites and a soft halo
  tube. Per-frame work writes to refs and DOM styles, never React state.
*/

const A = 2 // half-width: the loop is 4 units wide
const R_GLASS = 0.064
const R_CORE = 0.014
const R_TRAIL = 0.024
const R_HALO = 0.16
const LIFT = 0.13 // z offset at the crossing so the tube passes over itself
const TILT_X = (-18 * Math.PI) / 180
const FOV = 26
const TRAIL = 0.11

const SAFFRON = new THREE.Color('#f5871e')
const PEACH = new THREE.Color('#ffc89a')

class Lemniscate3 extends THREE.Curve {
  getPoint(u, target = new THREE.Vector3()) {
    const p = lemniscate(u)
    return target.set(p.x * A, p.y * A, LIFT * Math.sin(p.t))
  }
}

function makeGlowTexture() {
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.18, 'rgba(255,255,255,0.6)')
  r.addColorStop(0.45, 'rgba(255,255,255,0.14)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* Clear glass: a physical material whose alpha follows what it reflects,
   with a warm fresnel rim, so the tube reads as a solid edge-lit object
   rather than a milky pipe. */
function makeGlass() {
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 0.05,
    depthWrite: false
  })
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      float hlFres = pow(1.0 - saturate(dot(normalize(geometryNormal), geometryViewDir)), 2.4);
      outgoingLight += vec3(1.0, 0.84, 0.68) * hlFres * 0.6;
      float hlLum = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
      diffuseColor.a = saturate(diffuseColor.a + hlLum * 0.6 + hlFres * 0.3);
      #include <opaque_fragment>
      `
    )
  }
  return mat
}

/* The light travelling inside the tube. uv.x of a TubeGeometry runs
   along the curve, so the trail is a falloff behind the head, and the
   path already travelled keeps a low glow: the loop fills as you go. */
const trailVertex = /* glsl */ `
  varying float vU;
  varying float vFacing;
  void main() {
    vU = uv.x;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vFacing = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`
const trailFragment = /* glsl */ `
  uniform float uHead;
  uniform float uLen;
  uniform float uFill;
  uniform float uSoft;
  uniform float uGain;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vU;
  varying float vFacing;
  uniform float uEdge;
  uniform float uWrap;
  void main() {
    float d = uHead - vU;
    // After a full lap the start of the tube sits just ahead of the head:
    // measure it as ahead so the glow fades in across the seam.
    if (uWrap > 0.5 && d > 0.5) d -= 1.0;
    // A soft leading edge: a hard cut across a thick tube reads as a seam.
    float lead = smoothstep(-uEdge, 0.0, d);
    float trail = lead * exp(-max(d, 0.0) / uLen);
    // Once the head has gone all the way round, the whole loop stays lit.
    float behind = max(lead, uWrap);
    float a = max(trail, behind * uFill);
    float facing = mix(1.0, pow(vFacing, 1.6), uSoft);
    vec3 col = mix(uColor, uHot, smoothstep(0.8, 1.0, trail));
    vec3 c = col * a * facing * uGain;
    // Premultiplied: alpha follows brightness, so the transparent canvas
    // composites as light over the page instead of an opaque black band.
    gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
  }
`

function trailMaterial({ fill, soft, gain, edge }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uHead: { value: 0 },
      uEdge: { value: edge },
      uWrap: { value: 0 },
      uLen: { value: TRAIL },
      uFill: { value: fill },
      uSoft: { value: soft },
      uGain: { value: gain },
      uColor: { value: SAFFRON.clone() },
      uHot: { value: new THREE.Color('#ffe2c2') }
    },
    vertexShader: trailVertex,
    fragmentShader: trailFragment,
    transparent: true,
    premultipliedAlpha: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  })
}

function Glow({ map, color = SAFFRON, size = 0.4, opacity = 0.7, spriteRef, ...rest }) {
  return (
    <sprite ref={spriteRef} scale={[size, size, 1]} {...rest}>
      {/* Adds light without touching the canvas alpha: plain additive
          blending also accumulates alpha, which on a transparent canvas
          darkens the page behind the glow into a visible disc. */}
      <spriteMaterial
        map={map}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.OneFactor}
        blendSrcAlpha={THREE.ZeroFactor}
        blendDstAlpha={THREE.OneFactor}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </sprite>
  )
}

const PARTICLES = [0.07, 0.19, 0.33, 0.46, 0.58, 0.71, 0.86].map((u, i) => ({
  u,
  speed: 0.012 + (i % 3) * 0.006,
  size: 0.07 + (i % 2) * 0.03
}))

const v = new THREE.Vector3()
const TIP = new Lemniscate3().getPoint(0)
const ORIGIN = new THREE.Vector3(0, 0, 0)
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function Loop({ progress, overlay, metrics, onReady }) {
  const { camera, size } = useThree()
  const curve = useMemo(() => new Lemniscate3(), [])
  const glow = useMemo(() => makeGlowTexture(), [])
  const geos = useMemo(
    () => ({
      glass: new THREE.TubeGeometry(curve, 400, R_GLASS, 20, true),
      core: new THREE.TubeGeometry(curve, 400, R_CORE, 8, true),
      trail: new THREE.TubeGeometry(curve, 400, R_TRAIL, 10, true),
      halo: new THREE.TubeGeometry(curve, 400, R_HALO, 12, true),
      node: new THREE.SphereGeometry(0.12, 32, 24),
      nodeCore: new THREE.SphereGeometry(0.045, 16, 12)
    }),
    [curve]
  )
  const mats = useMemo(
    () => ({
      glass: makeGlass(),
      core: new THREE.MeshBasicMaterial({ color: new THREE.Color('#f5871e').multiplyScalar(0.55), toneMapped: false }),
      trail: trailMaterial({ fill: 0.4, soft: 0, gain: 1.2, edge: 0.008 }),
      halo: trailMaterial({ fill: 0.12, soft: 1, gain: 0.32, edge: 0.04 }),
      nodeCores: STOP_U.map(() => new THREE.MeshBasicMaterial({ color: '#4a3d31', toneMapped: false }))
    }),
    []
  )
  const stopPos = useMemo(() => STOP_U.map((u) => curve.getPoint(u)), [curve])

  const tilt = useRef(null)
  const head = useRef(null)
  const headLight = useRef(null)
  const nodeGlows = useRef([])
  const nodeCores = useRef([])
  const trailMesh = useRef(null)
  const haloMesh = useRef(null)
  const parts = useRef([])
  const pointer = useRef({ x: 0, y: 0 })
  const lit = useRef(STOP_U.map(() => 0))
  const smoothHead = useRef(headAt(progress.get()))
  const ready = useRef(false)

  useEffect(() => {
    const move = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose())
      mats.glass.dispose()
      mats.core.dispose()
      mats.trail.dispose()
      mats.halo.dispose()
      mats.nodeCores.forEach((m) => m.dispose())
      glow.dispose()
    },
    [geos, mats, glow]
  )

  useFrame((state, dt) => {
    const W = size.width
    const H = size.height
    const m = metrics.current
    if (!W || !H || !m.ready) return

    // Fit: the loop fills the layout's loop column (.hl-loopbox, already
    // capped in CSS so loop + gap + copy sit centred in the site container),
    // and never gets taller than the stage allows. Centred in the column if
    // the height cap leaves it narrower.
    const loopPx = Math.max(320, Math.min(m.lw, H * 1.2, 1040))
    const left = m.lx + Math.max(0, (m.lw - loopPx) / 2)
    const tanH = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const dist = ((2 * A) / loopPx) * (H / (2 * tanH))
    camera.position.set(0, 0, dist)
    camera.lookAt(0, 0, 0)
    const wpp = (2 * dist * tanH) / H
    const g = tilt.current
    g.position.x = (left + loopPx / 2 - W / 2) * wpp
    g.position.y = (H / 2 - m.cy) * wpp

    // Pointer tilt, small: the stream must still meet the tip.
    const k = 1 - Math.exp(-dt * 3)
    g.rotation.x += (TILT_X - pointer.current.y * 0.05 - g.rotation.x) * k
    g.rotation.y += (pointer.current.x * 0.07 - g.rotation.y) * k

    // Head: eased toward the scroll target so a wheel step glides.
    const target = headAt(progress.get())
    smoothHead.current += (target - smoothHead.current) * (1 - Math.exp(-dt * 8))
    if (Math.abs(target - smoothHead.current) < 0.0004) smoothHead.current = target
    const h = smoothHead.current
    const wrap = h >= 0.999 ? 1 : 0
    for (const mesh of [trailMesh.current, haloMesh.current]) {
      mesh.material.uniforms.uHead.value = h
      mesh.material.uniforms.uWrap.value = wrap
    }

    const hp = curve.getPoint(Math.min(h, 0.9999), v)
    const shown = h > 0.002 ? 1 : 0
    head.current.position.copy(hp)
    head.current.visible = !!shown
    headLight.current.position.set(hp.x, hp.y, hp.z + 0.35)
    headLight.current.intensity = shown * 2.5

    // Stops light as the head reaches them and stay warm after.
    STOP_U.forEach((u, i) => {
      const on = h >= u - 0.004 ? 1 : 0
      lit.current[i] += (on - lit.current[i]) * (1 - Math.exp(-dt * 6))
      const near = Math.max(0, 1 - Math.abs(h - u) / 0.07)
      const l = lit.current[i]
      nodeCores.current[i]?.material.color.set('#4a3d31').lerp(PEACH, l * 0.35).lerp(SAFFRON, l * 0.65).multiplyScalar(1 + near * 1.4)
      const s = nodeGlows.current[i]
      if (s) {
        s.material.opacity = l * (0.35 + near * 0.55)
        const sc = 0.55 + near * 0.6
        s.scale.set(sc, sc, 1)
      }
    })

    // Idle sparks drifting along the glass.
    const t = state.clock.elapsedTime
    PARTICLES.forEach((p, i) => {
      const s = parts.current[i]
      if (!s) return
      curve.getPoint((p.u + t * p.speed) % 1, s.position)
      s.material.opacity = 0.28 + 0.2 * Math.sin(t * 1.3 + i * 1.7)
    })

    // Project the stops, the tip and the crossing to stage pixels for the
    // DOM: labels, the stream of light, the "around again" line.
    const out = overlay.current
    g.updateWorldMatrix(true, false)
    const toScreen = (p) => {
      v.copy(p).applyMatrix4(g.matrixWorld).project(camera)
      return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H]
    }
    stopPos.forEach((p, i) => {
      const el = out.labels?.[i]
      if (!el) return
      const [x, y] = toScreen(p)
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    })
    const tip = toScreen(TIP)
    const mid = toScreen(ORIGIN)
    out.onFrame?.({ tip, mid, head: h, glow: smoothstep(0.96, 1, h) })

    if (!ready.current) {
      ready.current = true
      onReady?.()
    }
  })

  return (
    <group ref={tilt} rotation-x={TILT_X}>
      <mesh ref={haloMesh} geometry={geos.halo} material={mats.halo} renderOrder={1} />
      <mesh geometry={geos.core} material={mats.core} renderOrder={2} />
      <mesh ref={trailMesh} geometry={geos.trail} material={mats.trail} renderOrder={3} />
      <mesh geometry={geos.glass} material={mats.glass} renderOrder={5} />

      {stopPos.map((p, i) => (
        <group key={i} position={p}>
          <mesh ref={(el) => (nodeCores.current[i] = el)} geometry={geos.nodeCore} material={mats.nodeCores[i]} renderOrder={4} />
          <mesh geometry={geos.node} material={mats.glass} renderOrder={6} />
          <Glow map={glow} size={0.6} opacity={0} spriteRef={(el) => (nodeGlows.current[i] = el)} renderOrder={7} />
        </group>
      ))}

      {PARTICLES.map((p, i) => (
        <Glow key={i} map={glow} color={PEACH} size={p.size} opacity={0.35} spriteRef={(el) => (parts.current[i] = el)} renderOrder={7} />
      ))}

      <group ref={head}>
        <Glow map={glow} size={1.5} opacity={0.38} renderOrder={8} />
        <Glow map={glow} color={PEACH} size={0.55} opacity={0.75} renderOrder={8} />
        <Glow map={glow} color="#ffffff" size={0.2} opacity={1} renderOrder={8} />
      </group>
      <pointLight ref={headLight} color="#ff9a3d" intensity={0} distance={1.4} decay={2} />
    </group>
  )
}

function Studio() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[3, 6, 5]} intensity={0.8} />
      {/* Product-shot lighting for the glass: a long softbox overhead for
          the bright streak along the top of the tube, a tall strip on
          each side for the edges, and one saffron card low behind so the
          underside picks up the brand colour. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" scale={[14, 1.4, 1]} position={[0, 5, 3]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" scale={[1.2, 8, 1]} position={[-6, 1, 3]} rotation-y={Math.PI / 2.5} />
        <Lightformer form="rect" intensity={1.2} color="#ffe2c4" scale={[1.2, 8, 1]} position={[6, 1, 3]} rotation-y={-Math.PI / 2.5} />
        <Lightformer form="rect" intensity={2.4} color="#f5871e" scale={[12, 2, 1]} position={[0, -4, -2]} rotation-x={-Math.PI / 3} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" scale={3} position={[2, 3, -8]} />
      </Environment>
    </>
  )
}

export default function LoopScene({ progress, overlay, metrics, active, onReady }) {
  return (
    <Canvas
      className="hl-canvas"
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 0, 12] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Studio />
      <Loop progress={progress} overlay={overlay} metrics={metrics} onReady={onReady} />
    </Canvas>
  )
}
