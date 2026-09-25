import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
  Hero3D — a slow, pointer-reactive network of nodes and links floating in
  the hero's dark negative space. It is on-theme on purpose: the site sells
  systems and automation, and a loose graph reads as exactly that, where a
  spinning logo or a generic blob would read as decoration.

  This whole module is code-split (see Hero.jsx's lazy import), so three.js
  and R3F never land in the first-load bundle. It is only ever mounted on a
  wide viewport with motion allowed — mobile and reduced-motion keep the
  photograph alone.

  Performance posture, per R3F guidance:
  - per-frame work happens in useFrame via refs, never React state
  - geometry is built once in useMemo
  - DPR is capped, the canvas is transparent and non-interactive
  - rendering pauses (frameloop "never") whenever the hero scrolls offscreen
*/

const ACCENT = '#f5871e'
const NODE = '#ffbe73'

/* A soft round sprite for the nodes — square GL points read as compression
   artifacts, a radial-alpha dot reads as a glowing node. Drawn once. */
function makeDotTexture() {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

/* Built once at module load, not during render: the graph is random but
   session-static, and generating it here keeps the impurity (Math.random)
   out of React's render path entirely.

   The field is pushed to the LEFT and centre of the frame — the dark
   negative space behind the copy — and kept clear of the right third where
   the face sits. A CSS mask on the canvas (see .hero-canvas) fades it out
   before it can reach him, so the portrait always stays the hero. */
function buildNetwork() {
  const N = 40
  const pts = []
  for (let i = 0; i < N; i++) {
    const x = -3.3 + Math.random() * 3.6 // roughly -3.3 .. +0.3
    const y = (Math.random() * 2 - 1) * 2.4
    const z = (Math.random() * 2 - 1) * 1.7
    pts.push(new THREE.Vector3(x, y, z))
  }
  const positions = new Float32Array(N * 3)
  pts.forEach((p, i) => {
    positions[i * 3] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  })

  // An edge between any two nodes closer than the threshold — a sparse,
  // organic mesh rather than a full graph (which would grey into a blob).
  const maxDist = 1.5
  const ends = []
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (pts[i].distanceTo(pts[j]) < maxDist) {
        ends.push(pts[i], pts[j])
      }
    }
  }
  const linePositions = new Float32Array(ends.length * 3)
  ends.forEach((p, k) => {
    linePositions[k * 3] = p.x
    linePositions[k * 3 + 1] = p.y
    linePositions[k * 3 + 2] = p.z
  })
  return { positions, linePositions }
}

const { positions, linePositions } = buildNetwork()
const dotTexture = makeDotTexture()

function Network() {
  const group = useRef()

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const d = Math.min(delta, 0.05) // clamp so a stutter never lurches it
    g.rotation.y += d * 0.05
    // Ease toward a tilt/offset driven by the pointer — parallax, so the
    // graph feels like it has depth and follows the cursor without grabbing
    // pointer events (the canvas is pointer-events: none).
    const px = state.pointer.x
    const py = state.pointer.y
    g.rotation.x += (py * 0.22 - g.rotation.x) * 0.04
    g.position.x += (px * 0.5 - g.position.x) * 0.03
    g.position.y += (py * 0.35 - g.position.y) * 0.03
  })

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={NODE}
          map={dotTexture}
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0.8}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export default function Hero3D() {
  const wrapRef = useRef(null)
  const [active, setActive] = useState(true)

  // Pause the render loop while the hero is not on screen.
  useEffect(() => {
    const el = wrapRef.current
    if (!el || !('IntersectionObserver' in window)) return undefined
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.01 }
    )
    io.observe(el)
    const onVis = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div ref={wrapRef} className="hero-canvas" aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, 6], fov: 52 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <Network />
      </Canvas>
    </div>
  )
}
