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

// Display: gamma lift + contrast + edge vignette
const DISPLAY = `
  precision highp float;
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uTex, vUv).rgb;
    c = pow(max(c, vec3(0.0)), vec3(0.72));
    c *= 1.1;
    vec2 uv = vUv * 2.0 - 1.0;
    float vig = pow(clamp(1.0 - dot(uv * 0.45, uv * 0.45), 0.0, 1.0), 0.5);
    c *= vig;
    gl_FragColor = vec4(c, 1.0);
  }
`;

// ─── Simulation constants ────────────────────────────────────────────────────

const SIM_RES = 128;
const DYE_RES = 512;
const PRESSURE_ITERS = 22;
const VEL_DISS = 0.996;
const DYE_DISS = 0.978;
const CURL_STRENGTH = 28;
const SPLAT_RADIUS = 0.0032;

// Military / hunter green palette — dark, desaturated
const PALETTE: [number, number, number][] = [
  [0.11, 0.22, 0.08],  // hunter green
  [0.28, 0.31, 0.12],  // OD military green
  [0.20, 0.26, 0.09],  // dark olive
  [0.52, 0.43, 0.22],  // dark tan
  [0.14, 0.19, 0.07],  // deep forest
  [0.38, 0.34, 0.18],  // muted khaki
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

function uniform(gl: WebGLRenderingContext, prog: WebGLProgram, name: string) {
  return gl.getUniformLocation(prog, name);
}

interface FBO {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
}

function createFBO(
  gl: WebGLRenderingContext,
  w: number,
  h: number,
  iformat: number,
  format: number,
  type: number,
  filter: number
): FBO {
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

function createDoubleFBO(
  gl: WebGLRenderingContext,
  w: number,
  h: number,
  iformat: number,
  format: number,
  type: number,
  filter: number
) {
  let a = createFBO(gl, w, h, iformat, format, type, filter);
  let b = createFBO(gl, w, h, iformat, format, type, filter);
  return {
    get read() { return a; },
    get write() { return b; },
    swap() { [a, b] = [b, a]; },
  };
}

function bindTexture(gl: WebGLRenderingContext, unit: number, tex: WebGLTexture) {
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
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return;

    // Extensions
    const halfFloatExt = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    const texType = halfFloatExt ? halfFloatExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const filter = halfFloatExt ? gl.LINEAR : gl.NEAREST;

    // Programs
    const advectProg   = createProgram(gl, ADVECT);
    const splatProg    = createProgram(gl, SPLAT);
    const divProg      = createProgram(gl, DIVERGENCE);
    const curlProg     = createProgram(gl, CURL);
    const vortProg     = createProgram(gl, VORTICITY);
    const presProg     = createProgram(gl, PRESSURE);
    const gradProg     = createProgram(gl, GRAD_SUB);
    const displayProg  = createProgram(gl, DISPLAY);

    // Fullscreen quad
    const quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog: WebGLProgram) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      const loc = gl!.getAttribLocation(prog, "aPos");
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }

    // FBOs
    let velocity = createDoubleFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, filter);
    let dye      = createDoubleFBO(gl, DYE_RES, DYE_RES, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    let pressure = createDoubleFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let divergence = createFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    let curlFBO    = createFBO(gl, SIM_RES, SIM_RES, gl.RGBA, gl.RGBA, texType, gl.NEAREST);

    // Canvas sizing
    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();

    // Mouse state
    const mouse = { x: 0.5, y: 0.5, dx: 0, dy: 0, down: false };
    let prevX = 0, prevY = 0;

    function toUV(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width,
        y: 1.0 - (e.clientY - r.top) / r.height,
      };
    }

    canvas.addEventListener("mousemove", (e) => {
      const { x, y } = toUV(e);
      mouse.dx = x - prevX;
      mouse.dy = y - prevY;
      mouse.x = x;
      mouse.y = y;
      mouse.down = true;
      prevX = x; prevY = y;
    });
    canvas.addEventListener("mouseleave", () => { mouse.down = false; mouse.dx = 0; mouse.dy = 0; });

    // ── Simulation steps ──────────────────────────────────────────────────

    function drawQuad(fbo: WebGLFramebuffer | null, w: number, h: number) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.viewport(0, 0, w, h);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      const aspect = canvas!.width / canvas!.height;

      // velocity splat
      gl!.useProgram(splatProg);
      bindQuad(splatProg);
      gl!.uniform1i(uniform(gl!, splatProg, "uTgt"), bindTexture(gl!, 0, velocity.read.tex));
      gl!.uniform2f(uniform(gl!, splatProg, "uPt"), x, y);
      gl!.uniform3f(uniform(gl!, splatProg, "uColor"), dx * 6, dy * 6, 0);
      gl!.uniform1f(uniform(gl!, splatProg, "uRadius"), SPLAT_RADIUS);
      gl!.uniform1f(uniform(gl!, splatProg, "uAspect"), aspect);
      drawQuad(velocity.write.fbo, velocity.write.w, velocity.write.h);
      velocity.swap();

      // dye splat
      gl!.uniform1i(uniform(gl!, splatProg, "uTgt"), bindTexture(gl!, 0, dye.read.tex));
      gl!.uniform3f(uniform(gl!, splatProg, "uColor"), color[0], color[1], color[2]);
      gl!.uniform1f(uniform(gl!, splatProg, "uRadius"), SPLAT_RADIUS * 1.4);
      drawQuad(dye.write.fbo, dye.write.w, dye.write.h);
      dye.swap();
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      // Curl
      gl!.useProgram(curlProg);
      bindQuad(curlProg);
      gl!.uniform1i(uniform(gl!, curlProg, "uVel"), bindTexture(gl!, 0, velocity.read.tex));
      gl!.uniform2f(uniform(gl!, curlProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(curlFBO.fbo, SIM_RES, SIM_RES);

      // Vorticity confinement
      gl!.useProgram(vortProg);
      bindQuad(vortProg);
      gl!.uniform1i(uniform(gl!, vortProg, "uVort"), bindTexture(gl!, 0, curlFBO.tex));
      gl!.uniform1i(uniform(gl!, vortProg, "uVel"),  bindTexture(gl!, 1, velocity.read.tex));
      gl!.uniform2f(uniform(gl!, vortProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      gl!.uniform1f(uniform(gl!, vortProg, "uCurl"), CURL_STRENGTH);
      gl!.uniform1f(uniform(gl!, vortProg, "uDt"), dt);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      // Divergence
      gl!.useProgram(divProg);
      bindQuad(divProg);
      gl!.uniform1i(uniform(gl!, divProg, "uVel"), bindTexture(gl!, 0, velocity.read.tex));
      gl!.uniform2f(uniform(gl!, divProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(divergence.fbo, SIM_RES, SIM_RES);

      // Pressure solve
      gl!.useProgram(presProg);
      bindQuad(presProg);
      gl!.uniform1i(uniform(gl!, presProg, "uDiv"), bindTexture(gl!, 1, divergence.tex));
      gl!.uniform2f(uniform(gl!, presProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl!.uniform1i(uniform(gl!, presProg, "uPres"), bindTexture(gl!, 0, pressure.read.tex));
        drawQuad(pressure.write.fbo, SIM_RES, SIM_RES);
        pressure.swap();
      }

      // Gradient subtraction
      gl!.useProgram(gradProg);
      bindQuad(gradProg);
      gl!.uniform1i(uniform(gl!, gradProg, "uPres"), bindTexture(gl!, 0, pressure.read.tex));
      gl!.uniform1i(uniform(gl!, gradProg, "uVel"),  bindTexture(gl!, 1, velocity.read.tex));
      gl!.uniform2f(uniform(gl!, gradProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      // Advect velocity
      gl!.useProgram(advectProg);
      bindQuad(advectProg);
      gl!.uniform1i(uniform(gl!, advectProg, "uVel"), bindTexture(gl!, 0, velocity.read.tex));
      gl!.uniform1i(uniform(gl!, advectProg, "uSrc"), bindTexture(gl!, 1, velocity.read.tex));
      gl!.uniform2f(uniform(gl!, advectProg, "uDx"), 1/SIM_RES, 1/SIM_RES);
      gl!.uniform1f(uniform(gl!, advectProg, "uDt"), dt);
      gl!.uniform1f(uniform(gl!, advectProg, "uDiss"), VEL_DISS);
      drawQuad(velocity.write.fbo, SIM_RES, SIM_RES);
      velocity.swap();

      // Advect dye
      gl!.uniform1i(uniform(gl!, advectProg, "uVel"), bindTexture(gl!, 0, velocity.read.tex));
      gl!.uniform1i(uniform(gl!, advectProg, "uSrc"), bindTexture(gl!, 1, dye.read.tex));
      gl!.uniform2f(uniform(gl!, advectProg, "uDx"), 1/DYE_RES, 1/DYE_RES);
      gl!.uniform1f(uniform(gl!, advectProg, "uDiss"), DYE_DISS);
      drawQuad(dye.write.fbo, DYE_RES, DYE_RES);
      dye.swap();
    }

    function render() {
      gl!.useProgram(displayProg);
      bindQuad(displayProg);
      gl!.uniform1i(uniform(gl!, displayProg, "uTex"), bindTexture(gl!, 0, dye.read.tex));
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    // ── Ambient auto-splats ───────────────────────────────────────────────
    let lastAutoSplat = 0;
    let autoSplatInterval = 2200;
    let colorIndex = 0;

    function autoSplat(now: number) {
      if (now - lastAutoSplat < autoSplatInterval) return;
      lastAutoSplat = now;
      autoSplatInterval = 1800 + Math.random() * 2000;

      const x = 0.2 + Math.random() * 0.6;
      const y = 0.2 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.0008 + Math.random() * 0.0012;
      const color = PALETTE[colorIndex % PALETTE.length];
      colorIndex++;
      splat(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color);
    }

    // Seed with a few initial splats so it's alive immediately
    const seedColors: [number, number, number][] = [
      PALETTE[0], PALETTE[1], PALETTE[3], PALETTE[2], PALETTE[5],
    ];
    seedColors.forEach((c, i) => {
      const angle = (i / seedColors.length) * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.15;
      splat(
        0.5 + Math.cos(angle) * r,
        0.5 + Math.sin(angle) * r,
        -Math.sin(angle) * 0.002,
         Math.cos(angle) * 0.002,
        c
      );
    });

    // ── RAF loop ──────────────────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();
    let mouseColorIndex = 0;

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.016);
      last = now;

      if (mouse.down && (Math.abs(mouse.dx) > 0.0001 || Math.abs(mouse.dy) > 0.0001)) {
        const c = PALETTE[mouseColorIndex % PALETTE.length];
        splat(mouse.x, mouse.y, mouse.dx, mouse.dy, c);
        if (Math.random() < 0.04) mouseColorIndex++;
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
