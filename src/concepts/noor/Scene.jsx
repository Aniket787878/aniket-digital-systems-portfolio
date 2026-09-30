import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { rig, KEYS, KEYS_MOBILE } from './rig.js'
import { makeStone, makeShaftMaterial, makeDustMaterial, makeGlowMaterial, uTime } from './materials.js'

const LAMP = new THREE.Vector3(-6.2, 9.4, 2.2)
const AIM = new THREE.Vector3(-0.1, 0.9, 0)
const BG = '#12100e'

/* An arch in elevation: two legs and a half-round head, drawn as one
   outline so the opening runs down to the slab. */
function archGeometry() {
  const R = 0.95
  const r = 0.56
  const h = 1.75
  const s = new THREE.Shape()
  s.moveTo(-R, 0)
  s.lineTo(-r, 0)
  s.lineTo(-r, h)
  s.absarc(0, h, r, Math.PI, 0, true)
  s.lineTo(r, 0)
  s.lineTo(R, 0)
  s.lineTo(R, h)
  s.absarc(0, h, R, 0, Math.PI, false)
  s.lineTo(-R, 0)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.48,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.022,
    bevelSegments: 3,
    curveSegments: 56
  })
  g.translate(0, 0, -0.24)
  return g
}

function Sculpture({ mobile }) {
  const mats = useMemo(
    () => ({
      marble: makeStone({
        kind: 'marble',
        base: '#e9e2d6',
        base2: '#d8cdbb',
        vein: '#8e8472',
        vein2: '#a98b5a',
        scale: 0.95,
        seed: 1,
        roughness: 0.3,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25
      }),
      nero: makeStone({
        kind: 'marble',
        base: '#2a2521',
        base2: '#1c1916',
        vein: '#b08d55',
        vein2: '#6f6456',
        scale: 1.3,
        seed: 4,
        roughness: 0.28,
        clearcoat: 0.7,
        clearcoatRoughness: 0.2
      }),
      travertine: makeStone({
        kind: 'travertine',
        base: '#cbbb9f',
        base2: '#b9a684',
        vein: '#8c7657',
        scale: 1,
        seed: 2,
        roughness: 0.62,
        clearcoat: 0.08
      }),
      bronze: new THREE.MeshPhysicalMaterial({
        color: '#8a5a2b',
        metalness: 1,
        roughness: 0.35,
        clearcoat: 0.25,
        clearcoatRoughness: 0.4
      })
    }),
    []
  )
  const arch = useMemo(() => archGeometry(), [])
  const seg = mobile ? 48 : 96

  return (
    <group>
      <RoundedBox args={[3.5, 0.36, 1.9]} radius={0.025} smoothness={3} position={[0, 0.18, 0]} castShadow receiveShadow material={mats.travertine} />
      <RoundedBox
        args={[2.55, 0.3, 1.35]}
        radius={0.02}
        smoothness={3}
        position={[0.2, 0.51, 0.05]}
        rotation={[0, 0.16, 0]}
        castShadow
        receiveShadow
        material={mats.nero}
      />
      <group position={[0.05, 0.66, 0.02]} rotation={[0, 0.28, 0]}>
        <mesh geometry={arch} material={mats.marble} castShadow receiveShadow />
        <mesh position={[0, 0.41, 0.03]} material={mats.bronze} castShadow receiveShadow>
          <sphereGeometry args={[0.41, seg, seg / 2]} />
        </mesh>
      </group>
    </group>
  )
}

function Shaft({ reduced, count }) {
  const shaft = useMemo(() => makeShaftMaterial(reduced), [reduced])
  const dust = useMemo(() => makeDustMaterial(Math.min(window.devicePixelRatio || 1, 1.75)), [])
  const { cone, pos, quat, geo } = useMemo(() => {
    const dir = LAMP.clone().sub(AIM)
    const len = dir.length() + 0.4
    const cone = new THREE.ConeGeometry(2.3, len, 64, 1, true)
    const pos = LAMP.clone().add(AIM).multiplyScalar(0.5).add(dir.clone().normalize().multiplyScalar(-0.2))
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    // motes, scattered through the cone, more of them in the lower half
    const d = dir.clone().normalize().negate()
    const a = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1)).normalize()
    const b = new THREE.Vector3().crossVectors(d, a).normalize()
    const p = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    let rnd = 7
    const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < count; i++) {
      const s = 0.2 + Math.pow(rand(), 0.6) * 0.78
      const rr = 2.1 * s * Math.sqrt(rand())
      const th = rand() * Math.PI * 2
      const v = LAMP.clone()
        .addScaledVector(d, s * (len - 0.4))
        .addScaledVector(a, Math.cos(th) * rr)
        .addScaledVector(b, Math.sin(th) * rr)
      p.set([v.x, Math.max(v.y, 0.15), v.z], i * 3)
      seed[i] = rand()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return { cone, pos, quat, geo }
  }, [count])

  useFrame((_, dt) => {
    // reduced motion: a fixed moment, motes caught mid-drift
    uTime.value = reduced ? 12 : uTime.value + Math.min(dt, 0.1)
  })

  return (
    <>
      <mesh geometry={cone} material={shaft} position={pos} quaternion={quat} renderOrder={2} />
      <points geometry={geo} material={dust} renderOrder={3} />
    </>
  )
}

function Glow() {
  const ref = useRef()
  const mat = useMemo(() => makeGlowMaterial(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    const m = ref.current
    if (!m) return
    tmp.set(0, 1.6, 0).sub(camera.position).setY(0).normalize()
    m.position.set(tmp.x * 7, 2.4, tmp.z * 7)
    m.lookAt(camera.position.x, 2.4, camera.position.z)
  })
  return (
    <mesh ref={ref} material={mat} renderOrder={-1}>
      <planeGeometry args={[26, 16]} />
    </mesh>
  )
}

const tmpA = new THREE.Vector3()
const tmpB = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)

function lerpKey(keys, k) {
  const i = Math.max(0, Math.min(keys.length - 1, Math.floor(k)))
  const j = Math.min(keys.length - 1, i + 1)
  const f = Math.max(0, Math.min(1, k - i))
  // hold each pose while its section is read, move in the middle of the gap
  const g = Math.max(0, Math.min(1, (f - 0.2) / 0.6))
  const e = g * g * (3 - 2 * g)
  const A = keys[i]
  const B = keys[j]
  const out = {}
  for (const key in A) out[key] = A[key] + (B[key] - A[key]) * e
  return out
}

function CameraRig({ mobile, reduced, onReady }) {
  const cur = useRef({ k: rig.k, px: 0, py: 0 })
  const ready = useRef(false)
  const { camera, size, invalidate } = useThree()

  useEffect(() => {
    rig.invalidate = reduced ? invalidate : null
    return () => {
      rig.invalidate = null
    }
  }, [reduced, invalidate])

  useFrame((_, dt) => {
    const c = cur.current
    // a very slow frame (tab resumed, weak device): arrive, don't crawl
    const damp = reduced || dt > 0.3 ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) * 2.6)
    c.k += (rig.k - c.k) * damp
    const pd = reduced ? 0 : 1 - Math.exp(-Math.min(dt, 0.05) * 2)
    c.px += (rig.px - c.px) * pd
    c.py += (rig.py - c.py) * pd
    const K = lerpKey(mobile ? KEYS_MOBILE : KEYS, c.k)
    const aspect = size.width / size.height
    const az = K.az + c.px * 0.08
    const el = K.el + c.py * 0.035
    const r = K.r * (aspect < 1.25 && !mobile ? 1.15 : 1)
    tmpA.set(Math.sin(az) * Math.cos(el) * r, K.ty + Math.sin(el) * r, Math.cos(az) * Math.cos(el) * r)
    camera.position.copy(tmpA)
    // sideways framing: slide the look-at point along the camera's right
    tmpB.set(0, K.ty, 0).sub(tmpA).normalize().cross(UP).normalize()
    const ox = K.ox * Math.min(1, aspect / 1.6)
    camera.lookAt(tmpB.x * ox, K.ty, tmpB.z * ox)
    if (!ready.current) {
      ready.current = true
      requestAnimationFrame(() => onReady && onReady())
    }
  })
  return null
}

function Lights({ mobile }) {
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.copy(AIM)
    return o
  }, [])
  const map = mobile ? 1024 : 2048
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={LAMP}
        target={target}
        angle={0.3}
        penumbra={0.55}
        intensity={620}
        decay={2}
        distance={0}
        color="#ffd2a1"
        castShadow
        shadow-mapSize={[map, map]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
        shadow-radius={6}
        shadow-camera-near={4}
        shadow-camera-far={20}
      />
      <directionalLight position={[6, 3, -3]} intensity={0.22} color="#8fa6c8" />
      <pointLight position={[2.8, 3.4, -3.2]} intensity={6} color="#ff9e5c" distance={9} decay={2} />
      <hemisphereLight args={['#2b2622', '#0b0a09', 0.2]} />
    </>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[40, 64]} />
      <meshStandardMaterial color="#231e1a" roughness={0.88} metalness={0} />
    </mesh>
  )
}

export default function Scene({ mobile, reduced, paused, onReady }) {
  const frameloop = paused ? 'never' : reduced ? 'demand' : 'always'
  return (
    <Canvas
      className="noor-canvas"
      aria-hidden="true"
      frameloop={frameloop}
      shadows="soft"
      dpr={mobile ? [1, 1.4] : [1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: mobile ? 34 : 30, near: 0.5, far: 80, position: [0, 3, 12] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(BG, 1)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.fog = new THREE.Fog(BG, 16, 34)
      }}
    >
      <Environment resolution={256} frames={1} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={3} color="#ffd3a0" position={[-5, 6, 3]} scale={[6, 2, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#9fb2d4" position={[6, 2, -2]} scale={[4, 3, 1]} target={[0, 1, 0]} />
        <Lightformer form="ring" intensity={1.2} color="#ffb877" position={[0, 5, -6]} scale={3} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.25} color="#ffffff" position={[0, -3, 4]} scale={[10, 2, 1]} target={[0, 1, 0]} />
      </Environment>
      <Glow />
      <Floor />
      <Sculpture mobile={mobile} />
      <Lights mobile={mobile} />
      <Shaft reduced={reduced} count={mobile ? 140 : 360} />
      <CameraRig mobile={mobile} reduced={reduced} onReady={onReady} />
    </Canvas>
  )
}
