// WebGL Fog Dissolve Shaders — Phase Shift

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;

  uniform float u_time;
  uniform float u_progress;
  uniform float u_opacity;
  uniform vec3 u_color;
  uniform vec2 u_resolution;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865, 0.366025404, -0.577350269, 0.024390244);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // 4-octave Fractal Brownian Motion with domain warping
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    // Rotation matrix prevents axis-aligned artifacts
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      p = rot * p;
      frequency *= 2.05;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;

    // Aspect-correct UV
    vec2 p = vec2(uv.x * aspect, uv.y);

    // Slowly drifting noise coordinates
    vec2 q = p * 2.5;
    q += u_time * vec2(0.025, 0.018);

    // Domain warping — creates organic, swirling cloud structure
    float f1 = fbm(q);
    float f2 = fbm(q + vec2(f1 * 1.2, f1 * 0.8) + u_time * 0.012);
    float cloudDensity = fbm(p * 2.0 + vec2(f2 * 1.4, f1 * 0.9) + u_time * vec2(0.015, 0.01));

    // Normalize to [0, 1]
    cloudDensity = cloudDensity * 0.5 + 0.5;

    // Dissolve with soft edge
    float threshold = u_progress;
    float softEdge = 0.12;
    float alpha = 1.0 - smoothstep(threshold - softEdge, threshold + softEdge, cloudDensity);

    // Global opacity control
    alpha *= u_opacity;

    gl_FragColor = vec4(u_color, alpha);
  }
`;

class FogDissolve {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.startTime = performance.now();
    this.progress = 0;          // 0 = fully opaque fog
    this.targetProgress = 0;
    this.opacity = 1.0;
    this.targetOpacity = 1.0;
    this.color = [250/255, 248/255, 245/255]; // garden
    this.transitioning = false;
    this.active = true;

    this._init();
    this._bindResize();
    this._loop();
  }

  _init() {
    const gl = this.canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: 'high-performance'
    });
    if (!gl) { this.active = false; return; }
    this.gl = gl;

    const vert = this._compile(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = this._compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vert || !frag) { this.active = false; return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(prog));
      this.active = false;
      return;
    }
    this.program = prog;

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,  1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      time: gl.getUniformLocation(prog, 'u_time'),
      progress: gl.getUniformLocation(prog, 'u_progress'),
      opacity: gl.getUniformLocation(prog, 'u_opacity'),
      color: gl.getUniformLocation(prog, 'u_color'),
      resolution: gl.getUniformLocation(prog, 'u_resolution'),
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this._resize();
  }

  _compile(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  _bindResize() {
    let timeout;
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this._resize(), 100);
    }, { passive: true });
  }

  _loop() {
    if (!this.active) return;
    requestAnimationFrame(() => this._loop());
    this._render();
  }

  _render() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    // Smooth lerp
    this.progress += (this.targetProgress - this.progress) * 0.04;
    this.opacity += (this.targetOpacity - this.opacity) * 0.06;

    // Skip render if fully transparent
    if (this.opacity < 0.005 && this.progress > 0.98) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    const t = (performance.now() - this.startTime) / 1000;

    gl.useProgram(this.program);
    gl.uniform1f(this.uniforms.time, t);
    gl.uniform1f(this.uniforms.progress, this.progress);
    gl.uniform1f(this.uniforms.opacity, this.opacity);
    gl.uniform3fv(this.uniforms.color, this.color);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  setProgress(p) {
    this.targetProgress = Math.max(0, Math.min(1, p));
  }

  setOpacity(o) {
    this.targetOpacity = Math.max(0, Math.min(1, o));
  }

  setColor(r, g, b) {
    this.color = [r, g, b];
  }

  // Page load reveal: fog starts opaque, then dissolves away
  async revealPage() {
    this.progress = 0;
    this.targetProgress = 0;
    this.opacity = 1;
    this.targetOpacity = 1;

    await this._wait(400);

    // Dissolve fog away
    this.targetProgress = 1.15;
    await this._wait(1800);
    this.targetOpacity = 0;
  }

  // Phase shift: fog closes in, theme swaps, fog dissolves away
  async transitionTheme(newColor, callback) {
    if (this.transitioning) return;
    this.transitioning = true;

    // Bring fog back
    this.targetOpacity = 1;
    this.targetProgress = 0;
    await this._wait(1000);

    // Swap theme while hidden
    this.setColor(...newColor);
    if (callback) callback();
    await this._wait(200);

    // Dissolve away
    this.targetProgress = 1.15;
    await this._wait(1600);
    this.targetOpacity = 0;

    this.transitioning = false;
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.FogDissolve = FogDissolve;
