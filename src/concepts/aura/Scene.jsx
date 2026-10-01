import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

/*
  Aura's hero: a frosted-glass serum bottle floating in soft studio light.
  The headline is drawn into the 3D scene BEHIND the bottle, so the glass
  genuinely bends it (MeshTransmissionMaterial samples what is behind it).

  Scroll story (full mode only, read from window.scrollY in useFrame):
    hero      bottle centred, headline behind it
    menu      bottle turns 90 degrees and drifts right, headline lifts away
    visit     bottle rises and tips, the serum pools toward the dropper,
              one droplet falls in slow motion onto a glass surface, which
              ripples (shader)
  Still mode (phones, reduced motion): the hero pose only, no scroll scrub.
*/

const BLUSH = '#f3e9e4'
const PLUM = '#2a1420'

const TYPE_Z = -3
const BACK_Z = -9
const SCALE = 0.85
const MID = 0.37 // local y of the bottle's visual middle (body + dropper)

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t) => t * t * (3 - 2 * t)
const mix = (a, b, t) => a + (b - a) * t
const span = (v, a, b) => clamp01((v - a) / (b - a))
const damp = (cur, to, k, dt) => cur + (to - cur) * (1 - Math.exp(-k * dt))

/* ---------- geometry, built once ---------- */

const V = (x, y) => new THREE.Vector2(x, y)

function arc(pts, cx, cy, r, a0, a1, n) {
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n
    pts.push(V(cx + r * Math.cos(a), cy + r * Math.sin(a)))
  }
}

function quad(pts, p0, c, p1, n) {
  for (let i = 1; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    pts.push(V(u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]))
  }
}

function buildGeometry() {
  // Glass: a tall apothecary bottle with a soft shoulder and short neck.
  const glass = [V(0.0001, -1.5)]
  arc(glass, 0.56, -1.36, 0.14, -Math.PI / 2, 0, 8)
  glass.push(V(0.7, 0.66))
  quad(glass, [0.7, 0.66], [0.7, 1.18], [0.27, 1.2], 16)
  glass.push(V(0.26, 1.4), V(0.29, 1.42), V(0.29, 1.47), V(0.0001, 1.47))

  // Liquid: the full inner volume; a clipping plane keeps it level.
  const liquid = [V(0.0001, -1.42)]
  arc(liquid, 0.5, -1.3, 0.12, -Math.PI / 2, 0, 6)
  liquid.push(V(0.62, 0.64))
  quad(liquid, [0.62, 0.64], [0.62, 1.1], [0.2, 1.13], 10)
  liquid.push(V(0.19, 1.36), V(0.0001, 1.36))

  // Dropper bulb: soft rubber, with a waist above the collar.
  const bulb = [V(0.0001, 1.6), V(0.25, 1.6), V(0.25, 1.66), V(0.19, 1.71), V(0.185, 1.78)]
  quad(bulb, [0.185, 1.78], [0.225, 1.84], [0.222, 1.98], 6)
  arc(bulb, 0.0001, 1.98, 0.222, 0, Math.PI / 2, 12)

  return {
    glass: new THREE.LatheGeometry(glass, 96),
    liquid: new THREE.LatheGeometry(liquid, 64),
    bulb: new THREE.LatheGeometry(bulb, 64),
    collar: new THREE.CylinderGeometry(0.315, 0.315, 0.26, 72, 1),
    bead: new THREE.TorusGeometry(0.316, 0.018, 12, 72),
    pipette: new THREE.CylinderGeometry(0.04, 0.03, 2.4, 20, 1),
    label: new THREE.CylinderGeometry(0.706, 0.706, 0.74, 64, 1, true, -0.68, 1.36),
    drop: new THREE.SphereGeometry(0.085, 32, 24)
  }
}

const GEO = buildGeometry()

// Sample points of the inner volume, used to keep the liquid surface level.
const LIQUID_PROBES = []
for (const y of [-1.42, 0.64]) {
  LIQUID_PROBES.push(new THREE.Vector3(0.62, y, 0), new THREE.Vector3(-0.62, y, 0))
  LIQUID_PROBES.push(new THREE.Vector3(0, y, 0.62), new THREE.Vector3(0, y, -0.62))
}
LIQUID_PROBES.push(new THREE.Vector3(0, 1.36, 0))

/* ---------- canvas textures ---------- */

function fontsReady() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve()
  return Promise.all([
    document.fonts.load('400 120px "Instrument Serif"'),
    document.fonts.load('italic 400 120px "Instrument Serif"'),
    document.fonts.load('500 40px "Inter"')
  ]).catch(() => {})
}

function drawType(aspect) {
  const portrait = aspect < 0.9
  const W = portrait ? 1024 : 2048
  const H = Math.round(W / aspect)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = PLUM
  g.textAlign = 'center'
  g.textBaseline = 'alphabetic'
  // Landscape: two lines stacked behind the bottle. Portrait: one line above
  // the bottle and one below, so the words still read on a phone.
  const lines = [['Skin, in its', false], ['best light.', true]]
  const fs = portrait ? W * 0.175 : W * 0.132
  const ys = portrait ? [H * 0.19, H * 0.83] : [H * 0.47 - fs * 0.15, H * 0.47 + fs * 0.75]
  lines.forEach(([txt, italic], i) => {
    g.font = `${italic ? 'italic ' : ''}400 ${fs}px "Instrument Serif", Georgia, serif`
    if ('letterSpacing' in g) g.letterSpacing = `${Math.round(-fs * 0.025)}px`
    g.fillText(txt, W / 2, ys[i])
  })
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function drawLabel() {
  const W = 1024
  const H = 560
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.textAlign = 'center'
  g.fillStyle = PLUM
  g.font = '400 150px "Instrument Serif", Georgia, serif'
  g.fillText('Aura', W / 2, 250)
  g.fillStyle = '#b8894f'
  g.fillRect(W / 2 - 90, 300, 180, 3)
  g.fillStyle = PLUM
  g.font = '500 34px "Inter", system-ui, sans-serif'
  if ('letterSpacing' in g) g.letterSpacing = '12px'
  g.fillText('SKIN STUDIO', W / 2 + 6, 380)
  g.font = '400 28px "Inter", system-ui, sans-serif'
  g.fillStyle = 'rgba(42,20,32,0.7)'
  g.fillText('BANDRA WEST', W / 2 + 6, 440)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// The warm light the serum throws on the surface under the bottle.
function drawCaustic() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(128, 32, 0, 128, 32, 128)
  grd.addColorStop(0, 'rgba(236,150,110,0.75)')
  grd.addColorStop(0.35, 'rgba(226,140,120,0.35)')
  grd.addColorStop(1, 'rgba(226,140,120,0)')
  g.setTransform(1, 0, 0, 0.25, 0, 24)
  g.fillStyle = grd
  g.fillRect(0, -96, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
const causticTex = drawCaustic()

/* ---------- shaders ---------- */

const backdropMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uCenter: { value: new THREE.Color('#fbf4f0') },
    uEdge: { value: new THREE.Color('#e9d6ce') },
    uGlow: { value: new THREE.Color('#f2cfc6') },
    uAspect: { value: 1.6 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uCenter; uniform vec3 uEdge; uniform vec3 uGlow; uniform float uAspect;
    varying vec2 vUv;
    void main() {
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
      float d = length(p - vec2(-0.12, 0.08));
      vec3 col = mix(uCenter, uEdge, smoothstep(0.1, 0.95, d));
      float glow = exp(-pow(length((p - vec2(0.0, -0.2)) * vec2(1.0, 1.4)) * 2.2, 2.0));
      col = mix(col, uGlow, glow * 0.75);
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }
  `,
  toneMapped: false,
  depthWrite: false
})

function makeRippleMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProg: { value: 0 },
      uOpacity: { value: 0 },
      uBase: { value: new THREE.Color('#e7d3cb') },
      uHi: { value: new THREE.Color('#ffffff') },
      uLow: { value: new THREE.Color('#b99186') }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProg; uniform float uOpacity;
      uniform vec3 uBase; uniform vec3 uHi; uniform vec3 uLow;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float d = length(p);
        float disc = smoothstep(1.0, 0.25, d);
        float live = step(0.0001, uProg);
        float fade = pow(1.0 - uProg, 1.6);
        float r = uProg * 0.92;
        float crest = 0.0;
        float trough = 0.0;
        for (int i = 0; i < 4; i++) {
          float fi = float(i);
          float ri = r - fi * 0.11;
          if (ri > 0.0) {
            float w = 0.012 + ri * 0.035;
            float k = 1.0 - fi * 0.2;
            crest += exp(-pow((d - ri) / w, 2.0)) * k;
            trough += exp(-pow((d - ri - w * 1.8) / w, 2.0)) * k;
          }
        }
        crest *= fade * live;
        trough *= fade * live;
        float splash = exp(-d * d * 260.0) * (1.0 - smoothstep(0.0, 0.12, uProg)) * live;
        float sheen = exp(-pow((p.y + 0.2 + p.x * 0.35) * 3.2, 2.0)) * 0.5;
        vec3 col = uBase;
        col = mix(col, uHi, clamp(sheen + crest * 0.95 + splash, 0.0, 1.0));
        col = mix(col, uLow, clamp(trough * 0.55, 0.0, 1.0));
        float a = (0.42 + sheen * 0.35 + crest * 0.5 + trough * 0.3 + splash) * disc * uOpacity;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    toneMapped: false
  })
}

// One scene per page, so these live at module level (they are mutated per frame).
const rippleMat = makeRippleMaterial()
const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10)

/* ---------- scene ---------- */

function Studio({ full, reduced, onReady }) {
  const { camera, viewport } = useThree()
  const vp0 = viewport.getCurrentViewport(camera, [0, 0, 0])
  const vpType = viewport.getCurrentViewport(camera, [0, 0, TYPE_Z])
  const vpBack = viewport.getCurrentViewport(camera, [0, 0, BACK_Z])
  const aspect = vp0.width / vp0.height
  const portrait = aspect < 0.9

  const rig = useRef()
  const body = useRef()
  const liquid = useRef()
  const tip = useRef()
  const drop = useRef()
  const ripple = useRef()
  const typeMesh = useRef()
  const shadow = useRef()
  const caustic = useRef()

  const [fontsOk, setFontsOk] = useState(false)
  useEffect(() => {
    let live = true
    fontsReady().then(() => live && setFontsOk(true))
    return () => {
      live = false
    }
  }, [])

  const aspectKey = Math.round(aspect * 20) / 20
  const typeTex = useMemo(() => (fontsOk ? drawType(aspectKey) : null), [fontsOk, aspectKey])
  const labelTex = useMemo(() => (fontsOk ? drawLabel() : null), [fontsOk])
  const store = useRef({ v: new THREE.Vector3(), s: { a: 0, b: 0, c: 0 }, frames: 0, sent: false, intro: 0 })


  const scale = portrait ? Math.min(SCALE, (vp0.width * 0.5) / 1.4) : SCALE
  const floorY = -vp0.height * 0.36
  const heroY = portrait ? 0.12 : -0.12

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const scratch = store.current
    const s = scratch.s
    const t = state.clock.elapsedTime
    backdropMaterial.uniforms.uAspect.value = aspect

    // Signal the loader once the type exists and a few frames are on screen.
    if (typeTex && !scratch.sent) {
      scratch.frames++
      if (scratch.frames > 3) {
        scratch.sent = true
        onReady && onReady()
      }
    }

    // Scroll progress per chapter.
    let a = 0
    let b = 0
    let c = 0
    if (full) {
      const y = window.scrollY
      const vh = window.innerHeight
      const tr = document.getElementById('treatments')
      const vi = document.getElementById('visit')
      if (tr && vi) {
        const T1 = tr.offsetTop
        const T2 = vi.offsetTop
        const T3 = T2 + vi.offsetHeight
        a = span(y, 0, T1 * 0.9)
        b = span(y, T1, T2)
        c = span(y, T2 - vh * 0.15, T3 - vh)
      }
    }
    const k = reduced ? 100 : 5
    s.a = damp(s.a, a, k, dt)
    s.b = damp(s.b, b, k, dt)
    s.c = damp(s.c, c, k, dt)

    // Entrance: the bottle rises into place and turns to face you.
    scratch.intro = reduced ? 1 : typeTex ? damp(scratch.intro, 1, 1.6, dt) : 0
    const intro = scratch.intro

    const ea = smooth(s.a)
    const tipT = smooth(span(s.c, 0.02, 0.3))

    // Rig position (also carries the contact shadow along x).
    const x = mix(mix(0, vp0.width * 0.2, ea), vp0.width * 0.19, tipT)
    const yPos = mix(heroY, vp0.height * 0.1, tipT) + (1 - intro) * -0.5
    rig.current.position.set(x, yPos, 0)

    // Body rotation: 90 degree turn for the menu, tip for the first visit.
    const px = reduced || !full ? 0 : state.pointer.x
    const py = reduced || !full ? 0 : state.pointer.y
    const bob = reduced ? 0 : Math.sin(t * 1.1) * 0.06
    const b0 = body.current
    b0.position.y = bob
    b0.rotation.y = damp(b0.rotation.y, 0.32 + ea * (Math.PI / 2) + s.b * 0.35 + px * 0.14 - (1 - intro) * 1.2, 6, dt)
    b0.rotation.x = damp(b0.rotation.x, -py * 0.07 + (reduced ? 0 : Math.sin(t * 0.7) * 0.02), 6, dt)
    b0.rotation.z = mix(-0.04 * ea + (reduced ? 0 : Math.sin(t * 0.5) * 0.015), 2.25, tipT)

    // Headline lifts and fades as the menu arrives.
    // It scrolls with the page, exactly like HTML would, and fades early.
    if (typeMesh.current) {
      const scrolled = full ? window.scrollY / window.innerHeight : 0
      typeMesh.current.position.y = scrolled * vpType.height
      typeMesh.current.material.opacity = clamp01(1 - scrolled * 1.6) * clamp01(intro * 1.4)
      typeMesh.current.visible = scrolled < 0.7
    }

    // Keep the serum level: clip the inner volume at a world-space height.
    b0.updateMatrixWorld()
    let lo = Infinity
    let hi = -Infinity
    for (const p of LIQUID_PROBES) {
      scratch.v.copy(p).applyMatrix4(liquid.current.matrixWorld)
      if (scratch.v.y < lo) lo = scratch.v.y
      if (scratch.v.y > hi) hi = scratch.v.y
    }
    clip.constant = lo + (hi - lo) * mix(0.62, 0.42, tipT)

    // One droplet forms at the dropper tip, falls, and hits the glass.
    tip.current.getWorldPosition(scratch.v)
    const grow = smooth(span(s.c, 0.3, 0.44))
    const fall = span(s.c, 0.44, 0.72)
    const d = drop.current
    if (grow <= 0.001 || fall >= 1) {
      d.visible = false
    } else {
      d.visible = true
      const fy = mix(scratch.v.y - 0.1 * grow, floorY + 0.07, fall * fall)
      d.position.set(scratch.v.x, fy, scratch.v.z)
      const stretch = fall > 0 ? 1 + Math.min(fall, 0.5) * 0.7 : 1 + grow * 0.25
      d.scale.set(grow / Math.sqrt(stretch), grow * stretch, grow / Math.sqrt(stretch))
    }

    // The glass surface.
    const rOpacity = smooth(span(s.c, 0.18, 0.34))
    rippleMat.uniforms.uOpacity.value = rOpacity
    rippleMat.uniforms.uProg.value = span(s.c, 0.72, 1)
    ripple.current.visible = rOpacity > 0.01
    ripple.current.position.set(scratch.v.x, floorY, 0)

    if (caustic.current) {
      caustic.current.position.x = x + 0.25
      caustic.current.material.opacity = (1 - tipT) * intro
    }

    // Contact shadow follows the bottle, and gives way to the glass.
    if (shadow.current) {
      shadow.current.position.x = x
      const m = shadow.current.children[0]
      if (m && m.material) m.material.opacity = 0.55 * (1 - rOpacity) * intro
    }
  })

  return (
    <>
      <color attach="background" args={[BLUSH]} />

      <mesh position={[0, 0, BACK_Z]} material={backdropMaterial} renderOrder={-2}>
        <planeGeometry args={[vpBack.width * 1.1, vpBack.height * 1.1]} />
      </mesh>

      {typeTex && (
        <mesh ref={typeMesh} position={[0, 0, TYPE_Z]} renderOrder={-1}>
          <planeGeometry args={[vpType.width, vpType.height]} />
          <meshBasicMaterial map={typeTex} transparent toneMapped={false} depthWrite={false} opacity={0} />
        </mesh>
      )}

      <group ref={rig}>
        <group ref={body}>
          <group scale={scale} position={[0, -MID * scale, 0]}>
            <mesh geometry={GEO.glass} renderOrder={2}>
              <MeshTransmissionMaterial
                samples={full ? 6 : 4}
                resolution={full ? 640 : 512}
                transmission={1}
                thickness={0.8}
                roughness={0.1}
                chromaticAberration={0.04}
                anisotropy={0.3}
                anisotropicBlur={0.1}
                distortion={0.08}
                distortionScale={0.4}
                temporalDistortion={0}
                ior={1.42}
                color="#fff7f4"
                attenuationColor="#f3c4c0"
                attenuationDistance={2.2}
                clearcoat={1}
                clearcoatRoughness={0.08}
                envMapIntensity={1.2}
              />
            </mesh>

            <mesh geometry={GEO.liquid} ref={liquid}>
              <meshPhysicalMaterial
                color="#e79a7c"
                emissive="#b8543e"
                emissiveIntensity={0.18}
                roughness={0.18}
                clearcoat={1}
                transparent
                opacity={0.64}
                depthWrite={false}
                side={THREE.DoubleSide}
                clippingPlanes={[clip]}
              />
            </mesh>

            <mesh geometry={GEO.pipette} position={[0, 0.2, 0]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.1} transparent opacity={0.22} clearcoat={1} />
            </mesh>

            {labelTex && (
              <mesh geometry={GEO.label} position={[0, -0.28, 0]}>
                <meshStandardMaterial map={labelTex} transparent roughness={0.55} depthWrite={false} />
              </mesh>
            )}

            <mesh geometry={GEO.collar} position={[0, 1.49, 0]}>
              <meshStandardMaterial color="#c9a26b" metalness={1} roughness={0.25} />
            </mesh>
            <mesh geometry={GEO.bead} position={[0, 1.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#d8b57f" metalness={1} roughness={0.18} />
            </mesh>
            <mesh geometry={GEO.bead} position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#d8b57f" metalness={1} roughness={0.18} />
            </mesh>

            <mesh geometry={GEO.bulb}>
              <meshPhysicalMaterial color={PLUM} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.3} sheen={1} sheenColor="#8a4a62" />
            </mesh>

            <group ref={tip} position={[0, 2.26, 0]} />
          </group>
        </group>
      </group>

      <group ref={shadow}>
        <ContactShadows
          position={[0, heroY - (1.5 + MID) * scale - 0.02, 0]}
          opacity={0.55}
          scale={4.5}
          blur={2.6}
          far={2.2}
          resolution={256}
          color={PLUM}
        />
      </group>

      <mesh ref={caustic} position={[0.25, heroY - (1.5 + MID) * scale + 0.02, -0.9]} renderOrder={0}>
        <planeGeometry args={[4.2, 1.05]} />
        <meshBasicMaterial map={causticTex} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>

      <mesh ref={drop} geometry={GEO.drop} visible={false}>
        <meshPhysicalMaterial color="#e39a78" emissive="#b8543e" emissiveIntensity={0.3} roughness={0.05} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.6} />
      </mesh>

      <mesh ref={ripple} rotation={[-Math.PI / 2 + 0.55, 0, 0]} material={rippleMat} visible={false} renderOrder={1}>
        <planeGeometry args={[3.4, 3.4]} />
      </mesh>

      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#cdb3aa']} />
        {/* Key: a big soft box, upper left */}
        <Lightformer form="rect" intensity={4.5} color="#fff4ec" position={[-5, 4, 4]} scale={[6, 7, 1]} target={[0, 0, 0]} />
        {/* A tall front strip: the long highlight down the glass */}
        <Lightformer form="rect" intensity={5} color="#ffffff" position={[-2.6, 1, 6]} scale={[0.9, 9, 1]} target={[0, 0, 0]} />
        {/* Rim: a thin strip, behind right */}
        <Lightformer form="rect" intensity={10} color="#ffffff" position={[4, 0.5, -4]} scale={[0.35, 10, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[-3.5, 0, -4]} scale={[0.25, 10, 1]} target={[0, 0, 0]} />
        {/* Warm fill, low right */}
        <Lightformer form="rect" intensity={1.4} color="#ffc6a6" position={[5, -2, 4]} scale={[6, 3, 1]} target={[0, 0, 0]} />
        {/* Plum flags either side: dark reflections that draw the glass edge */}
        <Lightformer form="rect" intensity={1} color="#1a0a12" position={[-7, 0, 1]} scale={[3, 12, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1} color="#1a0a12" position={[7, 0, 2]} scale={[3, 12, 1]} target={[0, 0, 0]} />
        {/* Top glow and a rose bounce from the floor */}
        <Lightformer form="circle" intensity={2} color="#fff8f2" position={[0, 7, 0]} scale={4} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#e8a6a0" position={[0, -6, 2]} scale={[10, 3, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  )
}

export default function Scene({ full, reduced, active, onReady }) {
  return (
    <Canvas
      frameloop={active ? (reduced ? 'demand' : 'always') : 'never'}
      dpr={full ? [1, 1.75] : [1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
    >
      <Studio full={full} reduced={reduced} onReady={onReady} />
      {reduced && <Settle />}
    </Canvas>
  )
}

/* Reduced motion renders on demand: ask for a short run of frames so the
   transmission buffer, environment and fonts all land, then stop. */
function Settle() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let n = 0
    const id = setInterval(() => {
      invalidate()
      if (++n > 40) clearInterval(id)
    }, 100)
    return () => clearInterval(id)
  }, [invalidate])
  return null
}
