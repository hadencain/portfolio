"use client";

import { useEffect, useRef } from "react";

/**
 * Full-viewport ASCII density field — the site's persistent background.
 * (File keeps its historical name; the contour-line renderer it replaced
 * lives in git history.)
 *
 * A grid of type glyphs whose density is driven by slow layered waves —
 * organic masses emerge from character density like dithered print. The
 * pattern morphs by scroll position between section anchors. Slow vertical
 * smear bands drag columns downward like a mis-fed scan.
 *
 * Interaction: the cursor carves a trailing erosion well through the field;
 * "field-pulse" CustomEvents from cards send a brightening ring outward.
 * Pulse detail {x, y} is in viewport coordinates.
 *
 * Deliberately calm: ~30fps, no flashes, glyphs fade between states.
 * Decorative only — every failure path is a silent no-op.
 */

const ANCHOR_IDS = ["audio", "security", "ar-mobile", "threed", "about"];

// Three materials, like different scans collaged into one sheet:
// ascii mass, hex printout, block dither. Index 0 of each draws nothing.
const RAMPS = [
  [" ", ".", "·", ":", ";", "=", "+", "*", "#", "%", "@"],
  [" ", "0", "7", "1", "4", "9", "3", "b", "8", "e", "f"],
  [" ", "·", "░", "░", "▒", "▒", "▒", "▓", "▓", "█", "█"],
];
const TIER_ALPHA = [0.2, 0.36, 0.55];

// Per-section pattern parameters, interpolated continuously by scroll:
// [xScale, yScale, drift speed, threshold]. Threshold controls sparseness.
const MODE_PARAMS: [number, number, number, number][] = [
  [0.012, 0.02, 0.6, 0.52], // hero/audio — broad slow masses
  [0.02, 0.008, 0.45, 0.56], // security — horizontal striation
  [0.009, 0.009, 0.35, 0.5], // ar/mobile — large soft dome-like blobs
  [0.016, 0.028, 0.5, 0.58], // 3d — tighter layered grain
  [0.011, 0.016, 0.25, 0.6], // about/contact — sparse idle drift
];

const sstep = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

export function ContourField({ calm = false }: { calm?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const cell = coarse ? 18 : 15; // css px per glyph cell
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let anchors: { top: number; mode: number }[] = [];
    const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };
    const pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    let frame = 0;

    // Pre-rendered glyph sprites: [material][tier][rampIndex] — fillText
    // once, then drawImage thousands of times per frame.
    let sprites: HTMLCanvasElement[][][] = [];
    const buildSprites = () => {
      sprites = RAMPS.map((ramp) =>
        TIER_ALPHA.map((alpha) =>
          ramp.map((ch) => {
            const s = document.createElement("canvas");
            s.width = Math.ceil(cell * dpr);
            s.height = Math.ceil(cell * dpr);
            const sc = s.getContext("2d");
            if (sc && ch !== " ") {
              sc.scale(dpr, dpr);
              sc.font = `${Math.round(cell * 0.9)}px ui-monospace, monospace`;
              sc.textAlign = "center";
              sc.textBaseline = "middle";
              sc.fillStyle = `rgba(227, 221, 208, ${alpha})`;
              sc.fillText(ch, cell / 2, cell / 2);
            }
            return s;
          })
        )
      );
    };

    // Cursor residue — the cursor carves a channel that persists and slowly
    // heals. A splat is deposited every frame at the smoothed cursor; the
    // whole grid decays toward zero.
    let residue = new Float32Array(0);

    // Two slow vertical smear bands — columns whose sample point drags
    // downward and back over ~20s, like a scanner losing registration.
    const bands = [
      { c0: 0.12, c1: 0.2, amp: 70, period: 21 },
      { c0: 0.62, c1: 0.74, amp: 110, period: 27 },
    ];

    // Hard-edged collage patches — rotated blocks of a different material
    // drifting across the sheet at a few px/s, like pasted-in scraps.
    const patches = [
      { x: 0.2, y: 0.3, w: 260, h: 120, a: -0.12, vx: 2.4, vy: 0.9 },
      { x: 0.7, y: 0.65, w: 180, h: 200, a: 0.18, vx: -1.6, vy: 1.3 },
      { x: 0.45, y: 0.85, w: 320, h: 90, a: 0.05, vx: 1.1, vy: -0.7 },
    ];

    const measure = () => {
      anchors = ANCHOR_IDS.flatMap((id, i) => {
        const el = document.getElementById(id);
        return el
          ? [{ top: el.getBoundingClientRect().top + window.scrollY, mode: i }]
          : [];
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      residue = new Float32Array(cols * rows);
      buildSprites();
      measure();
      if (reduced) draw(performance.now());
    };

    const progress = () => {
      if (anchors.length === 0) return 0;
      const yc = window.scrollY + h * 0.5;
      if (yc <= anchors[0].top) return 0;
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (yc < b.top)
          return a.mode + ((yc - a.top) / (b.top - a.top || 1)) * (b.mode - a.mode);
      }
      return anchors[anchors.length - 1].mode;
    };

    const draw = (tms: number) => {
      const t = tms * 0.001;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Interpolate pattern params by section progress.
      const p = Math.max(0, Math.min(MODE_PARAMS.length - 1, progress()));
      const i0 = Math.floor(p);
      const i1 = Math.min(i0 + 1, MODE_PARAMS.length - 1);
      const ft = p - i0;
      const sx = lerp(MODE_PARAMS[i0][0], MODE_PARAMS[i1][0], ft);
      const sy = lerp(MODE_PARAMS[i0][1], MODE_PARAMS[i1][1], ft);
      const fs = lerp(MODE_PARAMS[i0][2], MODE_PARAMS[i1][2], ft);
      const th = lerp(MODE_PARAMS[i0][3], MODE_PARAMS[i1][3], ft);

      // Full presence in the hero, gently dimmed once content arrives;
      // calm pages hold the dimmed level from the top.
      const scrollDim = 1 - 0.35 * sstep(0.3, 1, window.scrollY / (h * 0.9));
      const dim = calm ? Math.min(scrollDim, 0.55) : scrollDim;

      for (let i = pulses.length - 1; i >= 0; i--) {
        if (t - pulses[i].t0 > 1.6) pulses.splice(i, 1);
      }

      if (mouse.tx < -9e3 || mouse.x < -9e3) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      } else {
        mouse.x += (mouse.tx - mouse.x) * 0.14;
        mouse.y += (mouse.ty - mouse.y) * 0.14;
      }

      // Deposit the cursor's carving into the residue grid, then let the
      // whole sheet heal a little each frame.
      if (residue.length === cols * rows) {
        for (let i = 0; i < residue.length; i++) residue[i] *= 0.962;
        if (mouse.x > -9e3) {
          const mcx = Math.round(mouse.x / cell);
          const mcy = Math.round(mouse.y / cell);
          for (let oy = -2; oy <= 2; oy++) {
            for (let ox = -2; ox <= 2; ox++) {
              const gx = mcx + ox;
              const gy = mcy + oy;
              if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
              const fall = Math.exp(-(ox * ox + oy * oy) / 2.6);
              const gi = gy * cols + gx;
              residue[gi] = Math.max(-1.6, residue[gi] - 0.55 * fall);
            }
          }
        }
      }

      // Scan tears: two row bands crawl down the sheet, shifting their
      // sample columns sideways — a slipped scanline, healed a moment later.
      const tearRow1 = ((t * 0.55) % (rows + 8)) - 4;
      const tearRow2 = ((t * 0.23 + rows * 0.6) % (rows + 8)) - 4;

      const rampMax = RAMPS[0].length - 1;
      const spriteSize = cell;

      // Patch corners move; precompute rotation terms once per frame.
      const patchGeo = patches.map((pc) => {
        const mw = w + pc.w * 2;
        const mh = h + pc.h * 2;
        const px = ((((pc.x * w + pc.vx * t) % mw) + mw) % mw) - pc.w;
        const py = ((((pc.y * h + pc.vy * t) % mh) + mh) % mh) - pc.h;
        return { px, py, cos: Math.cos(pc.a), sin: Math.sin(pc.a), pc };
      });

      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        // Tear offset applies to a 2-row band around each crawling tear.
        let tearShift = 0;
        if (Math.abs(cy - tearRow1) < 1.5) tearShift = 3 * cell;
        else if (Math.abs(cy - tearRow2) < 1.5) tearShift = -2 * cell;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2 + tearShift;
          const nx = x / w;

          // Vertical smear: inside a band, sample as if the column were
          // dragged downward — content appears to stretch and drip.
          let ys = y;
          for (const b of bands) {
            if (nx >= b.c0 && nx <= b.c1) {
              const edge =
                sstep(b.c0, b.c0 + 0.02, nx) * sstep(b.c1, b.c1 - 0.02, nx);
              const ph = 0.5 + 0.5 * Math.sin((t / b.period) * Math.PI * 2);
              ys -= b.amp * ph * edge;
            }
          }

          // Layered waves — cheap organic density, no allocation.
          let d =
            0.5 +
            0.3 *
              Math.sin(
                x * sx + t * fs + Math.sin(ys * sy * 1.7 - t * fs * 0.6) * 1.6
              ) +
            0.24 * Math.sin(ys * sy - t * fs * 0.8 + x * sx * 0.5) +
            0.14 * Math.sin((x + ys) * sx * 1.9 + t * fs * 0.4);

          // Threshold shaping: below th empties out, above builds mass.
          d = sstep(th, th + 0.45, d);

          // Gripper margin — the field releases the top edge so the nav
          // always sits on clean ink.
          d *= sstep(56, 130, y);

          // Material: slow zone noise picks the scan this cell belongs to;
          // hard quantized boundaries read as collage seams.
          const zone =
            0.5 +
            0.5 *
              Math.sin(x * 0.004 + t * 0.05 + Math.sin(y * 0.005 - t * 0.04) * 2.1);
          let material = zone > 0.72 ? 1 : zone > 0.4 ? 0 : 2;

          // Collage patches override the material and lift density a touch.
          for (const g of patchGeo) {
            const rx = (x - g.px) * g.cos + (y - g.py) * g.sin;
            const ry = -(x - g.px) * g.sin + (y - g.py) * g.cos;
            if (rx > 0 && rx < g.pc.w && ry > 0 && ry < g.pc.h) {
              material = 2;
              d += 0.18;
              break;
            }
          }

          // Cursor: immediate well + the persistent carved channel.
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          if (residue.length === cols * rows) {
            d += residue[cy * cols + cx];
          }

          // Pulses: a ring passes through and lifts density briefly.
          for (const pu of pulses) {
            const age = t - pu.t0;
            const dx2 = x - pu.x;
            const dy2 = y - pu.y;
            const ring = Math.sqrt(dx2 * dx2 + dy2 * dy2) - age * 240;
            if (ring < 90 && ring > -90) {
              d += 0.5 * Math.exp((-ring * ring) / 1800) * Math.exp(-age * 2.2);
            }
          }

          const v = d * dim;
          if (v <= 0.04) continue;
          const idx = Math.min(rampMax, Math.max(1, Math.round(v * rampMax)));
          const tier = v > 0.66 ? 2 : v > 0.38 ? 1 : 0;
          ctx.drawImage(
            sprites[material][tier][idx],
            x - cell / 2,
            y - cell / 2,
            spriteSize,
            spriteSize
          );
        }
      }
    };

    // ~30fps — the field is a slow medium; half rate halves the load.
    const loop = (tms: number) => {
      frame++;
      if (frame % 2 === 0) draw(tms);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running && !reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVis = () => (document.hidden ? stop() : start());
    const onMouse = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    const onMouseOut = () => {
      mouse.tx = -1e4;
      mouse.ty = -1e4;
    };
    const onScrollStatic = () => draw(performance.now());
    const onPulse = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (!d) return;
      if (pulses.length >= 8) pulses.shift();
      pulses.push({ x: d.x, y: d.y, t0: performance.now() * 0.001 });
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (!reduced) window.addEventListener("field-pulse", onPulse);
    if (!coarse && !reduced) {
      window.addEventListener("mousemove", onMouse, { passive: true });
      document.addEventListener("mouseleave", onMouseOut);
    }
    if (reduced) window.addEventListener("scroll", onScrollStatic, { passive: true });

    const ro = new ResizeObserver(() => {
      measure();
      if (reduced) draw(performance.now());
    });
    ro.observe(document.body);

    if (reduced) {
      draw(performance.now());
    } else {
      start();
    }

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("field-pulse", onPulse);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onMouseOut);
      window.removeEventListener("scroll", onScrollStatic);
    };
  }, [calm]);

  return (
    <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />
  );
}
