"use client";

import { useEffect, useRef } from "react";

/**
 * The artifact — an ASCII density field held in a frame beside the name.
 * (File keeps its historical name; earlier full-viewport versions live in
 * git history.)
 *
 * A grid of type glyphs whose density is driven by domain-warped waves on a
 * sporadic clock: the pattern idles, then lurches with a displacement kick,
 * like a feedback network getting hit. Filament veins thread the voids; a
 * hollow halo drifts through; rows occasionally tear sideways and heal.
 * Two materials — ascii mass and hex printout — collage with hard seams,
 * broken into grain by ordered dithering.
 *
 * Interaction: the cursor carves a persistent channel that slowly heals;
 * "field-pulse" CustomEvents send a brightening ring through the sheet.
 * Deliberately calm: ~30fps, motion is erratic but brightness never spikes.
 * Decorative only — every failure path is a silent no-op.
 */

const RAMPS = [
  [" ", ".", "·", ":", ";", "=", "+", "*", "#", "%", "@"],
  [" ", "0", "7", "1", "4", "9", "3", "b", "8", "e", "f"],
];
const TIER_ALPHA = [0.2, 0.36, 0.55];

// Ordered-dither threshold (Bayer 4×4) — breaks density bands into grain.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Pattern params: xScale, yScale, flow speed, threshold.
const SX = 0.012;
const SY = 0.02;
const FS = 0.6;
const TH = 0.52;

const sstep = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

export function ContourField({ calm = false }: { calm?: boolean }) {
  void calm; // legacy prop, no longer meaningful inside the frame
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const parent = cv.parentElement;
    if (!parent) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const cell = 14;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };
    const pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    let frame = 0;

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

    let residue = new Float32Array(0);

    // Sporadic clock — idles, then lurches with a displacement kick.
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    let fieldT = rnd(0, 100);
    let lastMs = 0;
    let burstUntil = 0;
    let burstSpeed = 1;
    let nextBurstAt = 1500;
    let offX = 0;
    let offY = 0;
    let tears: { row: number; shift: number; until: number }[] = [];

    // Hex-material collage patches drifting through the frame.
    const patches = [
      { x: 0.15, y: 0.25, w: 150, h: 80, a: -0.12, vx: 2.2, vy: 0.8 },
      { x: 0.65, y: 0.6, w: 110, h: 130, a: 0.18, vx: -1.5, vy: 1.2 },
    ];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = parent.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      residue = new Float32Array(cols * rows);
      buildSprites();
      if (reduced) draw(performance.now());
    };

    const draw = (tms: number) => {
      const t = tms * 0.001;

      const dt = Math.min(0.1, Math.max(0, (tms - lastMs) * 0.001));
      lastMs = tms;
      const inBurst = tms < burstUntil;
      fieldT += dt * (inBurst ? burstSpeed : 0.45);
      if (tms >= nextBurstAt) {
        burstSpeed = rnd(3.2, 8.5);
        burstUntil = tms + rnd(160, 520);
        nextBurstAt = tms + rnd(1600, 6000);
        offX += rnd(-85, 85);
        offY += rnd(-55, 55);
        if (Math.random() < 0.75) {
          tears.push({
            row: Math.floor(rnd(0, rows)),
            shift: Math.round(rnd(2, 5)) * (Math.random() < 0.5 ? -1 : 1),
            until: tms + rnd(400, 1100),
          });
        }
      }
      tears = tears.filter((te) => te.until > tms);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

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

      if (residue.length === cols * rows) {
        for (let i = 0; i < residue.length; i++) residue[i] *= 0.962;
        if (mouse.x > -9e3 && mouse.x > -40 && mouse.x < w + 40 && mouse.y > -40 && mouse.y < h + 40) {
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

      const rampMax = RAMPS[0].length - 1;

      const patchGeo = patches.map((pc) => {
        const mw = w + pc.w * 2;
        const mh = h + pc.h * 2;
        const px = ((((pc.x * w + pc.vx * t) % mw) + mw) % mw) - pc.w;
        const py = ((((pc.y * h + pc.vy * t) % mh) + mh) % mh) - pc.h;
        return { px, py, cos: Math.cos(pc.a), sin: Math.sin(pc.a), pc };
      });

      // Halo — one hollow ring drifting through the frame, radius breathing.
      const hcx = w * (0.5 + 0.34 * Math.sin(fieldT * 0.07));
      const hcy = h * (0.5 + 0.3 * Math.sin(fieldT * 0.052 + 2.1));
      const hr = Math.min(w, h) * (0.28 + 0.09 * Math.sin(fieldT * 0.11));

      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        let tearShift = 0;
        for (const te of tears) {
          if (Math.abs(cy - te.row) < 2) tearShift = te.shift * cell;
        }
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2 + tearShift;

          // Domain-warped layered waves — masses grow veins and swirls.
          const wx0 = x + offX;
          const wy0 = y + offY;
          const wx =
            wx0 + 70 * Math.sin(wy0 * 0.011 + fieldT * 0.31 + Math.sin(wx0 * 0.007) * 1.8);
          const wy = wy0 + 70 * Math.sin(wx0 * 0.009 - fieldT * 0.24);
          let d =
            0.5 +
            0.3 *
              Math.sin(
                wx * SX + fieldT * FS + Math.sin(wy * SY * 1.7 - fieldT * FS * 0.6) * 1.6
              ) +
            0.24 * Math.sin(wy * SY - fieldT * FS * 0.8 + wx * SX * 0.5) +
            0.14 * Math.sin((wx + wy) * SX * 1.9 + fieldT * FS * 0.4);

          d = sstep(TH, TH + 0.45, d);

          // Filament veins — thin winding threads through the voids.
          const veinArg = Math.sin(wx * 0.006 + Math.sin(wy * 0.008) * 2.2 + fieldT * 0.18);
          const vein = Math.max(0, 1 - Math.abs(veinArg) * 3.2);
          d += vein * 0.55;

          // Halo ring.
          const hdx = x - hcx;
          const hdy = y - hcy;
          const hd = Math.sqrt(hdx * hdx + hdy * hdy) - hr;
          if (hd > -40 && hd < 40) d += 0.55 * Math.exp((-hd * hd) / 520);

          // Material zones with hard collage seams.
          const zone =
            0.5 +
            0.5 *
              Math.sin(
                wx * 0.004 + fieldT * 0.11 + Math.sin(wy * 0.005 - fieldT * 0.09) * 2.1
              );
          let material = zone > 0.66 ? 1 : 0;

          for (const g of patchGeo) {
            const rx = (x - g.px) * g.cos + (y - g.py) * g.sin;
            const ry = -(x - g.px) * g.sin + (y - g.py) * g.cos;
            if (rx > 0 && rx < g.pc.w && ry > 0 && ry < g.pc.h) {
              material = 1;
              d += 0.2;
              break;
            }
          }

          // Cursor: immediate well + persistent carved channel.
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          if (residue.length === cols * rows) {
            d += residue[cy * cols + cx];
          }

          for (const pu of pulses) {
            const age = t - pu.t0;
            const dx2 = x - pu.x;
            const dy2 = y - pu.y;
            const ring = Math.sqrt(dx2 * dx2 + dy2 * dy2) - age * 240;
            if (ring < 90 && ring > -90) {
              d += 0.5 * Math.exp((-ring * ring) / 1800) * Math.exp(-age * 2.2);
            }
          }

          const v = d;
          if (v <= 0.06) continue;
          const bay = (BAYER[cy & 3][cx & 3] / 16 - 0.5) * 2.4;
          const idx = Math.min(rampMax, Math.max(1, Math.round(v * rampMax + bay)));
          const tier = v > 0.66 ? 2 : v > 0.38 ? 1 : 0;
          ctx.drawImage(sprites[material][tier][idx], x - cell / 2, y - cell / 2, cell, cell);
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
    // Mouse and pulse coordinates arrive in viewport space; map into the
    // frame. Reading the rect per event is a layout read only — cheap.
    const onMouse = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    };
    const onMouseOut = () => {
      mouse.tx = -1e4;
      mouse.ty = -1e4;
    };
    const onPulse = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (!d) return;
      const r = cv.getBoundingClientRect();
      if (pulses.length >= 8) pulses.shift();
      pulses.push({ x: d.x - r.left, y: d.y - r.top, t0: performance.now() * 0.001 });
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (!reduced) window.addEventListener("field-pulse", onPulse);
    if (!coarse && !reduced) {
      window.addEventListener("mousemove", onMouse, { passive: true });
      document.addEventListener("mouseleave", onMouseOut);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

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
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden />;
}
