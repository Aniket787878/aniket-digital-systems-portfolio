import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer
} from 'three'

/*
  The stream of light, after the Relay reference: hundreds of hairline
  threads bundled into one twisting ribbon. The ribbon follows a cubic
  Bezier spine and narrows to a pinch, where the threads overlap so
  densely that additive blending burns them white. Bright packets run
  along the threads, and sparks drift with them.

  Everything is placed in the vertex shader from a handful of uniforms
  (the spine's four points, widths, the pinch), so a frame costs one draw
  for the threads and one for the sparks, and the JavaScript side only
  moves eight numbers. Coordinates are CSS pixels of the viewport, y down.

  This module only draws. Ribbon.jsx decides where the spine goes for the
  current scroll position and calls frame().
*/

const PATH = /* glsl */ `
  uniform vec2 uP0;
  uniform vec2 uP1;
  uniform vec2 uP2;
  uniform vec2 uP3;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uWMax;
  uniform float uWMin;
  uniform float uPinchT;
  uniform float uPinchW;
  uniform float uTwist;
  // 0 where the ribbon is the subject (hero, close), 1 where it sits
  // behind text: there the pinch, packets and sparks lose their burn.
  uniform float uCalm;

  vec2 bez(float t) {
    float u = 1.0 - t;
    return u * u * u * uP0 + 3.0 * u * u * t * uP1 + 3.0 * u * t * t * uP2 + t * t * t * uP3;
  }

  vec2 bezD(float t) {
    float u = 1.0 - t;
    return 3.0 * u * u * (uP1 - uP0) + 6.0 * u * t * (uP2 - uP1) + 3.0 * t * t * (uP3 - uP2);
  }

  float pinchAt(float t) {
    float k = (t - uPinchT) / uPinchW;
    return exp(-k * k);
  }

  // Where a thread with offset s (-1..1) and seed sits at t. Returns the
  // point, and in .z how much the ribbon faces the viewer there.
  vec3 place(float t, float s, float seed) {
    vec2 d = bezD(t);
    vec2 n = normalize(vec2(-d.y, d.x) + 1e-5);
    float pinch = pinchAt(t);
    float breathe = 0.86 + 0.14 * sin(t * 3.1 + uTime * 0.2);
    float w = mix(uWMax, uWMin, pinch) * breathe;
    // The twist: a flat band turning about its spine, so its projected
    // width swings, and where it turns edge-on the threads crowd and burn.
    float phi = t * uTwist + uTime * 0.16 + seed * 0.5;
    float off = w * s * cos(phi);
    // One slow wave, nearly in step across threads, so the band moves
    // like silk rather than each hair twitching on its own.
    off += sin(t * 6.0 - uTime * 0.45 + seed * 2.0) * 9.0 * (1.0 - pinch);
    return vec3(bez(t) + n * off, abs(sin(phi)));
  }

  vec4 toClip(vec2 p) {
    return vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  }
`

const THREAD_VERT = /* glsl */ `
  ${PATH}
  attribute float aT;
  attribute float aS;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vPulse;

  void main() {
    vec3 q = place(aT, aS, aSeed);
    gl_Position = toClip(q.xy);
    float pinch = pinchAt(aT);
    float ends = smoothstep(0.0, 0.07, aT) * smoothstep(1.0, 0.9, aT);
    vColor = aColor;
    vAlpha = aAlpha * (0.45 + 0.55 * q.z) * (0.4 + 1.6 * pinch * (1.0 - 0.7 * uCalm)) * ends;
    // A packet: a sharp head with a tail behind it, running from t=0 to
    // t=1. Only some threads carry one at a time, so it reads as current
    // rather than a scrolling pattern.
    float f = fract(aT * 1.1 - uTime * 0.22 + aSeed * 17.0);
    vPulse = pow(f, 9.0) * 0.6 * step(0.55, fract(aSeed * 7.13)) * ends * (1.0 - 0.8 * uCalm);
  }
`

const THREAD_FRAG = /* glsl */ `
  uniform float uGain;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vPulse;

  void main() {
    vec3 c = vColor * vAlpha + vec3(1.0, 0.93, 0.82) * vPulse * 0.9;
    gl_FragColor = vec4(c * uGain, 1.0);
  }
`

const SPARK_VERT = /* glsl */ `
  ${PATH}
  uniform float uDpr;
  attribute float aT;
  attribute float aS;
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    float t = fract(aT + uTime * aSpeed);
    vec3 q = place(t, aS, aSeed);
    gl_Position = toClip(q.xy + vec2(sin(uTime * 0.4 + aSeed * 30.0), cos(uTime * 0.3 + aSeed * 20.0)) * 5.0);
    float ends = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.85, t);
    float twinkle = 0.6 + 0.4 * sin(uTime * 1.2 + aSeed * 50.0);
    vAlpha = ends * twinkle * (0.35 + 0.9 * pinchAt(t)) * (1.0 - 0.7 * uCalm);
    gl_PointSize = aSize * uDpr;
  }
`

const SPARK_FRAG = /* glsl */ `
  uniform float uGain;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vec3(1.0, 0.78, 0.5) * a * uGain, 1.0);
  }
`

// Saffron first, then the warm and cool threads that give it depth. The
// reference mixes a few cool threads into its lime; here a dim steel blue
// does the same job against the saffron.
const PALETTE = [
  [0.52, '#f5871e', 0.2],
  [0.2, '#ffc89a', 0.16],
  [0.14, '#ff5a1f', 0.18],
  [0.08, '#ffe2b8', 0.12],
  [0.06, '#7fa8d8', 0.1]
]

// Raw sRGB, not three's Color: that converts to linear light, and these
// shaders write straight to the screen with no conversion back.
const rgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16) / 255,
  g: parseInt(hex.slice(3, 5), 16) / 255,
  b: parseInt(hex.slice(5, 7), 16) / 255
})

function pickColour(r) {
  let acc = 0
  for (const [share, hex, alpha] of PALETTE) {
    acc += share
    if (r <= acc) return [rgb(hex), alpha]
  }
  return [rgb(PALETTE[0][1]), PALETTE[0][2]]
}

// Seeded so the ribbon is the same on every visit.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function buildThreads(count, steps) {
  const rand = rng(7)
  const n = count * steps * 2
  const aT = new Float32Array(n)
  const aS = new Float32Array(n)
  const aSeed = new Float32Array(n)
  const aColor = new Float32Array(n * 3)
  const aAlpha = new Float32Array(n)
  const pos = new Float32Array(n * 3)
  let v = 0
  for (let i = 0; i < count; i++) {
    // Denser in the middle of the band, like a real bundle of fibres.
    const r = rand() * 2 - 1
    const s = Math.sign(r) * Math.pow(Math.abs(r), 1.5)
    const seed = rand()
    const [col, alpha] = pickColour(rand())
    const a = alpha * (0.6 + rand() * 0.8)
    for (let j = 0; j < steps; j++) {
      for (const k of [j, j + 1]) {
        aT[v] = k / steps
        aS[v] = s
        aSeed[v] = seed
        aColor[v * 3] = col.r
        aColor[v * 3 + 1] = col.g
        aColor[v * 3 + 2] = col.b
        aAlpha[v] = a
        v++
      }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aT', new BufferAttribute(aT, 1))
  g.setAttribute('aS', new BufferAttribute(aS, 1))
  g.setAttribute('aSeed', new BufferAttribute(aSeed, 1))
  g.setAttribute('aColor', new BufferAttribute(aColor, 3))
  g.setAttribute('aAlpha', new BufferAttribute(aAlpha, 1))
  return g
}

function buildSparks(count) {
  const rand = rng(11)
  const attrs = { aT: [], aS: [], aSeed: [], aSpeed: [], aSize: [] }
  for (let i = 0; i < count; i++) {
    attrs.aT.push(rand())
    attrs.aS.push((rand() * 2 - 1) * 1.15)
    attrs.aSeed.push(rand())
    attrs.aSpeed.push(0.012 + rand() * 0.03)
    attrs.aSize.push(1.5 + Math.pow(rand(), 3) * 4)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
  for (const [k, list] of Object.entries(attrs)) g.setAttribute(k, new BufferAttribute(new Float32Array(list), 1))
  return g
}

export function createRibbon(canvas, { threads, steps, sparks, dpr, antialias = true }) {
  const renderer = new WebGLRenderer({ canvas, antialias, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)

  const uniforms = {
    uP0: { value: new Vector2() },
    uP1: { value: new Vector2() },
    uP2: { value: new Vector2() },
    uP3: { value: new Vector2() },
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uWMax: { value: 300 },
    uWMin: { value: 4 },
    uPinchT: { value: 0.6 },
    uPinchW: { value: 0.16 },
    uTwist: { value: 5 },
    uGain: { value: 1 },
    uCalm: { value: 0 },
    uDpr: { value: dpr }
  }

  const common = { uniforms, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending }
  const scene = new Scene()
  const lines = new LineSegments(
    buildThreads(threads, steps),
    new ShaderMaterial({ ...common, vertexShader: THREAD_VERT, fragmentShader: THREAD_FRAG })
  )
  lines.frustumCulled = false
  scene.add(lines)
  let dots = null
  if (sparks > 0) {
    dots = new Points(buildSparks(sparks), new ShaderMaterial({ ...common, vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG }))
    dots.frustumCulled = false
    scene.add(dots)
  }
  // The shaders write clip space themselves; render() still wants a camera.
  const camera = new OrthographicCamera()

  return {
    resize(w, h) {
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w, h)
    },
    /* shape: { p: [[x,y] x4], wMax, wMin, pinchT, pinchW, twist, gain, calm } */
    frame(time, shape) {
      uniforms.uTime.value = time
      shape.p.forEach(([x, y], i) => uniforms[`uP${i}`].value.set(x, y))
      uniforms.uWMax.value = shape.wMax
      uniforms.uWMin.value = shape.wMin
      uniforms.uPinchT.value = shape.pinchT
      uniforms.uPinchW.value = shape.pinchW
      uniforms.uTwist.value = shape.twist
      uniforms.uGain.value = shape.gain
      uniforms.uCalm.value = shape.calm ?? 0
      renderer.render(scene, camera)
    },
    dispose() {
      lines.geometry.dispose()
      lines.material.dispose()
      if (dots) {
        dots.geometry.dispose()
        dots.material.dispose()
      }
      renderer.dispose()
    }
  }
}
