import { useEffect, useRef } from 'react'

/*
  HeroCanvas — the hero's moving ground.

  A single fullscreen fragment shader (raw WebGL, no three.js) painting a
  slowly drifting, domain-warped noise field in the brand ramp: near-black
  at the bottom where the copy sits, ember through to hot orange up top.

  It layers *over* `.hero-media`'s CSS gradient rather than replacing it,
  so that gradient is the fallback for every case we bail on — no WebGL,
  context lost, reduced motion, or a shader that fails to compile. Nothing
  to detect on the CSS side; the canvas simply never paints.

  Cost control: DPR capped, painting stops when the hero scrolls out of
  view or the tab is hidden, and `prefers-reduced-motion` renders one
  static frame instead of a loop.
*/

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/* Five octaves is the point where another one stops being visible. */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;

  /* Scale by the shorter edge rather than multiplying uv by the aspect
     ratio. Both keep the field from stretching, but the aspect multiply
     squeezes the *entire* field into a narrow strip on a portrait phone
     — which collapses its variance and leaves the hero flat and dark
     exactly where most people will open it. Dividing by the short edge
     holds feature size constant and simply reveals more of the field on
     a tall screen. Pointer bias rides on top for parallax. */
  vec2 p = gl_FragCoord.xy / min(u_res.x, u_res.y);
  p += u_mouse * 0.06;

  float t = u_time * 0.045;

  /* Two rounds of domain warping — this is what turns fbm mush into
     something with flow and direction to it. */
  vec2 q = vec2(
    fbm(p * 1.5 + t),
    fbm(p * 1.5 + vec2(5.2, 1.3) - t)
  );
  vec2 r = vec2(
    fbm(p * 2.0 + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm(p * 2.0 + 3.0 * q + vec2(8.3, 2.8) - 0.126 * t)
  );
  float f = fbm(p * 1.8 + 3.5 * r);

  /* Stretch the noise before it hits the ramp. Summed octaves cluster
     hard around their mean — doubly so once domain-warped — so the raw
     value only ever occupies the middle of 0..1 and every colour stop
     lands in the same muddy band. Remapping the range it actually
     occupies onto the full 0..1 is what buys the contrast. */
  f = smoothstep(0.32, 0.78, f);

  /* Hot at the top, near-black at the bottom where the copy sits. The
     subtraction keeps this a dark hero with fire in it rather than an
     orange wash: only the peaks clear the threshold and reach the hot
     stops, so the accent still reads as an accent. */
  float vert = pow(clamp(uv.y, 0.0, 1.0), 1.5);
  float m = clamp(f * 0.95 + vert * 0.88 - 0.66, 0.0, 1.0);

  vec3 c0 = vec3(0.055, 0.031, 0.010);
  vec3 c1 = vec3(0.388, 0.125, 0.039);
  vec3 c2 = vec3(0.851, 0.271, 0.000);
  vec3 c3 = vec3(1.000, 0.416, 0.071);

  vec3 col = mix(c0, c1, smoothstep(0.00, 0.45, m));
  col = mix(col, c2, smoothstep(0.45, 0.78, m));
  col = mix(col, c3, smoothstep(0.78, 1.00, m));

  /* Dither. Without it the low end of the ramp bands badly on 8-bit. */
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.016;

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function HeroCanvas({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: true
    })
    // No WebGL, or the driver warned it would be software-rendered. Either
    // way the CSS gradient underneath is the better answer.
    if (!gl || gl.isContextLost()) return undefined

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return undefined

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined
    gl.useProgram(program)

    // One oversized triangle covers the clip volume with no index buffer
    // and no diagonal seam, which two triangles would give us.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_res')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    let frame = 0
    let visible = true
    let running = false
    let start = performance.now()
    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const resize = () => {
      // Cap DPR at 1.75: past that this shader costs real milliseconds on
      // phones and nobody can see the difference in a noise field.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      // Reallocating the backing store is the expensive part, so that
      // stays conditional.
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      // Viewport and u_res are re-sent unconditionally, and deliberately.
      // The context outlives the program: a remount on the same canvas
      // (StrictMode's double-mount, Fast Refresh) links a *new* program
      // whose uniforms all start at zero, and if the size happens to be
      // unchanged a conditional update would skip it — leaving u_res at
      // (0,0), dividing gl_FragCoord by zero, and flattening the whole
      // field to the darkest stop of the ramp.
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }

    const draw = (timeSeconds) => {
      gl.uniform1f(uTime, timeSeconds)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const renderStatic = () => {
      resize()
      // A fixed offset rather than 0 — t=0 lands on a flat corner of the
      // noise, which reads as a broken gradient rather than a still.
      draw(12)
    }

    const loop = (now) => {
      if (!running) return
      // Ease toward the pointer so the parallax glides instead of snapping.
      mouse.x += (target.x - mouse.x) * 0.045
      mouse.y += (target.y - mouse.y) * 0.045
      resize()
      draw((now - start) / 1000)
      frame = requestAnimationFrame(loop)
    }

    const play = () => {
      if (running || motionQuery.matches) return
      running = true
      start = performance.now() - 12000
      frame = requestAnimationFrame(loop)
    }

    const pause = () => {
      running = false
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    const sync = () => {
      if (motionQuery.matches) {
        pause()
        renderStatic()
        return
      }
      if (visible && !document.hidden) play()
      else pause()
    }

    const onPointerMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    // Only paint while the hero is actually on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    const onResize = () => {
      resize()
      if (!running) renderStatic()
    }

    // A lost context leaves a transparent canvas and the gradient shows
    // through, so we stop rather than trying to rebuild.
    const onContextLost = (e) => {
      e.preventDefault()
      pause()
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('webglcontextlost', onContextLost)
    motionQuery.addEventListener('change', sync)

    renderStatic()
    sync()

    return () => {
      pause()
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      motionQuery.removeEventListener('change', sync)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
      // Deliberately *not* calling WEBGL_lose_context here. Losing the
      // context is permanent for this canvas element, and a later
      // getContext() hands back the same dead context — which silently
      // kills the shader under StrictMode's double-mount in dev, and on
      // any real remount (navigating off the home page and back). The
      // context is released with the canvas when React removes it.
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={['hero-canvas', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  )
}
