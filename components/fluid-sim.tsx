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
  uniform sampler2D uVel;
  uniform sampler2D uSrc;
  uniform vec2 uDx;
  uniform float uDt;
  uniform float uDiss;
  varying vec2 vUv;
  void main() {
    vec2 coord = vUv - texture2D(uVel, vUv).xy * uDt * uDx;
    gl_FragColor = texture2D(uSrc, coord) * uDiss;
  }
`;

const SPLAT = `
  precision highp float;
  uniform sampler2D uTgt;
  uniform vec2 uPt;
  uniform vec3 uColor;
  uniform float uRadius;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec2 d = (vUv - uPt) * vec2(uAspect, 1.0);
    float sp = exp(-dot(d, d) / uRadius);
    gl_FragColor = texture2D(uTgt, vUv) + vec4(uColor * sp, sp);
  }
`;

const DIVERGENCE = `
  precision highp float;
  uniform sampler2D uVel;
  uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uVel, vUv - vec2(uDx.x, 0.0)).x;
    float R = texture2D(uVel, vUv + vec2(uDx.x, 0.0)).x;
    float T = texture2D(uVel, vUv + vec2(0.0, uDx.y)).y;
    float B = texture2D(uVel, vUv - vec2(0.0, uDx.y)).y;
    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
  }
`;

const CURL = `
  precision highp float;
  uniform sampler2D uVel;
  uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uVel, vUv - vec2(uDx.x, 0.0)).y;
    float R = texture2D(uVel, vUv + vec2(uDx.x, 0.0)).y;
    float T = texture2D(uVel, vUv + vec2(0.0, uDx.y)).x;
    float B = texture2D(uVel, vUv - vec2(0.0, uDx.y)).x;
    gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
  }
`;

const VORTICITY = `
  precision highp float;
  uniform sampler2D uVort;
  uniform sampler2D uVel;
  uniform vec2 uDx;
  uniform float uCurl;
  uniform float uDt;
  varying vec2 vUv;
  void main() {
    float L = abs(texture2D(uVort, vUv - vec2(uDx.x, 0.0)).x);
    float R = abs(texture2D(uVort, vUv + vec2(uDx.x, 0.0)).x);
    float T = abs(texture2D(uVort, vUv + vec2(0.0, uDx.y)).x);
    float B = abs(texture2D(uVort, vUv - vec2(0.0, uDx.y)).x);
    float C = texture2D(uVort, vUv).x;
    vec2 force = 0.5 * vec2(T - B, R - L);
    force /= length(force) + 0.0001;
    force *= uCurl * C;
    force.y *= -1.0;
    vec2 vel = texture2D(uVel, vUv).xy + force * uDt;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const PRESSURE = `
  precision highp float;
  uniform sampler2D uPres;
  uniform sampler2D uDiv;
  uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uPres, vUv - vec2(uDx.x, 0.0)).x;
    float R = texture2D(uPres, vUv + vec2(uDx.x, 0.0)).x;
    float T = texture2D(uPres, vUv + vec2(0.0, uDx.y)).x;
    float B = texture2D(uPres, vUv - vec2(0.0, uDx.y)).x;
    float d = texture2D(uDiv, vUv).x;
    gl_FragColor = vec4((L + R + T + B - d) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const GRAD_SUB = `
  precision highp float;
  uniform sampler2D uPres;
  uniform sampler2D uVel;
  uniform vec2 uDx;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uPres, vUv - vec2(uDx.x, 0.0)).x;
    float R = texture2D(uPres, vUv + vec2(uDx.x, 0.0)).x;
    float T = texture2D(uPres, vUv + vec2(0.0, uDx.y)).x;
    float B = texture2D(uPres, vUv - vec2(0.0, uDx.y)).x;
    vec2 vel = texture2D(uVel, vUv).xy - 0.5 * vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

// Watercolor display — paper grain, granulation, soft gamma, pigment bloom
const DISPLAY = `
  precision highp float;
  uniform sampler2D uTex;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;

    // Paper grain — three octaves of value noise
    float grain = vnoise(vUv * 520.0) * 0.50
                + vnoise(vUv * 1100.0) * 0.30
                + vnoise(vUv * 2300.0) * 0.20;

    // Granulation: pigment settles unevenly, strongest in mid-tones
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    float granScale = lum * (1.0 - lum) * 3.8;
    float gran = vnoise(vUv * 160.0 + c.rg * 2.5);
    c *= 0.86 + gran * 0.28 * granScale;

    // Soft watercolor gamma — keep it luminous but painterly
    c = pow(max(c, vec3(0.0)), vec3(0.62));

    // Paper grain overlay — just enough to read as texture
    c += (grain - 0.5) * 0.038;

    // Wet-edge pooling — darken where luminosity is highest (pigment accumulation)
    float edge = smoothstep(0.55, 0.85, lum);
    c *= 1.0 - edge * 0.22;

    // Vignette
    vec2 uv = vUv * 2.0 - 1.0;
    float vig = pow(clamp(1.0 - dot(uv * 0.48, uv * 0.48), 0.0, 1.0), 0.55);
    c *= vig * 0.80 + 0.20;

    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }
`;

// ─── Simulation config ───────────────────────────────────────────────────────

const SIM_RES         = 128;
const DYE_RES         = 512;
const PRESSURE_ITERS  = 20;
const VEL_DISS        = 0.984;   // velocity fades, motion feels languid
const DYE_DISS        = 0.994;   // dye lingers — washes accumulate
const CURL_STRENGTH   = 9;       // gentle swirl, not turbulent
const SPLAT_RADIUS    = 0.009;   // large soft blooms

// Watercolor palette — muted, painterly, dark-ground
const PALETTE: [number, number, number][] = [
  [0.38, 0.50, 0.34],  // sage wash
  [0.52, 0.42, 0.24],  // warm ochre
  [0.18, 0.34, 0.38],  // prussian blue-green
  [0.58, 0.52, 0.36],  // pale wheat
  [0.24, 0.40, 0.28],  // sap green
  [0.44, 0.32, 0.20],  // raw sienna
  [0.30, 0.44, 0.40],  // dusty teal
];

// ─── WebGL helpers ───────────────────────────────────────────────────────────

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl: WebGLRenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return p;
}

function uloc(gl: WebGLRenderingContext, prog: WebGLProgram, name: string) {
  return gl.getUniformLocation(prog, name);
}

interface FBO { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; }

function createFBO(gl: WebGLRenderingContext, w: number, h: number,
  iformat: number, format: number, type: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, iformat, w, h, 0, format, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { tex, fbo, w, h };
}

function createDoubleFBO(gl: WebGLRenderingContext, w: number, h: number,
  iformat: number, format: number, type: number, filter: number) {
  let a = createFBO(gl, w, h, iformat, format, type, filter);
  let b = createFBO(gl, w, h, iformat, format, type, filter);
  return {
    get read() { return a; },
    get write() { return b; },
    swap() { [a, b] = [b, a]; },
  };
}

function bindTex(gl: WebGLRenderingContext, unit: number, tex: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  return unit;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FluidSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return;

    const halfExt  = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    const texType  = halfExt ? halfExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const linFilter = halfExt ? gl.LINEAR : gl.NEAREST;

    const advectProg  = createProgram(gl, ADVECT);
    const splatProg   = createProgram(gl, SPLAT);
    const divProg     = createProgram(gl, DIVERGENCE);
    const curlProg    = createProgram(gl, CURL);
    const vortProg    = createProgram(gl, VORTICITY);
    const presProg    = createProgram(gl, PRESSURE);
    const gradProg    = createProgram(gl, GRAD_SUB);
    const displayProg = createProgram(gl, DISPLAY);

    const quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog: WebGLProgram) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      const loc = gl!.getAttribLocation(prog, "aPos");
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }

    let velocity   = createDoubleFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, linFilter);
    let dye        = createDoubleFBO(gl, DYE_RES, DYE_RES, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    let pressure   = createDoubleFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let divergence = createFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let curlFBO    = createFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);

    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();

    // Mouse tracked on window so it works even when cursor is over text
    const mouse = { x: 0.5, y: 0.5, dx: 0, dy: 0, active: false };
    let prevX = 0.5, prevY = 0.5;

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1.0 - (e.clientY - r.top) / r.height;
      if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) {
        mouse.active = false; return;
      }
      mouse.dx = x - prevX;
      mouse.dy = y - prevY;
      mouse.x = x; mouse.y = y;
      mouse.active = true;
      prevX = x; prevY = y;
    };
    const onMouseLeave = () => { mouse.active = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    function drawQuad(fbo: WebGLFramebuffer | null, w: number, h: number) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.viewport(0, 0, w, h);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      const aspect = canvas!.width / canvas!.height;

      gl!.useProgram(splatProg);
      bindQuad(splatProg);

      gl!.uniform1i(uloc(gl!, splatProg, "uTgt"), bindTex(gl!, 0, velocity.read.tex));
      gl!.uniform2f(uloc(gl!, splatProg, "uPt"), x, y);
      gl!.uniform3f(uloc(gl!, splatProg, "uColor"), dx * 5, dy * 5, 0);
      gl!.uniform1f(uloc(gl!, splatProg, "uRadius"), SPLAT_RADIUS);
      gl!.uniform1f(uloc(gl!, splatProg, "uAspect"), aspect);
      drawQuad(velocity.write.fbo, velocity.write.w, velocity.write.h);
      velocity.swap();

      gl!.uniform1i(uloc(gl!, splatProg, "uTgt"), bindTex(gl!, 0, dye.read.tex));
      gl!.uniform3f(uloc(gl!, splatProg, "uColor"), color[0], color[1], color[2]);
      gl!.uniform1f(uloc(gl!, splatProg, "uRadius"), SPLAT_RADIUS * 1.6);
      drawQuad(dye.write.fbo, dye.write.w, dye.write.h);
      dye.swap();
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      gl!.useProgram(curlProg);
      bindQuad(curlProg);
      gl!.uniform1i(uloc(gl!, curlProg, "uVel"), bindTex(gl!, 0, velocity.read.tex));
      gl!.uniform2f(uloc(gl!, curlProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(curlFBO.fbo, SIM_RES, SIM_RES);

      gl!.useProgram(vortProg);
      bindQuad(vortProg);
      gl!.uniform1i(uloc(gl!, vortProg, "uVort"), bindTex(gl!, 0, curlFBO.tex));
      gl!.uniform1i(uloc(gl!, vortProg, "uVel"),  bindTex(gl!, 1, velocity.read.tex));
      gl!.uniform2f(uloc(gl!, vortProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      gl!.uniform1f(uloc(gl!, vortProg, "uCurl"), CURL_STRENGTH);
      gl!.uniform1f(uloc(gl!, vortProg, "uDt"), dt);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      gl!.useProgram(divProg);
      bindQuad(divProg);
      gl!.uniform1i(uloc(gl!, divProg, "uVel"), bindTex(gl!, 0, velocity.read.tex));
      gl!.uniform2f(uloc(gl!, divProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(divergence.fbo, SIM_RES, SIM_RES);

      gl!.useProgram(presProg);
      bindQuad(presProg);
      gl!.uniform1i(uloc(gl!, presProg, "uDiv"), bindTex(gl!, 1, divergence.tex));
      gl!.uniform2f(uloc(gl!, presProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl!.uniform1i(uloc(gl!, presProg, "uPres"), bindTex(gl!, 0, pressure.read.tex));
        drawQuad(pressure.write.fbo, SIM_RES, SIM_RES);
        pressure.swap();
      }

      gl!.useProgram(gradProg);
      bindQuad(gradProg);
      gl!.uniform1i(uloc(gl!, gradProg, "uPres"), bindTex(gl!, 0, pressure.read.tex));
      gl!.uniform1i(uloc(gl!, gradProg, "uVel"),  bindTex(gl!, 1, velocity.read.tex));
      gl!.uniform2f(uloc(gl!, gradProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      gl!.useProgram(advectProg);
      bindQuad(advectProg);
      gl!.uniform1i(uloc(gl!, advectProg, "uVel"), bindTex(gl!, 0, velocity.read.tex));
      gl!.uniform1i(uloc(gl!, advectProg, "uSrc"), bindTex(gl!, 1, velocity.read.tex));
      gl!.uniform2f(uloc(gl!, advectProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      gl!.uniform1f(uloc(gl!, advectProg, "uDt"), dt);
      gl!.uniform1f(uloc(gl!, advectProg, "uDiss"), VEL_DISS);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      gl!.uniform1i(uloc(gl!, advectProg, "uVel"), bindTex(gl!, 0, velocity.read.tex));
      gl!.uniform1i(uloc(gl!, advectProg, "uSrc"), bindTex(gl!, 1, dye.read.tex));
      gl!.uniform2f(uloc(gl!, advectProg, "uDx"), 1/DYE_RES, 1/DYE_RES);
      gl!.uniform1f(uloc(gl!, advectProg, "uDiss"), DYE_DISS);
      drawQuad(dye.write.fbo, DYE_RES, DYE_RES);
      dye.swap();
    }

    function render() {
      gl!.useProgram(displayProg);
      bindQuad(displayProg);
      gl!.uniform1i(uloc(gl!, displayProg, "uTex"), bindTex(gl!, 0, dye.read.tex));
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    // Ambient splats — slow, large, gentle washes building up over time
    let lastSplat = 0;
    let nextInterval = 2500;
    let colorIdx = 0;

    function autoSplat(now: number) {
      if (now - lastSplat < nextInterval) return;
      lastSplat = now;
      nextInterval = 2000 + Math.random() * 3000;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.0004 + Math.random() * 0.0006;
      splat(
        0.15 + Math.random() * 0.7,
        0.15 + Math.random() * 0.7,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        PALETTE[colorIdx++ % PALETTE.length]
      );
    }

    // Seed — slow overlapping washes so it's alive immediately
    const seeds = [
      { x: 0.3, y: 0.6, a: 0.8,  s: 0.0006, c: 0 },
      { x: 0.6, y: 0.4, a: 2.4,  s: 0.0005, c: 1 },
      { x: 0.5, y: 0.7, a: 4.5,  s: 0.0007, c: 2 },
      { x: 0.7, y: 0.3, a: 1.2,  s: 0.0004, c: 3 },
      { x: 0.2, y: 0.4, a: 3.8,  s: 0.0005, c: 4 },
      { x: 0.8, y: 0.6, a: 0.4,  s: 0.0006, c: 5 },
    ];
    seeds.forEach(({ x, y, a, s, c }) =>
      splat(x, y, Math.cos(a) * s, Math.sin(a) * s, PALETTE[c])
    );

    let raf = 0;
    let last = performance.now();
    let mouseColorIdx = 0;

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.016);
      last = now;

      if (mouse.active && (Math.abs(mouse.dx) > 0.0001 || Math.abs(mouse.dy) > 0.0001)) {
        splat(mouse.x, mouse.y, mouse.dx, mouse.dy,
          PALETTE[mouseColorIdx % PALETTE.length]);
        if (Math.random() < 0.03) mouseColorIdx++;
        mouse.dx = 0; mouse.dy = 0;
      }

      autoSplat(now);
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
