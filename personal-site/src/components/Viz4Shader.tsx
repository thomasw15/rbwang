"use client";
import { useEffect, useRef } from 'react';

export function Viz4Shader({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef<boolean>(paused);
  const freezeTimeRef = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) freezeTimeRef.current = null;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Enable blending for white background with ink overlays
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main(){
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Unbounded SVD — single pass contour-only visualization (WebGL1)
    const fragmentShaderSource = `
      precision highp float;

      uniform vec2 u_resolution;
      uniform float u_time;

      #define CONTOUR_FREQ 9.0     // number of contour cycles across the field
      #define CONTOUR_THIN 0.12    // smaller => thinner lines

      // Iterative scalar field f(uv, t)
      float fField(vec2 uv, float t){
          float d = -t * 0.5;
          float a = 0.0;
          for (float i = 0.0; i < 8.0; i += 1.0){
              a += cos(i - d - a * uv.x);
              d += sin(uv.y * i + a);
          }
          return a; // treat 'a' as the potential
      }

      // map contour value to a thin AA line band
      float contourLine(float f){
          // sin(f * freq) = 0 at contours
          float s = abs(sin(f * CONTOUR_FREQ));
          return smoothstep(CONTOUR_THIN, 0.0, s); // thin, crisp line
      }

      void main(){
          // uv in [-1,1] with aspect correction
          float mr = min(u_resolution.x, u_resolution.y);
          vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / mr;

          float t = u_time * 0.6;

          // base: white
          vec3 col = vec3(1.0);

          // contours of f
          float f = fField(uv, t);
          float cIso = contourLine(f);

          // gentle radial falloff so edges don't get busy
          float fall = smoothstep(1.4, 0.2, length(uv));

          // near-black ink
          vec3 contourColor = vec3(0.10);
          col = mix(col, contourColor, cIso * fall);

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    function animate() {
      if (!gl || !canvas || !program) return;
      const now = performance.now() * 0.001;
      let time = now;
      if (pausedRef.current) {
        if (freezeTimeRef.current === null) freezeTimeRef.current = now;
        time = freezeTimeRef.current;
      } else {
        freezeTimeRef.current = null;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);

      gl.clearColor(1,1,1,1); // white background, shader mixes down from white
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(animate);
    }

    function resize() {
      if (!canvas) return;
      // Use offsetWidth/offsetHeight (layout size), not getBoundingClientRect
      // (painted/visual size) - a CSS transform from an in-flight layout
      // animation on an ancestor (e.g. this card expanding) skews
      // getBoundingClientRect without changing the true layout size, which
      // would permanently lock the canvas to whatever transient size was
      // visible at the exact instant resize() happened to run.
      const target = canvas.parentElement || canvas;
      const rect = { width: target.offsetWidth, height: target.offsetHeight };
      const newWidth = rect.width * window.devicePixelRatio;
      const newHeight = rect.height * window.devicePixelRatio;
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    resize();
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = 800;
      canvas.height = 384;
      canvas.style.width = '100%';
      canvas.style.height = '384px';
    }

    window.addEventListener('resize', resize);

    // Also react to the canvas's own container changing size (e.g. a layout
    // animation resizing it), not just the window - a single mount-time
    // measurement is not enough since the container can change size later
    // without a window resize event ever firing.
    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    setTimeout(() => animate(), 50);
    return () => {
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  );
}


