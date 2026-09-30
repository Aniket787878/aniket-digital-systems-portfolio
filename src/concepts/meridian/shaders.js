/* Point field shaders. uProgress runs 0..3 across the four shapes
   (0 cloud, 1 globe, 2 chart, 3 ring). Each point leaves on its own small
   delay, so a morph reads as a swarm regrouping rather than a crossfade.
   A divergence-free drift (curl of a cheap trig potential) keeps the field
   alive, strongest mid-morph and in the cloud. */

export const vertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uSpin;
uniform float uSize;
uniform float uPixelRatio;
uniform float uArc;
uniform float uOpacity;
uniform vec3 uPointer;
uniform float uPointerStrength;
uniform float uDrift;

attribute vec3 pA;
attribute vec3 pB;
attribute vec3 pC;
attribute vec3 pD;
attribute vec4 aRand;

varying vec3 vColor;
varying float vAlpha;

const vec3 BRASS = vec3(0.784, 0.643, 0.361);
const vec3 IVORY = vec3(0.945, 0.918, 0.851);
const vec3 LIGHT = vec3(-0.55, 0.5, 0.67);

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }

vec3 curl(vec3 p, float t) {
  float a = 1.3, b = 1.1, c = 1.2, d = 1.4, e = 1.1, f = 1.2;
  float t1 = t, t2 = t * 0.8 + 1.7, t3 = t * 1.1 + 3.1;
  float dzdy = -f * sin(e * p.x + t3) * sin(f * p.y);
  float dydz = c * cos(c * p.z + t2) * cos(d * p.x);
  float dxdz = -b * sin(a * p.y + t1) * sin(b * p.z);
  float dzdx = e * cos(e * p.x + t3) * cos(f * p.y);
  float dydx = -d * sin(c * p.z + t2) * sin(d * p.x);
  float dxdy = a * cos(a * p.y + t1) * cos(b * p.z);
  return vec3(dzdy - dydz, dxdz - dzdx, dydx - dxdy);
}

void shape(int k, out vec3 p, out vec3 col, out float alpha) {
  if (k == 0) {
    p = pA;
    col = mix(IVORY, BRASS * 1.2, aRand.z);
    alpha = 0.75;
  } else if (k == 1) {
    vec3 q = pB;
    if (length(q) > 1.8) q = rotZ(0.42) * rotX(0.28) * q;
    p = rotX(0.34) * rotY(uSpin) * q;
    float lit = dot(normalize(p), normalize(LIGHT));
    float l = smoothstep(-0.15, 0.75, lit);
    col = mix(IVORY * 0.72, BRASS * 1.35, l);
    col = mix(col, IVORY, smoothstep(0.82, 1.0, lit) * 0.6);
    alpha = mix(0.18, 1.15, smoothstep(-0.7, 0.55, lit));
  } else if (k == 2) {
    p = pC;
    float h = clamp((pC.y + 1.3) / 2.75, 0., 1.);
    col = mix(IVORY * 0.85, BRASS * 1.3, smoothstep(0.25, 0.95, h));
    alpha = pC.z < -0.3 ? 0.3 : (pC.z > 0.15 && pC.z < 0.25 ? 1.0 : 0.85);
  } else {
    p = rotZ(-0.32) * rotX(1.08 + sin(uTime * 0.2) * 0.05) * pD;
    float on = smoothstep(uArc + 0.004, uArc - 0.012, aRand.w);
    col = mix(IVORY * 0.7, BRASS * 1.4, on);
    alpha = mix(0.26, 0.6, on);
    if (aRand.w > 1.5) { col = IVORY * 0.6; alpha = 0.18; }
  }
}

void main() {
  float m = clamp(uProgress, 0., 3.);
  int seg = int(min(floor(m), 2.));
  float f = m - float(seg);
  float t = smoothstep(aRand.x, aRand.x + 0.58, f);

  vec3 p0; vec3 c0; float a0;
  vec3 p1; vec3 c1; float a1;
  shape(seg, p0, c0, a0);
  shape(seg + 1, p1, c1, a1);
  vec3 p = mix(p0, p1, t);
  vec3 col = mix(c0, c1, t);
  float alpha = mix(a0, a1, t);

  float cloudW = 1. - clamp(m, 0., 1.);
  float globeW = 1. - clamp(abs(m - 1.), 0., 1.);
  float swirl = sin(t * 3.14159);
  float amp = uDrift * (0.02 + cloudW * 0.22 + swirl * 0.5);
  p += curl(p * 0.9 + aRand.x * 3., uTime * 0.25) * amp;

  vec4 wp = modelMatrix * vec4(p, 1.);
  vec2 dxy = wp.xy - uPointer.xy;
  float dist = length(dxy);
  float push = globeW * uPointerStrength * smoothstep(0.85, 0.0, dist);
  wp.xy += (dxy / max(dist, 0.0001)) * push * 0.32;
  wp.z += push * 0.25;

  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  gl_PointSize = uSize * aRand.y * uPixelRatio * (7.0 / depth);
  float fade = mix(0.3, 1.0, smoothstep(9.2, 5.6, depth));
  vColor = col;
  vAlpha = alpha * fade * uOpacity * (1. + push * 0.8);
}
`

export const fragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  core = core * core * (0.6 + 0.4 * core);
  gl_FragColor = vec4(vColor, core * vAlpha);
}
`
