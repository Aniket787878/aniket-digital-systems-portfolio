import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  Mesh,
  OneFactor,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
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
  moves a few numbers. Coordinates are CSS pixels of the viewport, y down.

  Each thread is a thin strip of triangles, not a GL line, so it can be
  drawn at any width with its own soft edge:

  - in focus (hero, close) a strip is about 2.5 device pixels across with a
    feathered profile: a hairline that never breaks up into stair-steps or
    flickers as it moves, with no multisampling needed;
  - behind text (uCalm 1) the strips widen into soft bands while their
    brightness per pixel drops by the same factor, so the ribbon goes out
    of focus continuously, in the shader. There is no CSS blur on the
    canvas (a filter on a full-screen layer re-rasterises it every frame,
    and stepping its radius pops on Safari).

  Out of focus the threads are wide enough to blend into one glow, so most
  of them fade out (by rank, over a band, never popping) and are dropped
  from the draw call; the rest are brightened to keep the total light.

  Text the ribbon must not shout over (the close band's paragraph and
  email, the hero lede) is passed in as soft rectangles: threads and
  sparks dim as they cross them, with a feathered edge.

  This module only draws. Ribbon.jsx decides where the spine goes for the
  current scroll position and calls frame().
*/

/* ---- Shapes (used by Ribbon.jsx; here so they load with this chunk) ---- */

export const WIDE = {
  hero: { p: [[1.02, -0.16], [0.62, 0.3], [0.28, 0.98], [0.98, 1.2]], w: 0.34, wMin: 9, pinchT: 0.6, pinchW: 0.12, twist: 5.2, gain: 1 },
  a: { p: [[0.44, -0.25], [-0.12, 0.3], [0.42, 0.72], [0.02, 1.25]], w: 0.62, wMin: 130, pinchT: 0.5, pinchW: 0.26, twist: 4.2, gain: 0.45 },
  b: { p: [[0.08, -0.25], [0.6, 0.34], [-0.06, 0.66], [0.4, 1.25]], w: 0.62, wMin: 130, pinchT: 0.5, pinchW: 0.26, twist: 4.6, gain: 0.45 },
  close: { p: [[1.0, -0.3], [0.55, 0.1], [0.1, 0.6], [0.45, 0.95]], w: 0.36, wMin: 8, pinchT: 0.82, pinchW: 0.12, twist: 5, gain: 1 }
}

// Phones: the hero stacks, so the ribbon runs more upright and narrower.
// Between the hero and the close the text spans the whole screen and there
// is no blur, so the ribbon there is wide, loose and very dim. In the
// close the buttons stack, so the pinch sits later on the spine: the
// stream ends on "Book the free call" instead of running on down through
// the button under it.
export const NARROW = {
  hero: { p: [[1.6, -0.15], [1.05, 0.3], [0.7, 0.95], [1.4, 1.15]], w: 0.28, wMin: 6, pinchT: 0.6, pinchW: 0.13, twist: 4.6, gain: 0.75 },
  a: { p: [[0.7, -0.2], [-0.2, 0.3], [0.9, 0.7], [0.2, 1.2]], w: 0.6, wMin: 150, pinchT: 0.5, pinchW: 0.26, twist: 4, gain: 0.55 },
  b: { p: [[0.2, -0.2], [1.1, 0.35], [0.0, 0.65], [0.8, 1.2]], w: 0.6, wMin: 150, pinchT: 0.5, pinchW: 0.26, twist: 4.2, gain: 0.55 },
  close: { p: [[1.3, -0.3], [0.9, 0.1], [0.1, 0.6], [0.5, 0.95]], w: 0.5, wMin: 7, pinchT: 0.9, pinchW: 0.13, twist: 4.6, gain: 0.95 }
}

// Text the threads dim behind, with how much: the lede and the small
// print most, the big headline a little. Only while that section's shape
// is in play.
export const TEXT = {
  hero: [['.sh-pill', 0.6], ['.sh-title', 0.35], ['.sh-lede', 0.8], ['.sh-foot', 0.8]],
  close: [['.cl-pill', 0.6], ['.cl-title', 0.4], ['.cl-lede', 0.92], ['.cl-email', 0.92], ['.cl-actions .btn-light', 0.92]]
}

// Tight bounds of an element's text (a block's own box is often much
// wider than its lines), in page coordinates.
export function textRect(el, range) {
  range.selectNodeContents(el)
  const r = range.getBoundingClientRect()
  if (!r.width || !r.height) return null
  return [r.left, r.top + window.scrollY, r.right, r.bottom + window.scrollY]
}

const lerp = (a, b, k) => a + (b - a) * k
const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

export function bez(p, t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]]
}

// A key shape in pixels. `w` is a fraction of the viewport's short-ish
// side (height on wide screens, width on phones). With a target, the
// spine is shifted so its pinch sits on it.
export function place(key, W, H, wide, target) {
  let p = key.p.map(([x, y]) => [x * W, y * H])
  if (target) {
    const [px, py] = bez(p, key.pinchT)
    const dx = target[0] - px
    const dy = target[1] - py
    p = p.map(([x, y]) => [x + dx, y + dy])
  }
  return { ...key, p, wMax: key.w * (wide ? H : W), calm: target ? 0 : 1 }
}

export function mix(a, b, k) {
  return {
    p: a.p.map(([x, y], i) => [lerp(x, b.p[i][0], k), lerp(y, b.p[i][1], k)]),
    wMax: lerp(a.wMax, b.wMax, k),
    wMin: lerp(a.wMin, b.wMin, k),
    pinchT: lerp(a.pinchT, b.pinchT, k),
    pinchW: lerp(a.pinchW, b.pinchW, k),
    twist: lerp(a.twist, b.twist, k),
    gain: lerp(a.gain, b.gain, k),
    calm: lerp(a.calm ?? 1, b.calm ?? 1, k)
  }
}

export function centre(el, dx = 0, dy = 0) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return [r.left + r.width / 2 + dx, r.top + r.height / 2 + dy]
}

/* ---- Drawing ---- */

const RECTS = 10

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
  // behind text: there the pinch, packets and sparks lose their burn and
  // the threads go soft.
  uniform float uCalm;
  // Text to keep clear: x0, y0, x1, y1 in CSS pixels, and how much to dim.
  uniform vec4 uRect[${RECTS}];
  uniform float uRectK[${RECTS}];

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

  float roundRect(vec2 p, vec4 r, float rad) {
    vec2 c = 0.5 * (r.xy + r.zw);
    vec2 b = 0.5 * (r.zw - r.xy);
    vec2 q = abs(p - c) - b + rad;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;
  }

  // 1 = full light, falling to (1 - k) inside a text rectangle, with a
  // 44px feather outside it so the dimming has no edge.
  float clearText(vec2 p) {
    float keep = 1.0;
    for (int i = 0; i < ${RECTS}; i++) {
      if (uRectK[i] > 0.0) {
        float d = roundRect(p, uRect[i], 14.0);
        keep *= 1.0 - uRectK[i] * (1.0 - smoothstep(-6.0, 44.0, d));
      }
    }
    return keep;
  }

  vec4 toClip(vec2 p) {
    return vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  }
`

const THREAD_VERT = /* glsl */ `
  ${PATH}
  uniform float uDpr;
  // Current pixel ratio over the one the ribbon was tuned at, so dropping
  // the resolution while out of focus doesn't change the brightness.
  uniform float uDprScale;
  // Half-width of a thread at full calm, CSS pixels.
  uniform float uSoft;
  // Share of threads drawn (above 1: all). Fades by rank over 0.12.
  uniform float uKeep;
  attribute float aT;
  attribute float aS;
  attribute float aSeed;
  attribute float aSide;
  attribute float aRank;
  attribute vec3 aColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSide;
  varying float vT;
  varying float vSeed;
  varying float vPulse;

  void main() {
    vec3 q = place(aT, aS, aSeed);
    // The strip's sideways direction follows the thread itself, not the
    // spine, so a thread swinging across the band keeps its width.
    float e = aT < 0.995 ? 0.004 : -0.004;
    vec2 dir = (place(aT + e, aS, aSeed).xy - q.xy) * sign(e);
    vec2 n = normalize(vec2(-dir.y, dir.x) + 1e-6);
    // Half-width in device pixels: a sub-pixel core plus one pixel of
    // feather in focus, a wide soft band out of it.
    float hw = mix(0.4, uSoft * uDpr, uCalm) + 1.0;
    gl_Position = toClip(q.xy + n * aSide * hw / uDpr);

    float pinch = pinchAt(aT);
    float ends = smoothstep(0.0, 0.07, aT) * smoothstep(1.0, 0.9, aT);
    float shown = 1.0 - smoothstep(uKeep - 0.12, uKeep, aRank);
    float lift = 1.0 / clamp(uKeep - 0.06, 0.08, 1.0);
    float clear = clearText(q.xy);
    // The profile below integrates to hw device pixels; dividing by it
    // keeps each thread's total light the same at any width.
    float energy = uDprScale / hw;
    vColor = aColor;
    vAlpha = aAlpha * (0.45 + 0.55 * q.z) * (0.4 + 1.6 * pinch * (1.0 - 0.7 * uCalm)) * ends * shown * lift * clear * energy;
    vSide = aSide;
    vT = aT;
    vSeed = aSeed;
    // Packets: only some threads carry one at a time, so it reads as
    // current rather than a scrolling pattern. The head is drawn per
    // pixel in the fragment shader so it glides instead of stepping from
    // one vertex to the next.
    vPulse = 0.6 * step(0.55, fract(aSeed * 7.13)) * ends * (1.0 - 0.8 * uCalm) * shown * lift * clear * energy;
  }
`

const THREAD_FRAG = /* glsl */ `
  uniform float uGain;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSide;
  varying float vT;
  varying float vSeed;
  varying float vPulse;

  void main() {
    float profile = 1.0 - smoothstep(0.0, 1.0, abs(vSide));
    // A packet: a sharp head with a tail behind it, running from t=0 to t=1.
    float f = fract(vT * 1.1 - uTime * 0.22 + vSeed * 17.0);
    float pulse = pow(f, 9.0) * vPulse;
    vec3 c = vColor * vAlpha + vec3(1.0, 0.93, 0.82) * pulse * 0.9;
    c *= profile * uGain;
    // Premultiplied light: alpha only as strong as the colour, so a dim
    // fringe adds a little light instead of painting the page black.
    gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
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
    vec2 p = q.xy + vec2(sin(uTime * 0.4 + aSeed * 30.0), cos(uTime * 0.3 + aSeed * 20.0)) * 5.0;
    gl_Position = toClip(p);
    float ends = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.85, t);
    float twinkle = 0.6 + 0.4 * sin(uTime * 1.2 + aSeed * 50.0);
    vAlpha = ends * twinkle * (0.35 + 0.9 * pinchAt(t)) * (1.0 - 0.7 * uCalm) * clearText(p);
    gl_PointSize = aSize * uDpr;
  }
`

const SPARK_FRAG = /* glsl */ `
  uniform float uGain;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    vec3 c = vec3(1.0, 0.78, 0.5) * a * uGain;
    gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
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

// One strip per thread: (steps + 1) pairs of vertices, two triangles per
// step. Threads are stored in rank order, so drawing the first N indices
// draws the first N threads.
function buildThreads(count, steps) {
  const rand = rng(7)
  const per = (steps + 1) * 2
  const n = count * per
  const aT = new Float32Array(n)
  const aS = new Float32Array(n)
  const aSeed = new Float32Array(n)
  const aSide = new Float32Array(n)
  const aRank = new Float32Array(n)
  const aColor = new Float32Array(n * 3)
  const aAlpha = new Float32Array(n)
  const index = new Uint32Array(count * steps * 6)
  let v = 0
  let x = 0
  for (let i = 0; i < count; i++) {
    // Denser in the middle of the band, like a real bundle of fibres.
    const r = rand() * 2 - 1
    const s = Math.sign(r) * Math.pow(Math.abs(r), 1.5)
    const seed = rand()
    const [col, alpha] = pickColour(rand())
    const a = alpha * (0.6 + rand() * 0.8)
    const rank = (i + 0.5) / count
    const base = v
    for (let j = 0; j <= steps; j++) {
      for (const side of [-1, 1]) {
        aT[v] = j / steps
        aS[v] = s
        aSeed[v] = seed
        aSide[v] = side
        aRank[v] = rank
        aColor[v * 3] = col.r
        aColor[v * 3 + 1] = col.g
        aColor[v * 3 + 2] = col.b
        aAlpha[v] = a
        v++
      }
    }
    for (let j = 0; j < steps; j++) {
      const k = base + j * 2
      index[x++] = k
      index[x++] = k + 1
      index[x++] = k + 2
      index[x++] = k + 1
      index[x++] = k + 3
      index[x++] = k + 2
    }
  }
  const g = new BufferGeometry()
  g.setIndex(new BufferAttribute(index, 1))
  g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3))
  g.setAttribute('aT', new BufferAttribute(aT, 1))
  g.setAttribute('aS', new BufferAttribute(aS, 1))
  g.setAttribute('aSeed', new BufferAttribute(aSeed, 1))
  g.setAttribute('aSide', new BufferAttribute(aSide, 1))
  g.setAttribute('aRank', new BufferAttribute(aRank, 1))
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

/*
  threads, steps, sparks: the budget. dpr: the pixel ratio the ribbon is
  tuned at. soft: thread half-width at full calm, CSS px. keepCalm: share
  of threads still drawn at full calm.
*/
export function createRibbon(canvas, { threads, steps, sparks, dpr, soft = 8, keepCalm = 1.12 }) {
  // No multisampling: the strips anti-alias themselves, and a 4x buffer
  // at 2x pixels is a lot of memory traffic for a background.
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  let size = [1, 1]
  let dprNow = dpr

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
    uDpr: { value: dpr },
    uDprScale: { value: 1 },
    uSoft: { value: soft },
    uKeep: { value: 1.12 },
    uRect: { value: Array.from({ length: RECTS }, () => new Vector4()) },
    uRectK: { value: new Array(RECTS).fill(0) }
  }

  // Pure addition, colour and alpha alike. (three's AdditiveBlending
  // weights the source by its alpha, which made every touched pixel
  // opaque: dim threads showed as black streaks over the page.)
  const common = {
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneFactor
  }
  const scene = new Scene()
  const geometry = buildThreads(threads, steps)
  const lines = new Mesh(geometry, new ShaderMaterial({ ...common, vertexShader: THREAD_VERT, fragmentShader: THREAD_FRAG }))
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
      size = [w, h]
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w, h)
    },
    // Drop the resolution while the ribbon is out of focus (its threads
    // are many pixels wide then, so nothing visible is lost).
    setDpr(d) {
      if (d === dprNow) return
      dprNow = d
      renderer.setPixelRatio(d)
      renderer.setSize(size[0], size[1], false)
      uniforms.uDpr.value = d
      uniforms.uDprScale.value = d / dpr
    },
    /* shape: { p: [[x,y] x4], wMax, wMin, pinchT, pinchW, twist, gain, calm }
       rects: up to 10 of [x0, y0, x1, y1, k] in CSS px */
    frame(time, shape, rects = []) {
      const calm = shape.calm ?? 0
      uniforms.uTime.value = time
      shape.p.forEach(([x, y], i) => uniforms[`uP${i}`].value.set(x, y))
      uniforms.uWMax.value = shape.wMax
      uniforms.uWMin.value = shape.wMin
      uniforms.uPinchT.value = shape.pinchT
      uniforms.uPinchW.value = shape.pinchW
      uniforms.uTwist.value = shape.twist
      uniforms.uGain.value = shape.gain
      uniforms.uCalm.value = calm
      const keep = 1.12 + (keepCalm - 1.12) * calm
      uniforms.uKeep.value = keep
      geometry.setDrawRange(0, Math.min(threads, Math.ceil(keep * threads)) * steps * 6)
      for (let i = 0; i < RECTS; i++) {
        const r = rects[i]
        if (r) uniforms.uRect.value[i].set(r[0], r[1], r[2], r[3])
        uniforms.uRectK.value[i] = r ? r[4] : 0
      }
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
