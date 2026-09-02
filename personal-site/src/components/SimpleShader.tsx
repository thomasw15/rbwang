"use client";
import { useEffect, useRef } from 'react';

export function SimpleShader({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef<boolean>(paused);
  const freezeTimeRef = useRef<number | null>(null);

  // Keep paused flag in a ref so the animate loop sees updates
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
    
    // Enable OES_standard_derivatives extension for fwidth, dFdx, dFdy
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) {
      console.error('OES_standard_derivatives extension not supported');
      return;
    }
    
    console.log('WebGL context created successfully');
    console.log('OES_standard_derivatives extension enabled');
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    
    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Simple vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Exact GLSL shader - your mathematical visualization
    const fragmentShaderSource = `
      #extension GL_OES_standard_derivatives : enable
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      #define PI 3.14159265359
      #define ROT_SPEED   0.6
      
      #define SPHERE_R     0.48
      #define GRID_PX      1.10
      #define CHORD_PX     1.10
      #define DOT_PX       1.65
      #define N_TRI        42.0
      #define NUM_CHORDS   42
      #define BASE_LIFE    2.1
      #define LIFE_JITTER  0.40
      
      const vec3 RED   = vec3(1.0,0.0,0.0);
      const vec3 GREEN = vec3(0.0,1.0,0.0);
      const vec3 BLUE  = vec3(0.0,0.8,1.0);
      const vec3 WHITE = vec3(1.0,1.0,0.97);
      
      vec3 mix3(vec3 a, vec3 b, vec3 c, float t){
          return (t>0.5) ? mix(b,c,t*2.0-1.0) : mix(a,b,t*2.0);
      }
      vec3 orientColor(vec3 dir){
          float t = sin(dir.x*1.2 + u_time*0.55)*0.5 + 0.5;
          float lift = 0.55 + 0.45*clamp(dir.z*0.5 + 0.5, 0.0, 1.0);
          return mix3(RED, GREEN, BLUE, t) * lift;
      }
      
      mat3 Rz(float a){ float s=sin(a), c=cos(a); return mat3(c,-s,0, s,c,0, 0,0,1); }
      mat3 Ry(float a){ float s=sin(a), c=cos(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
      mat3 Rx(float a){ float s=sin(a), c=cos(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
      mat3 rotationRM(float t){ return Rz(t*0.90) * Ry(t*0.73) * Rx(t*0.51); }
      
      float lineAA_px(vec2 p, vec2 a, vec2 b, float px, float resY){
          vec2 d = b - a;
          float dd = max(dot(d,d), 1e-6);
          float t  = clamp(dot(d, p-a)/dd, 0.0, 1.0);
          float dist = length(p - (a + t*d));
          float half_px_uv = 0.5 * px / resY;
          float aa = fwidth(dist);
          return 1.0 - smoothstep(half_px_uv, half_px_uv + aa, dist);
      }
      float ringAA_px(vec2 p, float r, float px, float resY){
          float dist = abs(length(p) - r);
          float half_px_uv = 0.5 * px / resY;
          float aa = fwidth(dist);
          return 1.0 - smoothstep(half_px_uv, half_px_uv + aa, dist);
      }
      float diskAA_px(vec2 p, vec2 c, float r_px, float resY){
          float r_uv = r_px / resY;
          float dist = length(p - c);
          float aa   = fwidth(dist);
          return 1.0 - smoothstep(r_uv, r_uv + aa, dist);
      }
      float insideMask_px(vec2 p, float R){
          float r = length(p);
          float aa = fwidth(r);
          return 1.0 - smoothstep(R, R + aa, r);
      }
      
      vec3 dirFromScreen(vec2 uv_norm){
          float r2=dot(uv_norm,uv_norm);
          float z=sqrt(max(0.0,1.0-r2));
          return vec3(uv_norm, z);
      }
      
      float stripePeriodic_px(float x01, float N, float px, float resY){
          float f = fract(x01 * N);
          float d = min(f, 1.0 - f);
          vec2 gx = vec2(dFdx(x01), dFdy(x01));
          float a1px = max(length(gx), 1e-6);
          float half_param = 0.5 * px / resY * N * a1px;
          float aa = fwidth(d) + 1e-4;
          return 1.0 - smoothstep(half_param, half_param + aa, d);
      }
      
      float hash11(float x){ x=fract(x*0.1031); x*=x+33.33; x*=x+x; return fract(x); }
      vec2  hash21(vec2 p){
          float n = sin(dot(p, vec2(127.1,311.7))) * 43758.5453;
          float m = sin(dot(p, vec2(269.5,183.3))) * 43758.5453;
          return fract(vec2(n,m));
      }
      vec3 randDir(vec2 u){ float z=1.0-2.0*u.x; float phi=2.0*PI*u.y; float r=sqrt(max(0.0,1.0-z*z)); return vec3(r*cos(phi), r*sin(phi), z); }
      
      void axisFrame(vec3 a, out vec3 e1, out vec3 e2){
          vec3 t = (abs(a.z) < 0.9) ? vec3(0,0,1) : vec3(0,1,0);
          e1 = normalize(cross(a, t));
          e2 = cross(a, e1);
      }
      
      void main() {
          vec2 RES = u_resolution;
          vec2 uv  = (gl_FragCoord.xy - 0.5*RES)/RES.y;
          
          vec3 col = vec3(1.0, 1.0, 1.0); // White sphere
          
          float tBase = u_time * 0.31415 * ROT_SPEED;
          mat3  Rm    = rotationRM(tBase);
          
          float outline = ringAA_px(uv, SPHERE_R, 1.4*GRID_PX, RES.y);
          col = mix(col, WHITE, outline*0.14);
          
          float r = length(uv);
          float inside = insideMask_px(uv, SPHERE_R);
          if(r <= SPHERE_R){
              vec2  pn = uv / SPHERE_R;
              vec3  d0 = dirFromScreen(pn);
              vec3  d  = normalize(Rm * d0);
              
              vec3 A0 = normalize(vec3( 1.0,  1.0,  1.0));
              vec3 A1 = normalize(vec3(-1.0, -1.0,  1.0));
              vec3 A2 = normalize(vec3(-1.0,  1.0, -1.0));
              
              // Fixed array for WebGL 1.0 - using individual variables instead
              float shift0 = 0.0;
              float shift1 = 1.0/(3.0*N_TRI);
              float shift2 = 2.0/(3.0*N_TRI);
              
              float gridMask = 0.0;
              for(int k=0;k<3;k++){
                  vec3 a = (k==0)?A0:((k==1)?A1:A2);
                  vec3 e1,e2; axisFrame(a, e1, e2);
                  float x = dot(d, e1);
                  float y = dot(d, e2);
                  float phi = atan(y, x); if(phi < 0.0) phi += 2.0*PI;
                  float shift = (k==0)?shift0:((k==1)?shift1:shift2);
                  float v = phi/(2.0*PI) + shift;
                  float mk = stripePeriodic_px(v, N_TRI, GRID_PX, RES.y);
                  gridMask = clamp(gridMask + mk, 0.0, 1.0);
              }
              
              vec3 gcol = orientColor(d);
              col = mix(col, gcol, gridMask * 0.74);
          }
          
          for(int j=0; j<NUM_CHORDS; ++j){
              float life  = BASE_LIFE * mix(1.0 - LIFE_JITTER, 1.0 + LIFE_JITTER, hash11(float(j)*3.17 + 8.2));
              float phase = hash11(float(j) + 17.0) * life;
              float tLoc  = (u_time + phase) / life;
              float gen   = floor(tLoc);
              float s     = fract(tLoc);
              float fade  = smoothstep(0.00, 0.18, s) * (1.0 - smoothstep(0.82, 1.00, s));
              
              vec2 u2 = hash21(vec2(float(j), gen));
              vec3 d0 = randDir(u2);
              vec3 d  = normalize(Rm * d0);
              
              vec2 A =  SPHERE_R * d.xy;
              vec2 B = -SPHERE_R * d.xy;
              
              float m = lineAA_px(uv, A, B, CHORD_PX, RES.y) * inside;
              float front = 0.70 + 0.30*clamp(d.z*0.5 + 0.5, 0.0, 1.0);
              vec3  cLn   = orientColor(d);
              col = mix(col, cLn, m * fade * front * 0.90);
              
              float dotNear = diskAA_px(uv, A, DOT_PX, RES.y) * inside;
              float dotFar  = diskAA_px(uv, B, DOT_PX, RES.y) * inside;
              vec3  dotCol  = mix(cLn, WHITE, 0.25);
              col = mix(col, dotCol, (dotNear + dotFar) * fade * 0.85);
          }
          
          float vig = smoothstep(1.45, 0.24, length(uv));
          col *= mix(0.65, 1.0, vig);
          
          // Simple alpha calculation - make background transparent
          float alpha = 1.0;
          
          // If we're outside the sphere and there's no content, make transparent
          if (r > SPHERE_R) {
              // Check if there's any visible content (sphere outline or extending lines)
              float outline = ringAA_px(uv, SPHERE_R, 1.4*GRID_PX, RES.y);
              alpha = outline;
          }
          
          gl_FragColor = vec4(col, alpha);
      }
    `;

    // Compile shader
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) {
        console.error('Failed to create shader');
        return null;
      }
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        console.error('Shader type:', type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT');
        console.error('Shader source length:', source.length);
        // Log first 500 chars of shader source for debugging
        console.error('Shader source preview:', source.substring(0, 500));
        gl.deleteShader(shader);
        return null;
      }
      
      console.log('Shader compiled successfully, type:', type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT');
      return shader;
    }

    // Create program
    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram();
      if (!program) {
        console.error('Failed to create program');
        return null;
      }
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      
      console.log('Program linked successfully');
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
    
    console.log('Shaders compiled and program linked successfully');

    // Create quad geometry
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

        // Animation loop
        let frameCount = 0;
        function animate() {
          if (!gl || !canvas || !program) {
            console.error('Missing gl, canvas, or program');
            return;
          }
          
          const now = performance.now() * 0.001;
          let time = now;
          if (pausedRef.current) {
            if (freezeTimeRef.current === null) freezeTimeRef.current = now;
            time = freezeTimeRef.current;
          } else {
            freezeTimeRef.current = null;
          }
          frameCount++;
          
          // Log every 30 frames for more frequent debugging
          if (frameCount % 30 === 0) {
            console.log('Animation frame:', frameCount, 'time:', time.toFixed(2), 'canvas size:', canvas.width, 'x', canvas.height);
          }
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      
          gl.clearColor(0,0,0, 0.0); // Transparent sphere
          gl.clear(gl.COLOR_BUFFER_BIT);
          
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          
          const error = gl.getError();
          if (error !== gl.NO_ERROR) {
            console.error('WebGL error:', error);
          }
          
          // Test: draw a simple red pixel to verify canvas is working
          if (frameCount === 1) {
            console.log('First frame rendered, testing canvas visibility');
            // This is just for debugging - we'll remove it
          }
          
          requestAnimationFrame(animate);
    }

    // Handle resize
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
      
      console.log('Resizing canvas to:', newWidth, 'x', newHeight);
      console.log('Container rect:', rect);
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      console.log('Canvas after resize:', canvas.width, 'x', canvas.height);
    }

    // Initial resize
    resize();
    
    // If canvas is still 0x0, set a fallback size
    if (canvas.width === 0 || canvas.height === 0) {
      console.log('Canvas is 0x0, setting fallback size');
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
    
    // Start animation after a small delay to ensure everything is set up
    setTimeout(() => {
      console.log('Starting animation loop...');
      console.log('Final canvas size:', canvas.width, 'x', canvas.height);
      animate();
    }, 100);

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
        height: '100%',
        background: 'transparent'
      }}
    />
  );
}
