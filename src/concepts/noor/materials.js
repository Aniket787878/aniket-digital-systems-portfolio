import * as THREE from 'three'

/* One clock for every shader here, advanced by the scene. */
export const uTime = { value: 0 }

/* Procedural stone. A MeshPhysicalMaterial with the colour and roughness
   rewritten from object-space fbm noise, so the stone keeps real lighting,
   shadows and the environment's reflections. Two kinds: 'marble' (drifting
   grey-gold veins) and 'travertine' (horizontal strata and small pores). */
const NOISE = /* glsl */ `
varying vec3 vStoneP;
float nHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float nVal(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(nHash(i), nHash(i + vec3(1,0,0)), f.x), mix(nHash(i + vec3(0,1,0)), nHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(nHash(i + vec3(0,0,1)), nHash(i + vec3(1,0,1)), f.x), mix(nHash(i + vec3(0,1,1)), nHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * nVal(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
`

const MARBLE = /* glsl */ `
  vec3 sp = vStoneP * uScale + uSeed;
  float cloud = fbm(sp * 1.6);
  float warp = fbm(sp * 0.8 + vec3(cloud * 1.2));
  float t = sp.x * 0.7 + sp.y * 0.45 + sp.z * 0.2 + warp * 2.6;
  float sv = abs(sin(t * 3.14159));
  float core = 1.0 - smoothstep(0.0, 0.06, sv);
  float halo = 1.0 - smoothstep(0.0, 0.5, sv);
  float t2 = sp.x * 1.6 - sp.y * 0.9 + fbm(sp * 2.4) * 3.0;
  float thread = (1.0 - smoothstep(0.0, 0.03, abs(sin(t2 * 3.14159)))) * smoothstep(0.45, 0.7, cloud);
  float stoneVein = clamp(core * 0.9 + halo * 0.28 + thread * 0.35, 0.0, 1.0);
  vec3 stoneBase = mix(uBase, uBase2, smoothstep(0.3, 0.8, cloud));
  vec3 stoneVeinCol = mix(uVein, uVein2, smoothstep(0.35, 0.65, warp));
  diffuseColor.rgb = mix(stoneBase, stoneVeinCol, stoneVein * 0.75);
`

const TRAVERTINE = /* glsl */ `
  vec3 sp = vStoneP * uScale + uSeed;
  float band = fbm(vec3(sp.x * 0.35, sp.y * 7.0, sp.z * 0.35) + fbm(sp * 1.3) * 0.8);
  float cloud = fbm(sp * 2.5);
  float pores = smoothstep(0.78, 0.9, nVal(sp * vec3(22.0, 60.0, 22.0)));
  float stoneVein = smoothstep(0.52, 0.7, band) * 0.6 + pores * 0.6;
  vec3 stoneBase = mix(uBase, uBase2, smoothstep(0.25, 0.8, cloud));
  diffuseColor.rgb = mix(stoneBase, uVein, clamp(stoneVein, 0.0, 1.0) * 0.7);
`

export function makeStone({ kind = 'marble', base, base2, vein, vein2, scale = 1, seed = 0, ...params }) {
  const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, ...params })
  const uniforms = {
    uBase: { value: new THREE.Color(base) },
    uBase2: { value: new THREE.Color(base2) },
    uVein: { value: new THREE.Color(vein) },
    uVein2: { value: new THREE.Color(vein2 || vein) },
    uScale: { value: scale },
    uSeed: { value: new THREE.Vector3(seed * 3.1, seed * 1.7, seed * 5.3) }
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStoneP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStoneP = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform vec3 uBase; uniform vec3 uBase2; uniform vec3 uVein; uniform vec3 uVein2; uniform float uScale; uniform vec3 uSeed;\n${NOISE}`
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${kind === 'marble' ? MARBLE : TRAVERTINE}`)
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + stoneVein * 0.18 - (1.0 - cloud) * 0.06, 0.05, 1.0);'
      )
  }
  mat.customProgramCacheKey = () => `noor-${kind}`
  return mat
}

/* The light shaft: an open cone, additive, bright near the lamp and fading
   toward the floor, soft at its silhouette so it reads as lit air. */
export function makeShaftMaterial(reduced) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: {
      uTime,
      uColor: { value: new THREE.Color('#ffc98f') },
      uStrength: { value: 0.8 },
      uStill: { value: reduced ? 1 : 0 }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vView; varying vec3 vLocal;
      void main(){
        vUv = uv; vLocal = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uColor; uniform float uStrength; uniform float uStill;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView; varying vec3 vLocal;
      void main(){
        float edge = pow(abs(dot(normalize(vN), normalize(vView))), 1.6);
        float along = vUv.y;                 // 1 at the lamp, 0 at the floor
        float fall = smoothstep(0.0, 0.35, along) * mix(0.35, 1.0, along);
        float t = uTime * (1.0 - uStill);
        float drift = 0.75 + 0.25 * sin(vLocal.y * 1.3 + atan(vLocal.x, vLocal.z) * 3.0 + t * 0.35);
        float a = edge * fall * drift * uStrength;
        gl_FragColor = vec4(uColor * a, a);
      }`
  })
}

/* Dust: a few hundred warm motes that drift slowly inside the shaft.
   All motion is in the vertex shader, so the CPU does nothing per frame. */
export function makeDustMaterial(dpr) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uTime,
      uSize: { value: 70 * dpr },
      uColor: { value: new THREE.Color('#ffd7a8') }
    },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uSize; varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * 0.12 + aSeed * 40.0;
        p.x += sin(t * 0.9 + aSeed * 6.0) * 0.18;
        p.y += sin(t * 0.6 + aSeed * 13.0) * 0.22 - mod(uTime * 0.02 + aSeed, 1.0) * 0.15;
        p.z += cos(t * 0.7 + aSeed * 9.0) * 0.18;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.35 + aSeed * 0.9) / -mv.z;
        vA = (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.8 + aSeed * 30.0)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a * vA * 0.75;
        gl_FragColor = vec4(uColor * a, a);
      }`
  })
}

/* A soft warm glow that always sits behind the sculpture, like light
   pooling on a gallery wall. */
export function makeGlowMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color('#6b4424') }, uColor2: { value: new THREE.Color('#2a1c12') } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec3 uColor2; varying vec2 vUv;
      void main(){
        vec2 q = vUv - vec2(0.42, 0.58);
        q.x *= 1.25;
        float d = length(q);
        float core = smoothstep(0.42, 0.0, d);
        float halo = smoothstep(0.62, 0.1, d);
        vec3 c = uColor * core * core * 0.9 + uColor2 * halo * 0.7;
        gl_FragColor = vec4(c, max(core, halo) * 0.95);
      }`
  })
}
