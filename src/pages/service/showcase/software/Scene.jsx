import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, ContactShadows, Environment, Lightformer, RoundedBox, Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import interWoff from '@fontsource/inter/files/inter-latin-500-normal.woff'
import { SCREEN_SRC, TOOLS, explodeAt, focusAt, litAt, smooth } from './content.js'

/*
  "Inside the software": the product as an exploded view. Four slabs (the
  screen, the rules, the records, the tools it talks to) driven by one
  scroll progress value. Loaded only through React.lazy() from
  SoftwareShowcase.jsx, so three.js never enters the main bundle.

  Per-frame work lives in useFrame and writes to refs (and, for the DOM
  labels beside the canvas, straight to their style), never React state.
*/

const SAFFRON = new THREE.Color('#f5871e')
const PEACH = new THREE.Color('#ffc89a')

// Slab footprint matches the screenshot's 1.6 aspect.
const W = 4.2
const D = 2.625
const T = 0.11
const GAP_SHUT = 0.2
const GAP_OPEN = 1.42

/* One soft round sprite, reused by every glow: additive sprites are the
   bloom here, without a postprocessing pass. */
function makeGlowTexture() {
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.2, 'rgba(255,255,255,0.55)')
  r.addColorStop(0.5, 'rgba(255,255,255,0.12)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* A rounded rectangle in the XZ plane with 0..1 UVs, for the screen face
   and the etched panels (ShapeGeometry's own UVs are in shape units). */
function roundedRectGeometry(w, d, r) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + d - r)
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  s.lineTo(x + r, y + d)
  s.quadraticCurveTo(x, y + d, x, y + d - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  const geo = new THREE.ShapeGeometry(s, 12)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / d)
  }
  // Lay it flat: the shape's +y (image top) ends up at -z, the far edge,
  // which is the top when the slab is seen from the front.
  geo.rotateX(-Math.PI / 2)
  return { geo, shape: s }
}

function outlinePoints(shape, y) {
  return shape.getPoints(12).map((p) => new THREE.Vector3(p.x, y, -p.y))
}

/* Fine highlight along a slab's top edge: the thing that makes a bevelled
   slab read as machined rather than a grey box. */
function EdgeLine({ w, d, r, y, color = '#ffffff', opacity = 0.28, lineRef }) {
  const geo = useMemo(() => {
    const { shape } = roundedRectGeometry(w, d, r)
    return new THREE.BufferGeometry().setFromPoints(outlinePoints(shape, y))
  }, [w, d, r, y])
  return (
    <lineLoop geometry={geo}>
      <lineBasicMaterial ref={lineRef} color={color} transparent opacity={opacity} toneMapped={false} />
    </lineLoop>
  )
}

function Glow({ glow, color = SAFFRON, size = 0.4, opacity = 0.7, spriteRef, ...rest }) {
  return (
    <sprite ref={spriteRef} scale={[size, size, 1]} {...rest}>
      <spriteMaterial
        map={glow}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
}

/* Every slab dims to 40% when another has focus. Rather than hand-wiring
   each material, walk the slab once per frame and scale what each kind of
   material uses for brightness from a remembered base value. */
function applyLevel(root, level, glowMul = 1) {
  root.traverse((o) => {
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []
    for (const mat of mats) {
      const u = mat.userData
      if (u.baseColor === undefined) {
        u.baseColor = mat.color ? mat.color.clone() : null
        u.baseOpacity = mat.opacity
        u.baseEnv = mat.envMapIntensity
        u.baseEmissive = mat.emissiveIntensity
      }
      if (mat.blending === THREE.AdditiveBlending) {
        mat.opacity = u.baseOpacity * level * glowMul
      } else if (mat.isLineBasicMaterial) {
        mat.opacity = u.baseOpacity * level
      } else if (u.baseColor) {
        mat.color.copy(u.baseColor).multiplyScalar(0.35 + 0.65 * level)
        if (u.baseEnv !== undefined) mat.envMapIntensity = u.baseEnv * (0.3 + 0.7 * level)
        if (u.baseEmissive !== undefined) mat.emissiveIntensity = u.baseEmissive * level
      }
    }
  })
}

/* ---------- 1. The screen ---------- */

function ScreenSlab({ glow, bodyRef, faceRef, edgeRef, haloRef }) {
  // three clamps anisotropy to what the GPU supports, so 8 is safe.
  const tex = useTexture(SCREEN_SRC, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.generateMipmaps = true
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.needsUpdate = true
  })
  const face = useMemo(() => roundedRectGeometry(W - 0.14, D - 0.14, 0.09).geo, [])

  return (
    <group>
      {/* The overhead Lightformer used to catch this body's clearcoat and
          transmission full-on, drawing a hard bright band across the top
          slab right where the screen reads. Glass stays on the edge line
          only now; the bezel itself is a flat, matte-ish housing. */}
      <RoundedBox args={[W, T, D]} radius={0.055} smoothness={4} ref={bodyRef}>
        <meshPhysicalMaterial color="#1b1a1c" roughness={0.32} metalness={0.15} clearcoat={0} envMapIntensity={0.8} />
      </RoundedBox>
      {/* Unlit on purpose: the capture must read as a real screen, not a
          print on a surface, and tone mapping would wash it out. */}
      <mesh geometry={face} position={[0, T / 2 + 0.002, 0]}>
        <meshBasicMaterial ref={faceRef} map={tex} toneMapped={false} />
      </mesh>
      <EdgeLine w={W - 0.02} d={D - 0.02} r={0.06} y={T / 2 + 0.003} lineRef={edgeRef} opacity={0.35} />
      {/* Behind the slab, so it reads as light spilling round the screen's
          edges; in front, the billboard would cut across the capture. */}
      <Glow glow={glow} size={9} opacity={0} position={[0, -0.4, -2.4]} spriteRef={haloRef} />
    </group>
  )
}

/* ---------- 2. The rules ---------- */

const NODES = [
  [-1.55, -0.72], [-1.5, 0.62], [-0.45, -0.1], [0.55, -0.82], [0.62, 0.7], [1.55, -0.05], [-0.4, 0.95]
]
const EDGES = [[0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5], [6, 4], [1, 6]]

function DarkSlab({ color = '#141416' }) {
  return (
    <RoundedBox args={[W, T, D]} radius={0.055} smoothness={4}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.32}
        metalness={0.55}
        clearcoat={0.8}
        clearcoatRoughness={0.18}
        envMapIntensity={1.1}
      />
    </RoundedBox>
  )
}

function RulesSlab({ glow }) {
  // Kept low: when the stack is shut there is only a hair of room
  // between slabs, and nothing may poke through the one above.
  const top = T / 2 + 0.02
  const curves = useMemo(
    () =>
      EDGES.map(([a, b]) => {
        const A = new THREE.Vector3(NODES[a][0], top, NODES[a][1])
        const B = new THREE.Vector3(NODES[b][0], top, NODES[b][1])
        const M = A.clone().lerp(B, 0.5)
        M.y += 0.045
        return new THREE.CatmullRomCurve3([A, M, B])
      }),
    [top]
  )
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 40, 0.011, 6, false)), [curves])
  const pulses = useRef([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    pulses.current.forEach((s, i) => {
      if (!s) return
      const k = (t * 0.42 + i * 0.37) % 1
      curves[i].getPointAt(k, s.position)
      // Fade by size, not opacity: applyLevel owns opacity for dimming.
      const f = 0.3 * Math.sin(Math.PI * k)
      s.scale.set(f, f, 1)
    })
  })

  return (
    <group>
      <DarkSlab />
      <EdgeLine w={W - 0.02} d={D - 0.02} r={0.06} y={T / 2 + 0.003} opacity={0.18} />
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={SAFFRON} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
      {NODES.map(([x, z], i) => (
        <group key={i} position={[x, top, z]}>
          <mesh>
            <sphereGeometry args={[0.05, 20, 16]} />
            <meshBasicMaterial color={PEACH} toneMapped={false} />
          </mesh>
          <Glow glow={glow} size={0.55} opacity={0.75} />
        </group>
      ))}
      {curves.map((_, i) => (
        <sprite key={i} ref={(el) => (pulses.current[i] = el)} scale={[0.3, 0.3, 1]}>
          <spriteMaterial
            map={glow}
            color={PEACH}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  )
}

/* ---------- 3. The records ---------- */

const ROWS = [-0.72, 0, 0.72]
const PER_ROW = 7
const SPAN = 3.6
const CARD = [0.44, 0.035, 0.32]

function RecordsSlab() {
  const inst = useRef()
  const geo = useMemo(() => new RoundedBoxGeometry(CARD[0], CARD[1], CARD[2], 3, 0.015), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const c = new THREE.Color()
    for (let r = 0; r < ROWS.length; r++) {
      for (let i = 0; i < PER_ROW; i++) {
        // One card per row carries the saffron edge: the entry being filed.
        c.set(i === (r * 3 + 2) % PER_ROW ? '#f5a45c' : '#aaa39c')
        inst.current.setColorAt(r * PER_ROW + i, c)
      }
    }
    inst.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let r = 0; r < ROWS.length; r++) {
      const speed = 0.16 + r * 0.05
      for (let i = 0; i < PER_ROW; i++) {
        const u = (((i / PER_ROW + t * speed * (r % 2 ? -1 : 1) * 0.25) % 1) + 1) % 1
        const x = -SPAN / 2 + u * SPAN
        // Cards grow in at one end and shrink out at the other, so the
        // rows read as entries moving through, not a looping belt.
        const s = smooth(0, 0.12, u) * smooth(1, 0.88, u)
        dummy.position.set(x, T / 2 + CARD[1] / 2 + 0.012, ROWS[r])
        dummy.scale.setScalar(Math.max(0.001, s))
        dummy.updateMatrix()
        inst.current.setMatrixAt(r * PER_ROW + i, dummy.matrix)
      }
    }
    inst.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <DarkSlab color="#161517" />
      <EdgeLine w={W - 0.02} d={D - 0.02} r={0.06} y={T / 2 + 0.003} opacity={0.18} />
      {ROWS.map((z) => (
        <mesh key={z} position={[0, T / 2 + 0.004, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[SPAN + 0.3, 0.46]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.035} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
      <instancedMesh ref={inst} args={[geo, undefined, ROWS.length * PER_ROW]}>
        <meshPhysicalMaterial
          roughness={0.15}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </instancedMesh>
    </group>
  )
}

/* ---------- 4. The tools it talks to ---------- */

// Four sockets along the front edge; a cable from each runs over the edge
// and out to its tool, fanned out towards the viewer.
const SOCKET_X = [-1.38, -0.46, 0.46, 1.38]
const SOCKET_Z = D / 2 - 0.36
const TILE_Z = D / 2 + 0.85

function ToolsSlab({ glow }) {
  const top = T / 2
  const floor = -T / 2 + 0.04
  const cables = useMemo(
    () =>
      SOCKET_X.map((x) => {
        const c = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, top + 0.03, SOCKET_Z),
          new THREE.Vector3(x * 1.02, top + 0.1, D / 2 + 0.02),
          new THREE.Vector3(x * 1.1, floor + 0.02, D / 2 + 0.42),
          new THREE.Vector3(x * 1.16, floor + 0.02, TILE_Z - 0.24)
        ])
        return new THREE.TubeGeometry(c, 40, 0.017, 8, false)
      }),
    [top, floor]
  )

  return (
    <group>
      <DarkSlab />
      <EdgeLine w={W - 0.02} d={D - 0.02} r={0.06} y={T / 2 + 0.003} opacity={0.18} />
      {SOCKET_X.map((x) => (
        <group key={x} position={[x, top, SOCKET_Z]}>
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.03, 32]} />
            <meshPhysicalMaterial color="#0c0c0d" roughness={0.3} metalness={0.8} envMapIntensity={1.2} />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
            <torusGeometry args={[0.12, 0.01, 8, 40]} />
            <meshBasicMaterial color={SAFFRON} toneMapped={false} />
          </mesh>
          <Glow glow={glow} size={0.5} opacity={0.45} position={[0, 0.05, 0]} />
        </group>
      ))}
      {cables.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshPhysicalMaterial color="#2a292d" roughness={0.3} metalness={0.4} clearcoat={0.6} envMapIntensity={1.2} />
        </mesh>
      ))}
      {TOOLS.map((name, i) => (
        <group key={name} position={[SOCKET_X[i] * 1.16, floor, TILE_Z]}>
          <RoundedBox args={[0.78, 0.07, 0.46]} radius={0.028} smoothness={3}>
            <meshPhysicalMaterial
              color="#1a191b"
              roughness={0.15}
              metalness={0.25}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={1.2}
            />
          </RoundedBox>
          <EdgeLine w={0.76} d={0.44} r={0.028} y={0.037} color="#f5871e" opacity={0.85} />
          <Glow glow={glow} size={1} opacity={0.2} position={[0, 0.05, 0]} />
          <Billboard position={[0, 0.02, 0.5]}>
            <Text font={interWoff} fontSize={0.15} color="#f2f0ed" anchorX="center" anchorY="top" letterSpacing={-0.01}>
              {name}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  )
}

/* ---------- The light stream through all four ---------- */

const STREAM_X = -1.25
const STREAM_Z = 0.4

function Stream({ glow, core, haze, pulse, rings }) {
  return (
    <group position={[STREAM_X, 0, STREAM_Z]}>
      <mesh ref={core}>
        <cylinderGeometry args={[0.009, 0.009, 1, 8, 1, true]} />
        <meshBasicMaterial color={PEACH} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={haze}>
        <cylinderGeometry args={[0.05, 0.05, 1, 12, 1, true]} />
        <meshBasicMaterial color={SAFFRON} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <sprite ref={pulse} scale={[0.55, 0.55, 1]}>
        <spriteMaterial map={glow} color={PEACH} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      {[0, 1, 2, 3].map((i) => (
        <sprite key={i} ref={(el) => (rings.current[i] = el)} scale={[0.36, 0.36, 1]}>
          <spriteMaterial map={glow} color={SAFFRON} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
    </group>
  )
}

/* ---------- Choreography ---------- */

const tmp = new THREE.Vector3()

function placeLabel(el, y, lead, opacity) {
  el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
  el.style.setProperty('--lead', `${lead.toFixed(1)}px`)
  el.style.opacity = opacity.toFixed(3)
}
const CORNERS = [[W / 2, D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [-W / 2, -D / 2]]

function Rig({ progress, labels, metrics, glow, onReady }) {
  const group = useRef()
  const ready = useRef(false)
  const s0 = useRef()
  const s1 = useRef()
  const s2 = useRef()
  const s3 = useRef()
  const levels = useRef([1, 1, 1, 1])
  const screenFace = useRef()
  const screenEdge = useRef()
  const halo = useRef()
  const core = useRef()
  const haze = useRef()
  const pulse = useRef()
  const rings = useRef([])

  useFrame((state, dt) => {
    if (!ready.current) {
      ready.current = true
      onReady?.()
    }
    const { camera, size } = state
    const slabs = [s0, s1, s2, s3]
    const p = progress.get()
    const e = explodeAt(p)
    const focus = focusAt(p)
    const lit = litAt(p)
    const t = state.clock.elapsedTime
    const gap = GAP_SHUT + (GAP_OPEN - GAP_SHUT) * e

    // Stack: the bottom slab stays on the floor, the rest lift off it.
    slabs.forEach((r, i) => r.current && (r.current.position.y = (3 - i) * gap))

    // Slow turn: a gentle sway so it always feels alive, plus a drift with
    // scroll so the exploded view comes round a little as you read.
    if (group.current) group.current.rotation.y = -0.62 + 0.1 * Math.sin(t * 0.25) + (p - 0.4) * 0.35

    // Focus: damped, so switching layers cross-fades instead of popping.
    const k = 1 - Math.exp(-dt * 7)
    const glowMul = smooth(0.04, 0.3, e)
    for (let i = 0; i < 4; i++) {
      const target = focus === -1 ? 1 : focus === i ? 1.12 : 0.4
      levels.current[i] += (target - levels.current[i]) * k
      // Glows are billboards: with the stack shut they would shine up
      // through the slab above, so the lower layers only glow once apart.
      if (slabs[i].current) applyLevel(slabs[i].current, Math.min(1, levels.current[i]), i === 0 ? 1 : glowMul)
    }

    // The screen: bright but not blown when resting, fully lit at the end.
    const screenFocus = smooth(1, 1.1, levels.current[0])
    const glowUp = Math.max(lit, screenFocus)
    if (screenFace.current) {
      // Unlit and mostly full-bright even out of focus: this is meant to
      // read as a real screen, not a print that dims like the other slabs.
      const base = 0.86 + 0.14 * glowUp
      screenFace.current.color.setScalar(base * (0.72 + 0.28 * Math.min(1, levels.current[0])))
    }
    if (screenEdge.current) {
      screenEdge.current.color.lerpColors(new THREE.Color('#ffffff'), SAFFRON, lit)
      screenEdge.current.opacity = 0.35 + 0.5 * lit
    }
    if (halo.current) halo.current.material.opacity = 0.04 + 0.13 * glowUp

    // Data stream: visible once the layers have room between them; a
    // pulse runs top to bottom and back.
    const s = { core, haze, pulse, rings }
    if (core.current) {
      const vis = smooth(0.25, 0.7, e)
      const h = 3 * gap + 0.02
      s.core.current.scale.y = h
      s.core.current.position.y = h / 2
      s.haze.current.scale.y = h
      s.haze.current.position.y = h / 2
      s.core.current.material.opacity = 0.85 * vis
      s.haze.current.material.opacity = 0.14 * vis
      const u = (t * 0.32) % 2
      const pp = u < 1 ? 1 - u : u - 1
      s.pulse.current.position.y = pp * h
      s.pulse.current.material.opacity = vis
      s.rings.current.forEach((r, i) => {
        if (!r) return
        const y = (3 - i) * gap + T / 2 + 0.01
        r.position.y = y
        const near = Math.max(0, 1 - Math.abs(pp * h - y) / 0.5)
        r.material.opacity = vis * (0.35 + 0.65 * near)
      })
    }

    // Camera: fit the stack (wider and taller as it opens) inside the
    // frame between the copy and the labels, and tilt down to see the gaps.
    const m = metrics.current
    const W0 = size.width
    const H0 = size.height
    const fx = m.fw ? m.fx : W0 / 2
    const fw = m.fw || W0 * 0.5
    const elev = 0.74 - 0.3 * e
    const extW = 5.9
    const extH = 3.9 + 4.4 * e
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const dH = extH / (2 * tanH * 0.84)
    const dW = extW / (2 * tanH * (W0 / H0) * (fw / W0))
    const d = Math.max(dH, dW)
    const ty = 1.5 * gap - 0.15
    camera.position.set(0, ty + d * Math.sin(elev), d * Math.cos(elev))
    camera.lookAt(0, ty, 0)
    camera.setViewOffset(W0, H0, W0 / 2 - fx, 0, W0, H0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // DOM labels: follow each slab's height and run a leader line back to
    // its nearest corner. Written straight to style: no React per frame.
    const els = labels.current
    if (!els || !group.current) return
    const labelVis = smooth(0.45, 0.9, e)
    let prevBottom = -Infinity
    for (let i = 0; i < 4; i++) {
      const el = els[i]
      const slab = slabs[i].current
      if (!el || !slab) continue
      let maxX = -Infinity
      let sumY = 0
      for (const [cx, cz] of CORNERS) {
        tmp.set(cx, T / 2, cz)
        slab.localToWorld(tmp)
        tmp.project(camera)
        const px = (tmp.x * 0.5 + 0.5) * W0
        const py = (-tmp.y * 0.5 + 0.5) * H0
        if (px > maxX) maxX = px
        sumY += py
      }
      let y = sumY / 4 - 14
      // Keep labels from stacking on top of each other.
      y = Math.max(y, prevBottom + 24)
      // Use the label's opened height while it has focus, so the one
      // below makes room before the lines finish unfolding.
      const h = focus === i ? m.full?.[i] : m.short?.[i]
      prevBottom = y + (h || 40)
      const lead = Math.max(0, m.lx - maxX - 14)
      placeLabel(el, y, lead, labelVis * (focus === -1 ? 0.75 : focus === i ? 1 : 0.42))
    }
  })

  return (
    <group ref={group}>
      {/* Centre slab + tool tiles (which fan out in front) on the turn axis. */}
      <group position={[0, 0, -0.5]}>
        <group ref={s3}>
          <ToolsSlab glow={glow} />
        </group>
        <group ref={s2}>
          <RecordsSlab />
        </group>
        <group ref={s1}>
          <RulesSlab glow={glow} />
        </group>
        <group ref={s0}>
          <ScreenSlab glow={glow} faceRef={screenFace} edgeRef={screenEdge} haloRef={halo} />
        </group>
        <Stream glow={glow} core={core} haze={haze} pulse={pulse} rings={rings} />
        {/* Inside the turning group and baked once: the stack's footprint
            never changes as the slabs lift, so re-rendering the shadow
            every frame would only cost frames. */}
        <ContactShadows position={[0, -0.12, 0.4]} scale={[11, 7]} blur={2.6} far={4} opacity={0.6} resolution={512} frames={1} color="#000000" />
      </group>
    </group>
  )
}

function Studio() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 9, 6]} intensity={1.3} />
      {/* The saffron rim: a hard light from behind-left that draws the
          bevels and edges of every slab in the brand colour. */}
      <directionalLight position={[-6, 1.5, -6]} intensity={1.2} color="#f5871e" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" scale={[12, 5, 1]} position={[0, 7, 2]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" scale={[4, 10, 1]} position={[-7, 2, 3]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={3} color="#f5871e" scale={[2, 6, 1]} position={[7, -0.5, -2]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" scale={4} position={[-2, 4, -9]} />
        <Lightformer form="rect" intensity={0.6} color="#ffffff" scale={[20, 1, 1]} position={[0, -1, 8]} />
      </Environment>
    </>
  )
}

export default function Scene({ progress, labels, metrics, active, onReady }) {
  const glow = useMemo(() => makeGlowTexture(), [])
  return (
    <Canvas
      className="sw3-canvas"
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 28, near: 0.1, far: 120, position: [0, 6, 16] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Studio />
      <Suspense fallback={null}>
        <Rig progress={progress} labels={labels} metrics={metrics} glow={glow} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
