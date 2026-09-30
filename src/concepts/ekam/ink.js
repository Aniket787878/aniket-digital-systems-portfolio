/* The living ink: one full-screen fragment shader drawn with plain WebGL.
   Domain-warped fbm (three levels of warp, after Inigo Quilez), a breath
   uniform that swells the warp and the light, a decaying pointer swirl,
   and four palette colours that the page blends as you scroll. Drawn at a
   fraction of the screen size and scaled up by CSS: the ink is soft, so
   nobody can tell, and it keeps the frame rate high. */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform float u_breath;
uniform vec2 u_mouse;
uniform vec2 u_vel;
uniform float u_swirl;
uniform float u_scroll;
uniform float u_dim;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = M * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // pointer swirl: rotate the field around the pointer, falling off fast
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 d = p - m;
  float fall = exp(-dot(d, d) * 7.0);
  float ang = u_swirl * fall * 2.2;
  float cs = cos(ang);
  float sn = sin(ang);
  d = mat2(cs, -sn, sn, cs) * d;
  p = m + d - u_vel * fall * 0.12;

  float b = u_breath;
  p *= 1.55 - 0.22 * b;
  p.y -= u_scroll;
  float t = u_time * 0.045;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  float w = 3.4 + 1.1 * b;
  vec2 r = vec2(
    fbm(p + w * q + vec2(1.7, 9.2) + 0.6 * t),
    fbm(p + w * q + vec2(8.3, 2.8) - 0.5 * t)
  );
  float f = fbm(p + w * r);

  float fr = smoothstep(0.2, 0.8, f);
  float g = smoothstep(0.36, 0.86, r.x * 1.15 + 0.3 * q.y - 0.1);
  vec3 col = mix(u_c0, u_c1, clamp(fr * fr * 2.4, 0.0, 1.0));
  col = mix(col, u_c2, g * smoothstep(0.25, 0.75, fr) * 0.95);
  col = mix(col, u_c3, pow(smoothstep(0.62, 0.98, fr), 2.0) * 0.85);
  // Inigo Quilez's contrast curve: deep folds go dark, crests catch light
  col *= (fr * fr * fr * 1.1 + 0.6 * fr * fr + 0.55 * fr) * 1.4 + 0.3;

  // silk sheen along the fold lines
  float fold = abs(r.y - q.x);
  col += u_c3 * 0.08 * smoothstep(0.06, 0.0, fold) * fr;

  col *= 0.82 + 0.26 * b;

  float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(aspect * 0.9, 1.1)));
  col *= mix(0.62, 1.0, vig);
  // behind text: compress the highlights first, then sink toward the base
  col = mix(col, col / (1.0 + col * 2.2), clamp(u_dim * 1.8, 0.0, 1.0));
  col = mix(col, u_c0 * 0.6, u_dim * (0.5 + 0.25 * (1.0 - vig)));

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s)
    return null
  }
  return s
}

export function createInk(canvas, { scale = 0.5 } = {}) {
  let gl = null
  try {
    gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: 'high-performance' })
  } catch {
    gl = null
  }
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'a_pos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U = {}
  for (const n of ['res', 'time', 'breath', 'mouse', 'vel', 'swirl', 'scroll', 'dim', 'c0', 'c1', 'c2', 'c3']) {
    U[n] = gl.getUniformLocation(prog, 'u_' + n)
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr * scale))
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr * scale))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
  }

  function render(s) {
    gl.uniform2f(U.res, canvas.width, canvas.height)
    gl.uniform1f(U.time, s.time)
    gl.uniform1f(U.breath, s.breath)
    gl.uniform2f(U.mouse, s.mouse[0], s.mouse[1])
    gl.uniform2f(U.vel, s.vel[0], s.vel[1])
    gl.uniform1f(U.swirl, s.swirl)
    gl.uniform1f(U.scroll, s.scroll)
    gl.uniform1f(U.dim, s.dim)
    gl.uniform3fv(U.c0, s.pal[0])
    gl.uniform3fv(U.c1, s.pal[1])
    gl.uniform3fv(U.c2, s.pal[2])
    gl.uniform3fv(U.c3, s.pal[3])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function destroy() {
    gl.deleteBuffer(buf)
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
  }

  resize()
  return { resize, render, destroy }
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)

/* dawn, midday, dusk, night: base, body, warm accent, highlight */
export const PALETTES = [
  ['#14123a', '#5b3f8c', '#f2a65a', '#f6efe4'],
  ['#0d2638', '#2f6f86', '#f2c46a', '#fbf4e6'],
  ['#260d2b', '#8c3f6a', '#f2855a', '#f8e2c8'],
  ['#070818', '#262c62', '#7a6fc0', '#b8b4de']
].map((p) => p.map(hex))

export function mixPalette(pos, out) {
  const i = Math.min(PALETTES.length - 2, Math.max(0, Math.floor(pos)))
  const f = Math.min(1, Math.max(0, pos - i))
  const a = PALETTES[i]
  const b = PALETTES[i + 1]
  for (let k = 0; k < 4; k++) {
    for (let c = 0; c < 3; c++) out[k][c] = a[k][c] + (b[k][c] - a[k][c]) * f
  }
  return out
}
