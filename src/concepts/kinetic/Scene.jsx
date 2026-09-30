import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

/* The chrome spine. 24 lathe-turned discs on an S-curve with teal joint rings
   between them. Scroll picks a pose (S-curve, straight bar, scattered, ring),
   each disc eases toward its pose with its own delay, and a travelling wave
   driven by scroll speed and pointer X keeps the whole thing moving. */

const N = 14
const SP = 0.6
const L = SP * (N - 1)
const TEAL = new THREE.Color('#00e0c6')
const DIM = new THREE.Color('#1b3a36')
const UP = new THREE.Vector3(0, 1, 0)
const TAU = Math.PI * 2

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const ease = (v) => v * v * (3 - 2 * v)

function makeDisc() {
  const R = 0.48
  const h = 0.06
  const c = 0.05
  const seg = 8
  const pts = [new THREE.Vector2(0.0001, -h)]
  for (let k = 0; k <= seg; k++) {
    const a = -Math.PI / 2 + (k / seg) * (Math.PI / 2)
    pts.push(new THREE.Vector2(R - c + Math.cos(a) * c, -h + c + Math.sin(a) * c))
  }
  pts.push(new THREE.Vector2(R - 0.035, 0))
  for (let k = 0; k <= seg; k++) {
    const a = (k / seg) * (Math.PI / 2)
    pts.push(new THREE.Vector2(R - c + Math.cos(a) * c, h - c + Math.sin(a) * c))
  }
  pts.push(new THREE.Vector2(0.0001, h))
  return new THREE.LatheGeometry(pts, 64)
}

/* Spinous process: a tapered fin off the back of each vertebra, angled down.
   It is what makes a stack of discs read as a spine. */
function makeProcess() {
  const g = new THREE.CylinderGeometry(0.035, 0.1, 0.62, 20, 1)
  g.rotateZ(Math.PI / 2 + 0.42)
  g.scale(1, 1, 0.7)
  g.translate(0.62, -0.12, 0)
  return g
}

function makeJoint(tube) {
  const g = new THREE.TorusGeometry(0.4, tube, 10, 64)
  g.rotateX(Math.PI / 2)
  return g
}

const mkV = () => Array.from({ length: N }, () => new THREE.Vector3())
const mkQ = () => Array.from({ length: N }, () => new THREE.Quaternion())
/* Working buffers. One spine on the page at a time, so module scope is fine. */
const BUF = {
  aP: mkV(), aQ: mkQ(), aS: new Float32Array(N),
  bP: mkV(), bQ: mkQ(),
  cP: mkV(), cQ: mkQ(), cS: new Float32Array(N),
  vel: 0, px: 0, first: true
}

/* Seeded scatter so the explosion looks the same every visit. */
function scatter() {
  let s = 7
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: N }, () => ({
    x: r() - 0.5,
    y: r() - 0.5,
    z: r(),
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * TAU, r() * TAU, r() * TAU))
  }))
}
const SC = scatter()

const _t = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _q2 = new THREE.Quaternion()
const _e = new THREE.Euler()
const _m = new THREE.Matrix4()
const _s = new THREE.Vector3()
const _c = new THREE.Color()

function discSize(i) {
  const s = i / (N - 1)
  return 0.74 + 0.42 * (1 - s)
}

/* S-curve standing upright. lay: { x, y, scale, rotY, amp, px, time } */
function poseS(i, lay, P, Q) {
  const s = i / (N - 1)
  const u = s - 0.5
  const ph = s * 7 - lay.time * 2.6
  const x = 0.34 * Math.sin(u * TAU) + lay.amp * Math.sin(ph) + lay.px * 0.55 * u * u * 4
  const dx = 0.34 * TAU * Math.cos(u * TAU) + lay.amp * 7 * Math.cos(ph) + lay.px * 0.55 * 8 * u
  const z = 0.3 * Math.cos(u * Math.PI)
  const dz = -0.3 * Math.PI * Math.sin(u * Math.PI)
  _t.set(dx, L, dz).normalize()
  Q.setFromUnitVectors(UP, _t)
  _q2.setFromAxisAngle(UP, lay.amp * Math.sin(ph) * 3)
  Q.multiply(_q2)
  _q.setFromAxisAngle(UP, lay.rotY)
  Q.premultiply(_q)
  P.set(x, u * L, z).applyQuaternion(_q).multiplyScalar(lay.scale)
  P.x += lay.x
  P.y += lay.y
  return discSize(i) * lay.scale
}

/* Straight bar lying across the screen. lay: { y, scale, time, amp } */
function poseH(i, lay, P, Q) {
  const s = i / (N - 1)
  const ph = s * 6 - lay.time * 2
  const y = lay.amp * Math.sin(ph)
  _e.set(0.18, 0.34, -Math.PI / 2 + lay.amp * 2 * Math.cos(ph))
  Q.setFromEuler(_e)
  P.set((s - 0.5) * L * lay.scale, lay.y + y, 0)
  return discSize(i) * lay.scale
}

function poseX(i, lay, P, Q, sc) {
  const d = sc[i]
  // Keep every exploded disc within the left 55% of the viewport (world
  // units at this camera), with margin for perspective drift across the
  // z range, so none of them drift over the right-hand text column.
  P.set((-0.35 + d.x * 0.34) * lay.w, d.y * lay.h * 0.92, -3 + d.z * 4)
  _q2.setFromAxisAngle(UP, lay.time * 0.4 + i)
  Q.copy(d.q).multiply(_q2)
  return discSize(i) * 0.9
}

/* Ring, tilted toward the viewer. lay: { x, y, r, time } */
const RING_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.62, -0.38, 0))
function poseR(i, lay, P, Q) {
  const th = (i / N) * TAU + Math.PI / 2 + lay.time * 0.08
  P.set(Math.cos(th) * lay.r, Math.sin(th) * lay.r, 0)
  _t.set(-Math.sin(th), Math.cos(th), 0)
  Q.setFromUnitVectors(UP, _t)
  Q.premultiply(RING_TILT)
  P.applyQuaternion(RING_TILT)
  P.x += lay.x
  P.y += lay.y
  return 0.95 * lay.scale
}

function Spine({ stRef, reduced, onReady }) {
  const discs = useRef()
  const procs = useRef()
  const joints = useRef()
  const halos = useRef()
  const geo = useMemo(
    () => ({ disc: makeDisc(), proc: makeProcess(), joint: makeJoint(0.016), halo: makeJoint(0.045) }),
    []
  )
  useLayoutEffect(() => {
    BUF.first = true
    for (const r of [joints, halos]) {
      for (let i = 0; i < N; i++) r.current.setColorAt(i, TEAL)
      r.current.instanceColor.needsUpdate = true
    }
  }, [])

  useFrame((state, dt) => {
    const buf = BUF
    const sc = SC
    const st = stRef.current
    const { width: w, height: h } = state.viewport
    const time = reduced ? 0 : state.clock.elapsedTime
    const narrow = w / h < 0.8
    dt = Math.min(dt, 0.05)

    // scroll speed and pointer, smoothed
    const v = performance.now() - st.velT < 140 ? st.vel : 0
    buf.vel += (Math.min(v, 4) - buf.vel) * (1 - Math.exp(-dt * 4))
    buf.px += ((reduced ? 0 : st.px) - buf.px) * (1 - Math.exp(-dt * 3))
    const amp = reduced ? 0 : 0.035 + buf.vel * 0.22

    const heroLay = {
      x: narrow ? w * 0.27 : -w * 0.075,
      y: narrow ? h * 0.07 : 0,
      scale: narrow ? 0.62 : 0.94,
      rotY: reduced ? 0.4 : 0.4 + Math.sin(time * 0.35) * 0.18 + buf.px * 0.5,
      amp,
      px: buf.px,
      time
    }
    const k = Math.min(1, (w * 0.84) / L)
    const hLay = { y: h * 0.17, scale: k, time, amp: reduced ? 0 : 0.02 + buf.vel * 0.08 }
    const xLay = { w, h, time }
    const rLay = { x: -w * 0.245, y: -h * 0.02, r: 1.62, scale: 0.95, time }
    const ctaLay = {
      x: w * 0.29,
      y: -h * 0.02,
      scale: 0.8,
      rotY: 0.35 + Math.sin(time * 0.3) * 0.2 + buf.px * 0.4,
      amp,
      px: buf.px,
      time
    }

    const sec = st.section
    const p = st.p
    let mode = 0 // 0 single A, 1 blend A->B by f
    let f = 0
    let litFrac = 1
    let poseA = poseS
    let layA = heroLay
    let poseB = poseS
    let layB = heroLay
    let stagger = 0.35
    if (sec === 's2') {
      poseA = poseS
      layA = heroLay
      poseB = poseH
      layB = hLay
      mode = 1
      f = clamp01(p / 0.42)
    } else if (sec === 's4') {
      if (p < 0.12) {
        poseA = poseH
        layA = hLay
      } else if (p < 0.36) {
        poseA = poseH
        layA = hLay
        poseB = poseX
        layB = xLay
        mode = 1
        f = (p - 0.12) / 0.24
        stagger = 0.5
      } else if (p < 0.56) {
        poseA = poseX
        layA = xLay
        poseB = poseR
        layB = rLay
        mode = 1
        f = (p - 0.36) / 0.2
        stagger = 0.5
      } else {
        poseA = poseR
        layA = rLay
        litFrac = clamp01((p - 0.56) / 0.4)
      }
    } else if (sec === 'cta') {
      poseA = poseS
      layA = ctaLay
    }

    for (let i = 0; i < N; i++) {
      buf.aS[i] = poseA(i, layA, buf.aP[i], buf.aQ[i], sc)
      if (mode === 1) {
        const bs = poseB(i, layB, buf.bP[i], buf.bQ[i], sc)
        const d = (i / (N - 1)) * stagger
        const fi = ease(clamp01((f - d) / (1 - stagger)))
        buf.aP[i].lerp(buf.bP[i], fi)
        buf.aQ[i].slerp(buf.bQ[i], fi)
        buf.aS[i] += (bs - buf.aS[i]) * fi
      }
    }

    // sections entering or leaving carry the spine with them
    const dy = (st.dy || 0) * h
    if (dy) for (let i = 0; i < N; i++) buf.aP[i].y -= dy

    // ease current toward target with a per-disc delay: the spine follows itself
    const snap = buf.first || reduced
    for (let i = 0; i < N; i++) {
      const kk = snap ? 1 : 1 - Math.exp(-dt * (9 - (i % 6) * 0.6))
      buf.cP[i].lerp(buf.aP[i], kk)
      buf.cQ[i].slerp(buf.aQ[i], kk)
      buf.cS[i] += (buf.aS[i] - buf.cS[i]) * kk
      _s.set(buf.cS[i] * 1.16, buf.cS[i], buf.cS[i])
      _m.compose(buf.cP[i], buf.cQ[i], _s)
      discs.current.setMatrixAt(i, _m)
      procs.current.setMatrixAt(i, _m)
    }
    discs.current.instanceMatrix.needsUpdate = true
    procs.current.instanceMatrix.needsUpdate = true

    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N
      const a = buf.cP[i]
      const b = buf.cP[j]
      const d = a.distanceTo(b)
      const vis = clamp01((0.95 - d) / 0.3)
      _t.copy(a).add(b).multiplyScalar(0.5)
      _q.copy(buf.cQ[i]).slerp(buf.cQ[j], 0.5)
      const s = Math.min(buf.cS[i], buf.cS[j]) * vis
      _s.set(s * 1.16, s, s)
      _m.compose(_t, _q, _s)
      joints.current.setMatrixAt(i, _m)
      halos.current.setMatrixAt(i, _m)
      const lit = i / N < litFrac ? 1 : 0
      _c.copy(DIM).lerp(TEAL, lit)
      joints.current.setColorAt(i, _c)
      halos.current.setColorAt(i, _c)
    }
    joints.current.instanceMatrix.needsUpdate = true
    halos.current.instanceMatrix.needsUpdate = true
    joints.current.instanceColor.needsUpdate = true
    halos.current.instanceColor.needsUpdate = true

    if (buf.first) {
      buf.first = false
      if (onReady) requestAnimationFrame(() => onReady())
    }
  })

  return (
    <group>
      <instancedMesh ref={discs} args={[geo.disc, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.12} envMapIntensity={1.15} />
      </instancedMesh>
      <instancedMesh ref={procs} args={[geo.proc, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.18} envMapIntensity={1} />
      </instancedMesh>
      <instancedMesh ref={joints} args={[geo.joint, undefined, N]} frustumCulled={false}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={halos} args={[geo.halo, undefined, N]} frustumCulled={false}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

/* Studio of hard strips: white bars for crisp chrome edges, one teal strip. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#030404']} />
      <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[14, 1.1, 1]} />
      <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[0.5, 12, 1]} />
      <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[6, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[0.35, 12, 1]} />
      <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 0, 9]} scale={[12, 0.25, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[3, 3, 7]} rotation-y={Math.PI} scale={[0.25, 8, 1]} />
      <Lightformer form="rect" intensity={4} color="#00e0c6" position={[-4, -4, 4]} rotation-x={-Math.PI / 3} scale={[10, 0.7, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[14, 0.4, 1]} />
    </Environment>
  )
}

export default function Scene({ stRef, reduced, active, narrow, onReady }) {
  // Start sharp; if the GPU cannot keep up, drop to 1x pixels and stay there.
  const [maxDpr, setMaxDpr] = useState(narrow ? 1.5 : 1.75)
  return (
    <Canvas
      className="k-canvas-el"
      aria-hidden="true"
      dpr={[1, maxDpr]}
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
      <Studio />
      <spotLight position={[4, 6, 6]} angle={0.5} penumbra={0.8} intensity={30} color="#ffffff" />
      <Spine stRef={stRef} reduced={reduced} onReady={onReady} />
    </Canvas>
  )
}
