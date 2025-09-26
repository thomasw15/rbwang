"use client";
import { useEffect, useRef } from 'react';

export function Viz2Shader({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef<boolean>(paused);
  const freezeTimeRef = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) {
      freezeTimeRef.current = null;
    }
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Enable derivatives for fwidth/dFdx/dFdy
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) {
      console.error('OES_standard_derivatives extension not supported');
      return;
    }

    // Blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Lp Pattern Morph — transparent (only lines), auto p: 1 -> 24 -> 1
    const fragmentShaderSource = `
      #extension GL_OES_standard_derivatives : enable
      precision highp float;

      uniform vec2 u_resolution;
      uniform float u_time;

      #define PI 3.141592653589793

      float tri01(float x){ return 1.0 - abs(fract(x)*2.0 - 1.0); }
      float fwidthSafe(float x){ return max(fwidth(x), 1e-6); }
      float lineAA(float f){ float w = fwidthSafe(f); return 1.0 - smoothstep(0.0, w, abs(f)); }

      // Lp mass m = |x|^p + |y|^p
      float lpMass(vec2 z, float p){ return pow(abs(z.x), p) + pow(abs(z.y), p); }

      // Periodic anti-aliased stripe at m = k/density
      float lpStripe(float m, float density, float phase, float thickness){
          float u  = density*m - phase;
          float du = fwidthSafe(u);
          return 1.0 - smoothstep(0.0, du*thickness, abs(sin(PI*u)));
      }

      // Auto p(t): slow near small p, fast near big p; cycles 1 -> 24 -> 1
      float chooseP(){
          const float pmin = 1.0, pmax = 24.0;
          const float cyc = 0.12;           // overall cycle speed
          const float gammaEase = 2.5;      // >1: slow at small p, fast at large p
          float y = tri01(u_time * cyc);    // 0..1 triangle
          float e = pow(y, gammaEase);
          return mix(pmin, pmax, e);
      }

      void main(){
          vec2 fragCoord = gl_FragCoord.xy;
          vec2 uv = (fragCoord - 0.5*u_resolution.xy) / u_resolution.y;
          float scale = 2.2;                // 2.0 would touch top/bottom exactly
          vec2 z = uv * scale;

          float p = chooseP();
          float m = lpMass(z, p);           // r^p
          float f = m - 1.0;                // unit Lp boundary (m=1)

          // --- Line pattern (transparent background) ---
          float phase = u_time * 0.35;      // drift speed
          float s1 = lpStripe(m,  6.0,  phase,           1.25);
          float s2 = lpStripe(m, 12.0,  phase*1.35+0.2,  1.25);
          float edge = lineAA(f);

          // Colors for the lines (darker palette for visibility)
          vec3 c1    = vec3(0.28, 0.42, 0.72);
          vec3 c2    = vec3(0.22, 0.35, 0.60);
          vec3 cEdge = vec3(0.40, 0.40, 0.40);

          // Compose on transparent background
          vec3 rgb = vec3(0.0);
          float a  = 0.0;

          rgb += c1 * (s1*0.55);  a += s1*0.70;
          rgb += c2 * (s2*0.45);  a += s2*0.60;
          rgb += cEdge * (edge*0.90);    a += edge*1.00;

          a = clamp(a, 0.0, 1.0);
          gl_FragColor = vec4(rgb, a);
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
    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders');
      return;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error('Failed to create program');
      return;
    }

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

      gl.clearColor(0, 0, 0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(animate);
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
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
    setTimeout(() => {
      animate();
    }, 50);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ 
        display: 'block',
        width: '100%',
        height: '100%',
        background: 'transparent'
      }}
    />
  );
}


