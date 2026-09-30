import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { buildShapes } from './shapes.js'
import { vertex, fragment } from './shaders.js'
import { bus, sample, KEYS } from './bus.js'

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt))

function Field({ count, still, onReady }) {
  const ref = useRef()
  const mat = useRef()
  const invalidate = useThree((s) => s.invalidate)
  // per-frame working state lives in one ref, so nothing here re-renders
  const st = useRef({ target: { m: 1, x: 0, y: 0, s: 1, o: 1, arc: 0 }, cur: null, intro: still ? 1 : 0, tmp: null })

  const geometry = useMemo(() => {
    const { A, B, C, D, R4 } = buildShapes(count)
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(B, 3))
    g.setAttribute('pA', new BufferAttribute(A, 3))
    g.setAttribute('pB', new BufferAttribute(B, 3))
    g.setAttribute('pC', new BufferAttribute(C, 3))
    g.setAttribute('pD', new BufferAttribute(D, 3))
    g.setAttribute('aRand', new BufferAttribute(R4, 4))
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: still ? 1 : 0 },
      uSpin: { value: 0.6 },
      uSize: { value: 2.6 },
      uPixelRatio: { value: 1 },
      uArc: { value: 0 },
      uOpacity: { value: 1 },
      uPointer: { value: new Vector3(99, 99, 0) },
      uPointerStrength: { value: 0 },
      uDrift: { value: still ? 0 : 1 }
    }),
    [still]
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => {
    onReady?.()
  }, [onReady])

  // Reduced motion: no scrubbing. Each section gets its shape as a still
  // frame, swapped (not animated) when a new section reaches mid-screen.
  useEffect(() => {
    if (!still) return
    let last = -1
    const check = () => {
      const i = stillKey()
      if (i !== last) {
        last = i
        st.current.key = i
        invalidate()
      }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [still, invalidate])

  useFrame(({ camera, gl, clock }, delta) => {
    const dt = Math.min(delta, 0.1)
    const w = st.current
    const { target } = w
    const tmp = (w.tmp ||= new Vector3())
    const u = mat.current.uniforms
    u.uPixelRatio.value = gl.getPixelRatio()
    if (still) {
      const k = KEYS[st.current.key ?? 0]
      Object.assign(target, k.d, bus.mobile ? k.mob : null)
    } else sample(target)
    if (!w.cur) w.cur = { ...target }
    const c = w.cur
    for (const k in target) c[k] = still ? target[k] : damp(c[k], target[k], 5, dt)

    if (!still) {
      // wall-clock, so a slow first second never stretches the gather
      if (w.t0 == null) w.t0 = clock.elapsedTime
      w.intro = Math.min(1, (clock.elapsedTime - w.t0) / 2.6)
      u.uTime.value += dt
      u.uSpin.value += dt * 0.09
    }
    const e = 1 - Math.pow(1 - w.intro, 3)
    u.uProgress.value = c.m * e
    u.uArc.value = c.arc
    u.uOpacity.value = c.o * (0.35 + 0.65 * e)
    u.uSize.value = bus.mobile ? 2.5 : 2.9

    const pts = ref.current
    const p = bus.pointer
    pts.position.set(c.x, c.y, 0)
    pts.scale.setScalar(c.s)
    if (!still) {
      pts.rotation.y = damp(pts.rotation.y, p.x * 0.14, 3, dt)
      pts.rotation.x = damp(pts.rotation.x, -p.y * 0.08, 3, dt)
      camera.position.x = damp(camera.position.x, p.x * 0.18, 2, dt)
      camera.position.y = damp(camera.position.y, p.y * 0.12, 2, dt)
      camera.lookAt(0, 0, 0)
      // pointer onto the z = 0 plane, in world space
      tmp.set(p.x, p.y, 0.5).unproject(camera).sub(camera.position).normalize()
      const d = -camera.position.z / tmp.z
      const px = camera.position.x + tmp.x * d
      const py = camera.position.y + tmp.y * d
      u.uPointer.value.x = damp(u.uPointer.value.x, px, 8, dt)
      u.uPointer.value.y = damp(u.uPointer.value.y, py, 8, dt)
      u.uPointerStrength.value = damp(u.uPointerStrength.value, p.active * e, 3, dt)
    }
  })

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

const STILLS = [
  ['m-hero', 0],
  ['m-story', 7],
  ['m-services', 8],
  ['m-how', 11],
  ['m-fees', 12],
  ['m-contact', 13]
]
function stillKey() {
  const mid = window.innerHeight / 2
  let key = 0
  for (const [id, k] of STILLS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= mid) key = k
  }
  return key
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function Fallback({ onReady }) {
  useEffect(() => {
    onReady?.()
  }, [onReady])
  return (
    <div className="mr-fallback" aria-hidden="true">
      <div className="mr-fallback-globe" />
      <div className="mr-fallback-ring" />
    </div>
  )
}

class Guard extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? <Fallback onReady={this.props.onReady} /> : this.props.children
  }
}

export default function Scene({ still, onReady }) {
  const [ok] = useState(hasWebGL)
  const [loop, setLoop] = useState(still ? 'demand' : 'always')

  useEffect(() => {
    if (still) return
    const onVis = () => setLoop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [still])

  if (!ok) return <Fallback onReady={onReady} />
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <Guard onReady={onReady}>
      <Canvas
        className="mr-canvas"
        aria-hidden="true"
        frameloop={loop}
        dpr={mobile ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 40 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Field count={mobile ? 16000 : 40000} still={still} onReady={onReady} />
      </Canvas>
    </Guard>
  )
}
