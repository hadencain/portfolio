"use client";

import { useEffect, useRef } from "react";

// ─── Shaders ────────────────────────────────────────────────────────────────

const VERT = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const ADVECT = `
  precision highp float;
  uniform sampler2D uVel; uniform sampler2D uSrc;
  uniform vec2 uDx; uniform float uDt; uniform float uDiss;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uSrc, vUv - texture2D(uVel, vUv).xy * uDt * uDx) * uDiss;
  }
`;

const SPLAT = `
  precision highp float;
  uniform sampler2D uTgt; uniform vec2 uPt; uniform vec3 uColor;
  uniform float uRadius; uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec2 d = (vUv - uPt) * vec2(uAspect, 1.0);
    float sp = exp(-dot(d, d) / uRadius);
    gl_FragColor = texture2D(uTgt, vUv) + vec4(uColor * sp, sp);
  }
`;

const DIVERGENCE = `
  precision highp float;
  uniform sampler2D uVel; uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uVel, vUv - vec2(uDx.x,0)).x;
    float R = texture2D(uVel, vUv + vec2(uDx.x,0)).x;
    float T = texture2D(uVel, vUv + vec2(0,uDx.y)).y;
    float B = texture2D(uVel, vUv - vec2(0,uDx.y)).y;
    gl_FragColor = vec4(0.5*(R-L+T-B), 0,0,1);
  }
`;

const CURL = `
  precision highp float;
  uniform sampler2D uVel; uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uVel, vUv - vec2(uDx.x,0)).y;
    float R = texture2D(uVel, vUv + vec2(uDx.x,0)).y;
    float T = texture2D(uVel, vUv + vec2(0,uDx.y)).x;
    float B = texture2D(uVel, vUv - vec2(0,uDx.y)).x;
    gl_FragColor = vec4(R-L-T+B, 0,0,1);
  }
`;

const VORTICITY = `
  precision highp float;
  uniform sampler2D uVort; uniform sampler2D uVel;
  uniform vec2 uDx; uniform float uCurl; uniform float uDt;
  varying vec2 vUv;
  void main() {
    float L = abs(texture2D(uVort, vUv-vec2(uDx.x,0)).x);
    float R = abs(texture2D(uVort, vUv+vec2(uDx.x,0)).x);
    float T = abs(texture2D(uVort, vUv+vec2(0,uDx.y)).x);
    float B = abs(texture2D(uVort, vUv-vec2(0,uDx.y)).x);
    float C = texture2D(uVort, vUv).x;
    vec2 force = 0.5*vec2(T-B,R-L);
    force /= length(force)+0.0001;
    force *= uCurl*C; force.y *= -1.0;
    gl_FragColor = vec4(texture2D(uVel,vUv).xy + force*uDt, 0,1);
  }
`;

const PRESSURE = `
  precision highp float;
  uniform sampler2D uPres; uniform sampler2D uDiv; uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uPres,vUv-vec2(uDx.x,0)).x;
    float R = texture2D(uPres,vUv+vec2(uDx.x,0)).x;
    float T = texture2D(uPres,vUv+vec2(0,uDx.y)).x;
    float B = texture2D(uPres,vUv-vec2(0,uDx.y)).x;
    gl_FragColor = vec4((L+R+T+B-texture2D(uDiv,vUv).x)*0.25, 0,0,1);
  }
`;

const GRAD_SUB = `
  precision highp float;
  uniform sampler2D uPres; uniform sampler2D uVel; uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uPres,vUv-vec2(uDx.x,0)).x;
    float R = texture2D(uPres,vUv+vec2(uDx.x,0)).x;
    float T = texture2D(uPres,vUv+vec2(0,uDx.y)).x;
    float B = texture2D(uPres,vUv-vec2(0,uDx.y)).x;
    gl_FragColor = vec4(texture2D(uVel,vUv).xy - 0.5*vec2(R-L,T-B), 0,1);
  }
`;

// Particle point-sprite — renders into dye FBO
const PARTICLE_VERT = `
  attribute vec2 aPos;
  attribute float aSpeed;
  varying float vSpeed;
  void main() {
    vSpeed = aSpeed;
    gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = mix(1.5, 4.0, aSpeed);
  }
`;
const PARTICLE_FRAG = `
  precision highp float;
  varying float vSpeed;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = max(0.0, 1.0 - d);
    float val = 0.55 + vSpeed * 0.45;
    float intensity = alpha * (0.03 + vSpeed * 0.06);
    gl_FragColor = vec4(val * intensity, val * intensity, val * intensity, intensity);
  }
`;

// Display: gravitational lensing + event horizon + watercolor grain
const DISPLAY = `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uSingularity;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float vnoise(vec2 p) {
    vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }

  void main() {
    // Aspect-corrected distance to singularity
    vec2 toSing = vUv - uSingularity;
    vec2 toSingAC = toSing * vec2(uAspect, 1.0);
    float rSing = length(toSingAC);

    // Gravitational lensing — bend UVs toward singularity
    float lensWarp = 0.0038 / (rSing * rSing + 0.0007);
    lensWarp = min(lensWarp, 0.06);
    vec2 lensedUv = vUv - normalize(toSing) * lensWarp;
    vec3 c = texture2D(uTex, clamp(lensedUv, 0.001, 0.999)).rgb;

    // Watercolor: paper grain (3 octaves)
    float grain = vnoise(vUv*520.0)*0.50 + vnoise(vUv*1100.0)*0.30 + vnoise(vUv*2300.0)*0.20;

    // Granulation — pigment settles in mid-tones
    float lum = dot(c, vec3(0.299,0.587,0.114));
    float gran = vnoise(vUv*160.0 + c.rg*2.5);
    c *= 0.86 + gran * 0.28 * lum * (1.0 - lum) * 3.8;

    // Soft watercolor gamma
    c = pow(max(c, vec3(0.0)), vec3(0.82));
    c += (grain - 0.5) * 0.018;

    // Wet-edge pooling (pigment pools at wash edges)
    c *= 1.0 - smoothstep(0.55, 0.88, lum) * 0.20;

    // Event horizon — full shadow
    float ehR = 0.038;
    float shadow = 1.0 - smoothstep(ehR * 0.5, ehR * 1.2, rSing);
    c *= 1.0 - shadow * 0.97;

    // Photon sphere — faint luminous ring just outside event horizon
    float psInner = ehR * 1.1;
    float psOuter = ehR * 2.8;
    float psMid   = (psInner + psOuter) * 0.5;
    float photon  = smoothstep(psInner, psMid, rSing) * (1.0 - smoothstep(psMid, psOuter, rSing));
    c += photon * 0.03;

    // Vignette
    vec2 uv = vUv * 2.0 - 1.0;
    float vig = pow(clamp(1.0 - dot(uv*0.46,uv*0.46), 0.0, 1.0), 0.55);
    c *= vig * 0.60 + 0.05;

    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }
`;

// ─── Config ──────────────────────────────────────────────────────────────────

const SIM_RES        = 128;
const DYE_RES        = 512;
const PRESSURE_ITERS = 20;
const VEL_DISS       = 0.990;
const DYE_DISS       = 0.988;
const CURL_STRENGTH  = 14;
const SPLAT_RADIUS   = 0.003;

const N_PARTICLES       = 650;
const GM                = 0.0115;   // gravitational parameter, UV³/s²
const GM_RING           = 0.038;    // larger GM for velocity ring (visual)
const EVENT_HORIZON_UV  = 0.022;    // physics radius, UV space
const SPAWN_MIN         = 0.12;
const SPAWN_MAX         = 0.28;

// Orbital velocity ring — injects swirling velocity field into the fluid
const RINGS = [
  { r: 0.05, n: 5 },
  { r: 0.10, n: 4 },
  { r: 0.18, n: 3 },
];

// ─── WebGL helpers ───────────────────────────────────────────────────────────

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}
function mkProg(gl: WebGLRenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return p;
}
function ul(gl: WebGLRenderingContext, p: WebGLProgram, n: string) {
  return gl.getUniformLocation(p, n);
}
function bt(gl: WebGLRenderingContext, unit: number, tex: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  return unit;
}

interface FBO { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; }

function mkFBO(gl: WebGLRenderingContext, w: number, h: number,
  ifmt: number, fmt: number, type: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
  return { tex, fbo, w, h };
}
function mkDoubleFBO(gl: WebGLRenderingContext, w: number, h: number,
  ifmt: number, fmt: number, type: number, filter: number) {
  let a = mkFBO(gl, w, h, ifmt, fmt, type, filter);
  let b = mkFBO(gl, w, h, ifmt, fmt, type, filter);
  return { get read() { return a; }, get write() { return b; }, swap() { [a,b]=[b,a]; } };
}

// ─── Particle physics (CPU) ──────────────────────────────────────────────────

interface Particle { x: number; y: number; vx: number; vy: number; }

function spawnParticle(bhX: number, bhY: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const r = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
  const v = Math.sqrt(GM / r);
  const pert = 0.60 + Math.random() * 0.80;
  return {
    x: bhX + Math.cos(angle) * r,
    y: bhY + Math.sin(angle) * r,
    vx: -Math.sin(angle) * v * pert,
    vy:  Math.cos(angle) * v * pert,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BlackHoleSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return;

    const halfExt   = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    const texType   = halfExt ? halfExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const linFilter = halfExt ? gl.LINEAR : gl.NEAREST;

    const advectProg   = mkProg(gl, VERT, ADVECT);
    const splatProg    = mkProg(gl, VERT, SPLAT);
    const divProg      = mkProg(gl, VERT, DIVERGENCE);
    const curlProg     = mkProg(gl, VERT, CURL);
    const vortProg     = mkProg(gl, VERT, VORTICITY);
    const presProg     = mkProg(gl, VERT, PRESSURE);
    const gradProg     = mkProg(gl, VERT, GRAD_SUB);
    const displayProg  = mkProg(gl, VERT, DISPLAY);
    const particleProg = mkProg(gl, PARTICLE_VERT, PARTICLE_FRAG);

    // Fullscreen quad
    const quadBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog: WebGLProgram) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuf);
      const loc = gl!.getAttribLocation(prog, "aPos");
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }
    function drawQuad(fbo: WebGLFramebuffer | null, w: number, h: number) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.viewport(0, 0, w, h);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    // FBOs
    let velocity   = mkDoubleFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, linFilter);
    let dye        = mkDoubleFBO(gl, DYE_RES, DYE_RES, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    let pressure   = mkDoubleFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let divergence = mkFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let curlFBO    = mkFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);

    // Particle GPU buffer — [x, y, speed] per particle
    const particleBuf  = gl.createBuffer()!;
    const particleData = new Float32Array(N_PARTICLES * 3);

    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();

    // Black hole — smooth follows mouse, drifts to center on leave
    let bhX = 0.5, bhY = 0.5;
    let targetX = 0.5, targetY = 0.5;
    let mouseActive = false;

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width;
      targetY = 1.0 - (e.clientY - r.top) / r.height;
      mouseActive = true;
    };
    const onMouseLeave = () => { mouseActive = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    // Particle array
    let particles: Particle[] = Array.from({ length: N_PARTICLES }, () =>
      spawnParticle(0.5, 0.5)
    );

    // Fluid splat helper
    function splat(x: number, y: number, dx: number, dy: number, r: number, g: number, b: number) {
      const aspect = canvas!.width / canvas!.height;
      gl!.useProgram(splatProg);
      bindQuad(splatProg);
      gl!.uniform1f(ul(gl!, splatProg, "uRadius"), SPLAT_RADIUS);
      gl!.uniform1f(ul(gl!, splatProg, "uAspect"), aspect);
      gl!.uniform2f(ul(gl!, splatProg, "uPt"), x, y);

      // Velocity
      gl!.uniform1i(ul(gl!, splatProg, "uTgt"), bt(gl!, 0, velocity.read.tex));
      gl!.uniform3f(ul(gl!, splatProg, "uColor"), dx * 7, dy * 7, 0);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      // Dye
      gl!.uniform1i(ul(gl!, splatProg, "uTgt"), bt(gl!, 0, dye.read.tex));
      gl!.uniform3f(ul(gl!, splatProg, "uColor"), r, g, b);
      drawQuad(dye.write.fbo, DYE_RES, DYE_RES);
      dye.swap();
    }

    // Inject orbital velocity rings around black hole (makes fluid swirl)
    function injectOrbitalRings() {
      for (const ring of RINGS) {
        const v = Math.sqrt(GM_RING / ring.r) / 60; // per-frame velocity
        for (let i = 0; i < ring.n; i++) {
          const angle = (i / ring.n) * Math.PI * 2;
          const sx = bhX + Math.cos(angle) * ring.r;
          const sy = bhY + Math.sin(angle) * ring.r;
          const vx = -Math.sin(angle) * v;
          const vy =  Math.cos(angle) * v;
          splat(sx, sy, vx, vy, 0.001, 0.001, 0.001);
        }
      }
    }

    // Render all particles as point sprites into dye FBO (one draw call)
    function renderParticlesIntoDye() {
      const maxSpeed = Math.sqrt(GM / EVENT_HORIZON_UV);

      for (let i = 0; i < N_PARTICLES; i++) {
        const p = particles[i];
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        particleData[i * 3]     = p.x;
        particleData[i * 3 + 1] = p.y;
        particleData[i * 3 + 2] = Math.min(speed / maxSpeed, 1.0);
      }

      gl!.bindBuffer(gl!.ARRAY_BUFFER, particleBuf);
      gl!.bufferData(gl!.ARRAY_BUFFER, particleData, gl!.DYNAMIC_DRAW);

      gl!.useProgram(particleProg);
      const aPosLoc   = gl!.getAttribLocation(particleProg, "aPos");
      const aSpeedLoc = gl!.getAttribLocation(particleProg, "aSpeed");
      gl!.enableVertexAttribArray(aPosLoc);
      gl!.vertexAttribPointer(aPosLoc, 2, gl!.FLOAT, false, 12, 0);
      gl!.enableVertexAttribArray(aSpeedLoc);
      gl!.vertexAttribPointer(aSpeedLoc, 1, gl!.FLOAT, false, 12, 8);

      // Additive blend into dye read FBO (particles accumulate as dye)
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, dye.read.fbo);
      gl!.viewport(0, 0, DYE_RES, DYE_RES);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.ONE, gl!.ONE);
      gl!.drawArrays(gl!.POINTS, 0, N_PARTICLES);
      gl!.disable(gl!.BLEND);
    }

    // Fluid simulation step
    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      gl!.useProgram(curlProg); bindQuad(curlProg);
      gl!.uniform1i(ul(gl!, curlProg, "uVel"), bt(gl!, 0, velocity.read.tex));
      gl!.uniform2f(ul(gl!, curlProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(curlFBO.fbo, SIM_RES, SIM_RES);

      gl!.useProgram(vortProg); bindQuad(vortProg);
      gl!.uniform1i(ul(gl!, vortProg, "uVort"), bt(gl!, 0, curlFBO.tex));
      gl!.uniform1i(ul(gl!, vortProg, "uVel"),  bt(gl!, 1, velocity.read.tex));
      gl!.uniform2f(ul(gl!, vortProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      gl!.uniform1f(ul(gl!, vortProg, "uCurl"), CURL_STRENGTH);
      gl!.uniform1f(ul(gl!, vortProg, "uDt"), dt);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES); velocity.swap();

      gl!.useProgram(divProg); bindQuad(divProg);
      gl!.uniform1i(ul(gl!, divProg, "uVel"), bt(gl!, 0, velocity.read.tex));
      gl!.uniform2f(ul(gl!, divProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(divergence.fbo, SIM_RES, SIM_RES);

      gl!.useProgram(presProg); bindQuad(presProg);
      gl!.uniform1i(ul(gl!, presProg, "uDiv"), bt(gl!, 1, divergence.tex));
      gl!.uniform2f(ul(gl!, presProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl!.uniform1i(ul(gl!, presProg, "uPres"), bt(gl!, 0, pressure.read.tex));
        drawQuad(pressure.write.fbo, SIM_RES, SIM_RES); pressure.swap();
      }

      gl!.useProgram(gradProg); bindQuad(gradProg);
      gl!.uniform1i(ul(gl!, gradProg, "uPres"), bt(gl!, 0, pressure.read.tex));
      gl!.uniform1i(ul(gl!, gradProg, "uVel"),  bt(gl!, 1, velocity.read.tex));
      gl!.uniform2f(ul(gl!, gradProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES); velocity.swap();

      gl!.useProgram(advectProg); bindQuad(advectProg);
      gl!.uniform1i(ul(gl!, advectProg, "uVel"), bt(gl!, 0, velocity.read.tex));
      gl!.uniform1i(ul(gl!, advectProg, "uSrc"), bt(gl!, 1, velocity.read.tex));
      gl!.uniform2f(ul(gl!, advectProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      gl!.uniform1f(ul(gl!, advectProg, "uDt"), dt);
      gl!.uniform1f(ul(gl!, advectProg, "uDiss"), VEL_DISS);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES); velocity.swap();

      gl!.uniform1i(ul(gl!, advectProg, "uVel"), bt(gl!, 0, velocity.read.tex));
      gl!.uniform1i(ul(gl!, advectProg, "uSrc"), bt(gl!, 1, dye.read.tex));
      gl!.uniform2f(ul(gl!, advectProg, "uDx"), 1/DYE_RES, 1/DYE_RES);
      gl!.uniform1f(ul(gl!, advectProg, "uDiss"), DYE_DISS);
      drawQuad(dye.write.fbo, DYE_RES, DYE_RES); dye.swap();
    }

    function render() {
      const aspect = canvas!.width / canvas!.height;
      gl!.useProgram(displayProg); bindQuad(displayProg);
      gl!.uniform1i(ul(gl!, displayProg, "uTex"), bt(gl!, 0, dye.read.tex));
      gl!.uniform2f(ul(gl!, displayProg, "uSingularity"), bhX, bhY);
      gl!.uniform1f(ul(gl!, displayProg, "uAspect"), aspect);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.016);
      last = now;

      // Smooth black hole follow
      if (!mouseActive) {
        targetX += (0.5 - targetX) * 0.005;
        targetY += (0.5 - targetY) * 0.005;
      }
      bhX += (targetX - bhX) * 0.07;
      bhY += (targetY - bhY) * 0.07;

      // Update particle physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = bhX - p.x;
        const dy = bhY - p.y;
        const r2 = dx * dx + dy * dy;
        const r  = Math.sqrt(r2);

        if (r < EVENT_HORIZON_UV) {
          particles[i] = spawnParticle(bhX, bhY);
          continue;
        }
        // Clamp at min radius to avoid singularity blow-up
        const safeR2 = Math.max(r2, EVENT_HORIZON_UV * EVENT_HORIZON_UV * 2);
        const acc = GM / safeR2;
        p.vx += (dx / r) * acc * dt;
        p.vy += (dy / r) * acc * dt;

        // Speed limit (particle shouldn't exceed escape velocity * 1.5)
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const escape = Math.sqrt(2 * GM / Math.max(r, EVENT_HORIZON_UV));
        if (speed > escape * 1.4) {
          p.vx = (p.vx / speed) * escape * 1.4;
          p.vy = (p.vy / speed) * escape * 1.4;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Respawn if escaped
        if (p.x < -0.1 || p.x > 1.1 || p.y < -0.1 || p.y > 1.1) {
          particles[i] = spawnParticle(bhX, bhY);
        }
      }

      injectOrbitalRings();
      renderParticlesIntoDye();
      step(dt);
      render();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
