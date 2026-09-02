"use client";
import { useEffect, useRef } from 'react';

export function Viz1Shader({ paused = false }: { paused?: boolean }) {
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
    
    // Check WebGL version and capabilities
    console.log('WebGL version:', gl.getParameter(gl.VERSION));
    console.log('GLSL version:', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    console.log('Max texture size:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    
    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Buffer A shader (accumulation pass)
    const bufferAVertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const bufferAFragmentShaderSource = `
      precision highp float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_timeDelta;
      uniform int u_frame;
      uniform sampler2D u_prevFrame;
      
      #define SPEED         5.0 // Increase speed for better visibility
      #define RESTART_SEC    8.0
      #define LINE_PX        5.0
      #define ZOOM           4.0 // Adjust zoom to bring trajectories closer
      #define D              2
      #define SEED         123.0
      #define FADE          0.98
      #define ANGLE_EPS     0.002
      #define AUTO_SCALE       1
      #define COLOR_RATE     0.12
      #define SAT_BOOST      0.85
      #define VAL_SCALE      0.72
      #define GAMMA          1.08
      
      float h1(float x){ return fract(sin(x)*43758.5453123); }
      
      void toWorld(vec2 fragCoord, out vec2 p, out float px){
          vec2 R = u_resolution; float s = min(R.x,R.y), W = 2.2;
          vec2 c0 = 0.5*R; p = ((fragCoord - c0)/s)*(2.0*W); px = (2.0*W)/s;
      }
      
      float sdSegment(vec2 p, vec2 a, vec2 b){
          vec2 pa = p - a, ba = b - a;
          float h = clamp(dot(pa,ba)/max(dot(ba,ba),1e-9), 0., 1.);
          return length(pa - ba*h);
      }
      
      vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
      vec2 csub(vec2 a, vec2 b){ return a - b; }
      vec2 cdiv(vec2 a, vec2 b){
          float d = dot(b,b);
          return vec2((a.x*b.x + a.y*b.y)/d, (a.y*b.x - a.x*b.y)/d);
      }
      
      vec2 zpow_polar(float r, float th, float k){
          float rk = pow(r, k), a = k*th;
          return rk * vec2(cos(a), sin(a));
      }
      
      vec2 sampleZ(int j, float epochShift, out float r, out float th){
          float s = SEED + epochShift + float(j)*19.19;
          float u = h1(s+5.91);
          // Expand the range to 60 degrees above and below -1
          // Range: [π - π/3, π + π/3] = [2π/3, 4π/3] = [120°, 240°]
          th = 3.14159265359 - 1.0471975512 + 2.09439510239 * u; // π - π/3 + 2π/3*u
          if (abs(sin(0.5*th)) < ANGLE_EPS) th += 2.0*ANGLE_EPS;
          r = 1.0;
          return vec2(cos(th), sin(th));
      }
      
      vec2 cesaroLimit(vec2 z){ return cdiv(z, csub(vec2(1.0,0.0), z)); }
      
      void centerAndScale(float epochShift, out vec2 C, out float S){
          C = vec2(0.0); float maxR = 1.0;
          for(int j=0;j<D;++j){
              float r, th; vec2 z = sampleZ(j, epochShift, r, th);
              C += cesaroLimit(z);
              float R = 1.0 / max(length(csub(vec2(1.0,0.0), z)), 1e-4);
              maxR = max(maxR, R);
          }
          C /= float(D);
          #if AUTO_SCALE
          S = (1.15*maxR) / ZOOM;
          #else
          S = 1.0 / ZOOM;
          #endif
      }
      
      void pos_at(vec2 z, float r, float th, float k, out vec2 S, out vec2 Sig){
          if(k <= 1.0000001){ S = z; Sig = z; return; }
          vec2 ONE = vec2(1.0,0.0);
          vec2 zk  = zpow_polar(r, th, k);
          vec2 den = csub(ONE, z);
          vec2 inv1= cdiv(ONE, den);
          vec2 inv2= cmul(inv1, inv1);
          S   = cdiv( cmul(z, csub(ONE, zk)), den );
          vec2 part = cdiv( cmul(cmul(z,z), csub(ONE, zk)), vec2(k,0.0) );
          Sig = csub( cdiv(z, den), cmul(part, inv2) );
      }
      
      vec3 pal_base(float t){
          const float TAU = 6.28318530718;
          vec3 a = vec3(0.56, 0.53, 0.54); // Better base colors for visibility
          vec3 b = vec3(0.44, 0.44, 0.44); // Higher contrast
          vec3 c = vec3(1.0);
          vec3 d = vec3(0.00, 0.33, 0.67);
          return a + b * cos(TAU*(c*t + d));
      }
      vec3 pal_tuned(vec3 col){
          float l = dot(col, vec3(0.299,0.587,0.114));
          col = mix(vec3(l), col, SAT_BOOST);
          col = pow(max(col, 0.0), vec3(GAMMA));
          col *= VAL_SCALE;
          return clamp(col, 0.0, 1.0);
      }
      vec3 pal(float t){ return pal_tuned(pal_base(t)); }
      vec3 colRaw(float t){ return pal(t); }
      vec3 colCes(float t){ return pal(t + 0.5); }
      
      void main() {
          vec2 fragCoord = gl_FragCoord.xy;
          
          // No restart system - just one fixed initial point, trajectories run forever
          vec3 col = vec3(1.0); // White background

          vec2 p; float px; toWorld(fragCoord, p, px);
          float lw = LINE_PX * px;

          // Fixed initial point - no epoch changes
          float r, th; 
          vec2 z = sampleZ(0, 0.0, r, th); // Fixed seed, no time dependency
          
          vec2 C; float S; centerAndScale(0.0, C, S); // Fixed centering

          // Continuous time progression - no restart
          float t  = u_time * SPEED + 1.0;
          float dt = max(u_timeDelta * SPEED, 1e-4);
          float n0 = floor(max(1.0, t - dt)), ph0 = fract(max(1.0, t - dt));
          float n1 = floor(t),                ph1 = fract(t);

          float phase = u_time * COLOR_RATE; // Simple continuous color phase

          // Two trajectories from the same fixed initial point
          // Ordinary (RAW) segment
          vec2 S00,Sx,S01,Sx2;  pos_at(z,r,th,n0,    S00,Sx);
                                pos_at(z,r,th,n0+1., S01,Sx2);
          vec2 P0 = (mix(S00,S01,ph0) - C)/S;

          vec2 S10,Sx3,S11,Sx4; pos_at(z,r,th,n1,    S10,Sx3);
                                pos_at(z,r,th,n1+1., S11,Sx4);
          vec2 P1 = (mix(S10,S11,ph1) - C)/S;

          float a = smoothstep(lw*1.3, lw*0.6, sdSegment(p, P0, P1));
          col = mix(col, colRaw(phase), a);

          // Cesàro segment
          vec2 T0, Sig0, T1, Sig1;
          pos_at(z,r,th,n0,    T0, Sig0);
          pos_at(z,r,th,n0+1., T1, Sig1);
          vec2 Q0 = (mix(Sig0,Sig1,ph0) - C)/S;

          vec2 U0, Sig2, U1, Sig3;
          pos_at(z,r,th,n1,    U0, Sig2);
          pos_at(z,r,th,n1+1., U1, Sig3);
          vec2 Q1 = (mix(Sig2,Sig3,ph1) - C)/S;

          float b = smoothstep(lw*1.3, lw*0.6, sdSegment(p, Q0, Q1));
          col = mix(col, colCes(phase), b);

          gl_FragColor = vec4(col, 1.0); // Fixed alpha
      }
    `;

    // Image shader (display pass)
    const imageVertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const imageFragmentShaderSource = `
      precision highp float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform sampler2D u_bufferA;
      
      #define SPEED         5.0
      #define RESTART_SEC    8.0
      #define ZOOM           4.0
      #define D              2
      #define SEED         123.0
      #define DOT_RAW_PX     6.0
      #define DOT_CES_PX     6.5
      #define ANGLE_EPS    0.002
      #define AUTO_SCALE       1
      #define COLOR_RATE     0.12
      #define SAT_BOOST      0.75
      #define VAL_SCALE      0.52
      #define GAMMA          1.08
      
      float h1(float x){ return fract(sin(x)*43758.5453123); }
      
      void toWorld(vec2 fragCoord, out vec2 p, out float px){
          vec2 R=u_resolution.xy; float s=min(R.x,R.y), W=2.2;
          vec2 c0=0.5*R; p=((fragCoord-c0)/s)*(2.0*W); px=(2.0*W)/s;
      }
      
      vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
      vec2 csub(vec2 a, vec2 b){ return a - b; }
      vec2 cdiv(vec2 a, vec2 b){
          float d=dot(b,b);
          return vec2((a.x*b.x + a.y*b.y)/d, (a.y*b.x - a.x*b.y)/d);
      }
      vec2 zpow_polar(float r, float th, float k){ float rk=pow(r,k), a=k*th; return rk*vec2(cos(a),sin(a)); }
      
      vec2 sampleZ(int j, float epochShift, out float r, out float th){
          float s=SEED + epochShift + float(j)*19.19; float u=h1(s+5.91);
          // Restrict to 15 degrees above and below -1 (π ± π/12)
          // Range: [π - π/12, π + π/12] = [11π/12, 13π/12] = [165°, 195°]
          th=3.14159265359 - 0.26179938779 + 0.52359877559*u; // π - π/12 + π/6*u
          if(abs(sin(0.5*th))<ANGLE_EPS) th += 2.0*ANGLE_EPS;
          r=1.0; return vec2(cos(th), sin(th));
      }
      vec2 cesaroLimit(vec2 z){ return cdiv(z, csub(vec2(1.0,0.0), z)); }
      
      void centerAndScale(float epochShift, out vec2 C, out float S){
          C=vec2(0.0); float maxR=1.0;
          for(int j=0;j<D;++j){
              float r, th; vec2 z=sampleZ(j, epochShift, r, th);
              C += cesaroLimit(z);
              float R = 1.0 / max(length(csub(vec2(1.0,0.0), z)), 1e-4);
              maxR = max(maxR, R);
          }
          C /= float(D);
          #if AUTO_SCALE
          S = (1.15*maxR)/ZOOM;
          #else
          S = 1.0/ZOOM;
          #endif
      }
      
      void pos_at(vec2 z, float r, float th, float k, out vec2 S, out vec2 Sig){
          if(k <= 1.0000001){ S=z; Sig=z; return; }
          vec2 ONE=vec2(1.0,0.0), zk=zpow_polar(r,th,k), den=csub(ONE,z);
          vec2 inv1=cdiv(ONE,den), inv2=cmul(inv1,inv1);
          S   = cdiv( cmul(z, csub(ONE, zk)), den );
          vec2 part = cdiv( cmul(cmul(z,z), csub(ONE, zk)), vec2(k,0.0) );
          Sig = csub( cdiv(z, den), cmul(part, inv2) );
      }
      
      vec3 pal_base(float t){
          const float TAU=6.28318530718;
          vec3 a=vec3(0.56,0.53,0.54), b=vec3(0.44), c=vec3(1.0), d=vec3(0.00,0.33,0.67);
          return a + b*cos(TAU*(c*t + d));
      }
      vec3 pal_tuned(vec3 col){
          float l=dot(col, vec3(0.299,0.587,0.114));
          col = mix(vec3(l), col, SAT_BOOST);
          col = pow(max(col,0.0), vec3(GAMMA));
          col *= VAL_SCALE;
          return clamp(col,0.0,1.0);
      }
      vec3 pal(float t){ return pal_tuned(pal_base(t)); }
      vec3 colRaw(float t){ return pal(t); }
      vec3 colCes(float t){ return pal(t + 0.5); }
      
      void main() {
          vec2 fragCoord = gl_FragCoord.xy;
          vec2 p; float px; toWorld(fragCoord, p, px);
          vec3 col = texture2D(u_bufferA, fragCoord/u_resolution.xy).rgb;

          float epoch      = floor(u_time / RESTART_SEC);
          float epochShift = epoch*9973.0;

          vec2 C; float S; centerAndScale(epochShift, C, S);

          float t = mod(u_time, RESTART_SEC)*SPEED + 1.0;
          float n = floor(t), ph = fract(t);

          float r, th; vec2 z = sampleZ(0, epochShift, r, th);
          vec2 S0,Sig0,S1,Sig1; pos_at(z,r,th,n, S0,Sig0); pos_at(z,r,th,n+1.0, S1,Sig1);

          vec2 rawDot = (mix(S0,S1,ph)   - C)/S;
          vec2 cesDot = (mix(Sig0,Sig1,ph)- C)/S;

          float phase = u_time*COLOR_RATE + h1(epoch*0.137 + 0.314);
          vec3  inkR  = colRaw(phase);
          vec3  inkC  = colCes(phase);

          float aR = smoothstep(DOT_RAW_PX*px, 0.0, length(p - rawDot));
          float aC = smoothstep(DOT_CES_PX*px, 0.0, length(p - cesDot));
          col = mix(col, inkR, aR);
          col = mix(col, inkC, aC);

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Compile shader function
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        console.error('Shader source:', source);
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    // Create program function
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

    // Compile Buffer A shaders
    const bufferAVertexShader = createShader(gl, gl.VERTEX_SHADER, bufferAVertexShaderSource);
    const bufferAFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, bufferAFragmentShaderSource);
    
    if (!bufferAVertexShader || !bufferAFragmentShader) {
      console.error('Failed to create Buffer A shaders');
      return;
    }

    const bufferAProgram = createProgram(gl, bufferAVertexShader, bufferAFragmentShader);
    if (!bufferAProgram) {
      console.error('Failed to create Buffer A program');
      return;
    }
    console.log('Buffer A program created successfully');

    // Compile Image shaders
    const imageVertexShader = createShader(gl, gl.VERTEX_SHADER, imageVertexShaderSource);
    const imageFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, imageFragmentShaderSource);
    
    if (!imageVertexShader || !imageFragmentShader) {
      console.error('Failed to create Image shaders');
      return;
    }

    const imageProgram = createProgram(gl, imageVertexShader, imageFragmentShader);
    if (!imageProgram) {
      console.error('Failed to create Image program');
      return;
    }
    console.log('Image program created successfully');

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

    // Create ping-pong framebuffers for Buffer A
    const framebuffer1 = gl.createFramebuffer();
    const framebuffer2 = gl.createFramebuffer();
    const texture1 = gl.createTexture();
    const texture2 = gl.createTexture();
    
    // Setup texture1
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    
    // Setup texture2
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(imageProgram, 'a_position');
    const resolutionLocation = gl.getUniformLocation(imageProgram, 'u_resolution');
    const timeLocation = gl.getUniformLocation(imageProgram, 'u_time');
    const bufferALocation = gl.getUniformLocation(imageProgram, 'u_bufferA');

    const positionLocationA = gl.getAttribLocation(bufferAProgram, 'a_position');
    const resolutionLocationA = gl.getUniformLocation(bufferAProgram, 'u_resolution');
    const timeLocationA = gl.getUniformLocation(bufferAProgram, 'u_time');
    const timeDeltaLocationA = gl.getUniformLocation(bufferAProgram, 'u_timeDelta');
    const frameLocationA = gl.getUniformLocation(bufferAProgram, 'u_frame');
    const prevFrameLocationA = gl.getUniformLocation(bufferAProgram, 'u_prevFrame');

    let lastTime = 0;
    let frameCount = 0;
    let pingPong = true; // true = write to buffer1, read from buffer2

    // Animation loop
    function animate() {
      if (!gl || !canvas || !imageProgram || !bufferAProgram) return;
      
      const now = performance.now() * 0.001;
      const currentTime = pausedRef.current
        ? (freezeTimeRef.current ?? (freezeTimeRef.current = now))
        : now;
      const timeDelta = currentTime - lastTime;
      lastTime = currentTime;
      frameCount++;
      
      // Debug logging every 60 frames
      if (frameCount % 60 === 0) {
        console.log('Viz1Shader frame:', frameCount, 'time:', currentTime.toFixed(2));
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Ping-pong:', pingPong ? 'buffer1->buffer2' : 'buffer2->buffer1');
        console.log('WebGL context:', gl ? 'OK' : 'NULL');
        console.log('Programs:', bufferAProgram ? 'BufferA OK' : 'BufferA NULL', imageProgram ? 'Image OK' : 'Image NULL');
      }

      // Determine which buffers to use
      const writeFramebuffer = pingPong ? framebuffer1 : framebuffer2;
      const readTexture = pingPong ? texture2 : texture1;
      const writeTexture = pingPong ? texture1 : texture2;

      // BYPASS FRAMEBUFFER: Render Buffer A directly to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(bufferAProgram);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocationA);
      gl.vertexAttribPointer(positionLocationA, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform2f(resolutionLocationA, canvas.width, canvas.height);
      gl.uniform1f(timeLocationA, currentTime);
      gl.uniform1f(timeDeltaLocationA, timeDelta);
      gl.uniform1i(frameLocationA, frameCount);
      
      // No texture needed - disable framebuffer system completely
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, null);
      // Don't pass previous frame texture
      
      gl.clearColor(0,0,0, 0.8); // Gray background to match shader
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Check for WebGL errors
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error('WebGL error in direct render:', error);
      }
      
      // Debug: log every 120 frames
      if (frameCount % 120 === 0) {
        console.log('Direct rendering: Buffer A to screen (no framebuffers)');
        console.log('Time:', currentTime.toFixed(2), 'Frame:', frameCount);
        console.log('Circle center should be at:', (0.5 + 0.3 * Math.sin(currentTime)).toFixed(2), (0.5 + 0.3 * Math.cos(currentTime * 0.7)).toFixed(2));
      }
      
      // Swap ping-pong
      pingPong = !pingPong;
      
      requestAnimationFrame(animate);
    }

    // Handle resize
    function resize() {
      if (!canvas || !gl) return;
      
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
      
      // Recreate textures
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newWidth, newHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      
      gl.bindTexture(gl.TEXTURE_2D, texture2);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newWidth, newHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    // Initial resize
    resize();
    window.addEventListener('resize', resize);

    // Also react to the canvas's own container changing size (e.g. a layout
    // animation resizing it), not just the window - a single mount-time
    // measurement is not enough since the container can change size later
    // without a window resize event ever firing.
    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    
    // Start animation
    setTimeout(() => {
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