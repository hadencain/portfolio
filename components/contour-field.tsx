"use client";

import { useEffect, useRef } from "react";

/**
 * The artifact frame — five very different glyph-grid simulations sharing
 * one toolset: pre-rendered glyph sprites, Bayer ordered dithering, a
 * sporadic clock (idle flow + lurching bursts), cursor interaction, and
 * "field-pulse" rings from the page.
 *
 *   1 MASS         — domain-warped density masses, veins, halo, scan tears
 *   2 CASCADE      — columnar streams raining at uneven speeds
 *   3 SWARM        — orbiting agents dragging comet trails
 *   4 AUTOMATON    — cellular colony (B3/S23) growing and dying
 *   5 INTERFERENCE — two wave gratings beating into moiré fringes
 *   6 RIPPLE       — point sources ringing a tank; the cursor is a stone
 *   7 SPECTRUM     — analyzer bars with falling peak caps
 *   8 LISSAJOUS    — a parametric figure tracing itself in light
 *   9 VORTEX       — spiral arms winding around a wandering eye
 *  10 SCOPE        — an oscilloscope trace over slow static
 *  11 ANTS         — Langton's ants building highways out of rule-following
 *  12 DUNES        — wind-warped strata creeping sideways
 *  13 CONSTELLATION— drifting stars joined by dotted hairlines
 *  14 METABALLS    — solid masses merging and splitting
 *  15 TYPESETTER   — a document typing and retyping itself
 *
 * Deliberately calm: ~30fps, motion is erratic but brightness never spikes.
 * Decorative only — every failure path is a silent no-op.
 */

const RAMPS = [
  [" ", ".", "·", ":", ";", "=", "+", "*", "#", "%", "@"],
  [" ", "0", "7", "1", "4", "9", "3", "b", "8", "e", "f"],
];
const TIER_ALPHA = [0.2, 0.36, 0.55];

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const sstep = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

export function ContourField({ mode = 1 }: { mode?: number }) {
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

    // Shared scratch grids + per-mode state, sized on resize.
    let residue = new Float32Array(0); // carve (negative) or trails (positive)
    let life = new Uint8Array(0); // automaton cells
    let lifeNext = new Uint8Array(0);
    let ghost = new Float32Array(0); // automaton after-image
    let colSpeed = new Float32Array(0); // cascade column speeds
    let colSeed = new Float32Array(0);
    let scratchCols = new Float32Array(0); // per-column scratch (spectrum, scope)
    let barCur = new Float32Array(0); // spectrum bar heights
    let barPeak = new Float32Array(0); // spectrum peak caps
    let agents: { x: number; y: number; vx: number; vy: number }[] = [];
    // Lissajous frequency ratio + phase; vortex eye and arm count.
    let lissA = 3;
    let lissB = 4;
    let lissD = 0;
    let vortX = 0.5;
    let vortY = 0.5;
    let arms = 3;
    let scopeF1 = 0.02;
    let scopeF2 = 0.011;
    // Ants walk cells; stars drift; typeset rows carry their own layout.
    let ants: { cx: number; cy: number; dir: number }[] = [];
    let stars: { x: number; y: number; ph: number }[] = [];
    let rowStart = new Float32Array(0);
    let rowLen = new Float32Array(0);
    let rowSpeed = new Float32Array(0);
    let rowPhase = new Float32Array(0);

    const regenLayout = () => {
      for (let r = 0; r < rows; r++) {
        if (Math.random() < 0.28) {
          rowLen[r] = 0; // paragraph break
          continue;
        }
        rowStart[r] = Math.floor(rnd(1, Math.max(2, cols * 0.3)));
        rowLen[r] = Math.floor(rnd(cols * 0.25, cols * 0.65));
        rowSpeed[r] = rnd(0.5, 1.6);
        rowPhase[r] = rnd(0, 300);
      }
    };

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    let fieldT = rnd(0, 100);
    let lastMs = 0;
    let burstUntil = 0;
    let burstSpeed = 1;
    let nextBurstAt = 1500;
    let offX = 0;
    let offY = 0;
    let theta = rnd(0, Math.PI); // interference grating angle
    let tears: { row: number; shift: number; until: number }[] = [];

    const patches = [
      { x: 0.15, y: 0.25, w: 150, h: 80, a: -0.12, vx: 2.2, vy: 0.8 },
      { x: 0.65, y: 0.6, w: 110, h: 130, a: 0.18, vx: -1.5, vy: 1.2 },
    ];

    const seedLife = () => {
      life.fill(0);
      ghost.fill(0);
      for (let i = 0; i < life.length; i++) {
        if (Math.random() < 0.16) life[i] = 1;
      }
    };

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
      life = new Uint8Array(cols * rows);
      lifeNext = new Uint8Array(cols * rows);
      ghost = new Float32Array(cols * rows);
      colSpeed = new Float32Array(cols);
      colSeed = new Float32Array(cols);
      scratchCols = new Float32Array(cols);
      barCur = new Float32Array(cols);
      barPeak = new Float32Array(cols);
      for (let c = 0; c < cols; c++) {
        colSpeed[c] = rnd(0.35, 1.4);
        colSeed[c] = rnd(0, 400);
      }
      seedLife();
      if (mode === 11) {
        life.fill(0);
        ghost.fill(0);
      }
      ants = Array.from({ length: 4 }, () => ({
        cx: Math.floor(rnd(cols * 0.2, cols * 0.8)),
        cy: Math.floor(rnd(rows * 0.2, rows * 0.8)),
        dir: Math.floor(rnd(0, 4)),
      }));
      stars = Array.from({ length: 26 }, () => ({
        x: rnd(w * 0.06, w * 0.94),
        y: rnd(h * 0.06, h * 0.94),
        ph: rnd(0, Math.PI * 2),
      }));
      rowStart = new Float32Array(rows);
      rowLen = new Float32Array(rows);
      rowSpeed = new Float32Array(rows);
      rowPhase = new Float32Array(rows);
      regenLayout();
      const n = Math.min(150, Math.floor((cols * rows) / 34));
      agents = Array.from({ length: n }, () => ({
        x: rnd(0, w),
        y: rnd(0, h),
        vx: rnd(-1.5, 1.5),
        vy: rnd(-1.5, 1.5),
      }));
      buildSprites();
      if (reduced) draw(performance.now());
    };

    // Glyph putter — dither, tier, draw. The one voice all five fields share.
    const rampMax = RAMPS[0].length - 1;
    const put = (cx: number, cy: number, v: number, material: number, xShift = 0) => {
      if (v <= 0.06) return;
      const bay = (BAYER[cy & 3][cx & 3] / 16 - 0.5) * 2.4;
      const idx = Math.min(rampMax, Math.max(1, Math.round(v * rampMax + bay)));
      const tier = v > 0.66 ? 2 : v > 0.38 ? 1 : 0;
      ctx.drawImage(
        sprites[material][tier][idx],
        cx * cell + xShift,
        cy * cell,
        cell,
        cell
      );
    };

    const pulseAdd = (x: number, y: number, t: number) => {
      let add = 0;
      for (const pu of pulses) {
        const age = t - pu.t0;
        const dx = x - pu.x;
        const dy = y - pu.y;
        const ring = Math.sqrt(dx * dx + dy * dy) - age * 240;
        if (ring < 90 && ring > -90) {
          add += 0.5 * Math.exp((-ring * ring) / 1800) * Math.exp(-age * 2.2);
        }
      }
      return add;
    };

    const carveAtCursor = () => {
      if (residue.length !== cols * rows) return;
      for (let i = 0; i < residue.length; i++) residue[i] *= 0.962;
      if (mouse.x > -40 && mouse.x < w + 40 && mouse.y > -40 && mouse.y < h + 40) {
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
    };

    // ── 1 MASS ──────────────────────────────────────────────────────────────
    const drawMass = (t: number) => {
      carveAtCursor();
      const patchGeo = patches.map((pc) => {
        const mw = w + pc.w * 2;
        const mh = h + pc.h * 2;
        const px = ((((pc.x * w + pc.vx * t) % mw) + mw) % mw) - pc.w;
        const py = ((((pc.y * h + pc.vy * t) % mh) + mh) % mh) - pc.h;
        return { px, py, cos: Math.cos(pc.a), sin: Math.sin(pc.a), pc };
      });
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
          const wx0 = x + offX;
          const wy0 = y + offY;
          const wx =
            wx0 + 70 * Math.sin(wy0 * 0.011 + fieldT * 0.31 + Math.sin(wx0 * 0.007) * 1.8);
          const wy = wy0 + 70 * Math.sin(wx0 * 0.009 - fieldT * 0.24);
          let d =
            0.5 +
            0.3 * Math.sin(wx * 0.012 + fieldT * 0.6 + Math.sin(wy * 0.034 - fieldT * 0.36) * 1.6) +
            0.24 * Math.sin(wy * 0.02 - fieldT * 0.48 + wx * 0.006) +
            0.14 * Math.sin((wx + wy) * 0.023 + fieldT * 0.24);
          d = sstep(0.52, 0.97, d);
          const veinArg = Math.sin(wx * 0.006 + Math.sin(wy * 0.008) * 2.2 + fieldT * 0.18);
          d += Math.max(0, 1 - Math.abs(veinArg) * 3.2) * 0.55;
          const hdx = x - hcx;
          const hdy = y - hcy;
          const hd = Math.sqrt(hdx * hdx + hdy * hdy) - hr;
          if (hd > -40 && hd < 40) d += 0.55 * Math.exp((-hd * hd) / 520);
          const zone =
            0.5 + 0.5 * Math.sin(wx * 0.004 + fieldT * 0.11 + Math.sin(wy * 0.005 - fieldT * 0.09) * 2.1);
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
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          d += residue[cy * cols + cx] + pulseAdd(x, y, t);
          put(cx, cy, d, material, tearShift);
        }
      }
    };

    // ── 2 CASCADE ───────────────────────────────────────────────────────────
    const drawCascade = (t: number) => {
      carveAtCursor();
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        let tearShift = 0;
        for (const te of tears) {
          if (Math.abs(cy - te.row) < 2) tearShift = te.shift * cell;
        }
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          let d = 0;
          // Two streams per column, different lengths and phases.
          for (let k = 0; k < 2; k++) {
            const sp = colSpeed[(cx + k * 37) % cols];
            const len = 7 + 11 * sp;
            const span = rows + len * 2;
            const head =
              ((fieldT * (5 + 9 * sp) + colSeed[cx] + k * 53) % span) - len;
            const dd = head - cy;
            if (dd >= 0 && dd < len) {
              d += (1 - dd / len) * (k === 0 ? 1 : 0.6);
            }
          }
          // Sparse static debris between streams.
          const n = Math.sin(x * 1.7 + y * 2.3 + colSeed[cx]);
          if (n > 0.96) d += 0.22;
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          d += residue[cy * cols + cx] + pulseAdd(x, y, t);
          put(cx, cy, d, colSpeed[cx] > 0.95 ? 1 : 0, tearShift);
        }
      }
    };

    // ── 3 SWARM ─────────────────────────────────────────────────────────────
    const drawSwarm = (t: number) => {
      // Trails decay; agents deposit as they fly.
      for (let i = 0; i < residue.length; i++) residue[i] *= 0.93;
      const a1x = w * (0.5 + 0.35 * Math.sin(fieldT * 0.21));
      const a1y = h * (0.5 + 0.35 * Math.cos(fieldT * 0.17));
      const useMouse =
        mouse.x > -40 && mouse.x < w + 40 && mouse.y > -40 && mouse.y < h + 40;
      const a2x = useMouse ? mouse.x : w * (0.5 + 0.3 * Math.cos(fieldT * 0.13));
      const a2y = useMouse ? mouse.y : h * (0.5 - 0.3 * Math.sin(fieldT * 0.19));
      for (let i = 0; i < agents.length; i++) {
        const ag = agents[i];
        const toA = i % 2 === 0;
        const ax = toA ? a1x : a2x;
        const ay = toA ? a1y : a2y;
        const dx = ax - ag.x;
        const dy = ay - ag.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Pull toward the attractor plus a perpendicular swirl — orbits.
        ag.vx += (dx / dist) * 0.32 - (dy / dist) * 0.24;
        ag.vy += (dy / dist) * 0.32 + (dx / dist) * 0.24;
        ag.vx *= 0.975;
        ag.vy *= 0.975;
        const sp = Math.sqrt(ag.vx * ag.vx + ag.vy * ag.vy) || 1;
        const cap = 3.4;
        if (sp > cap) {
          ag.vx = (ag.vx / sp) * cap;
          ag.vy = (ag.vy / sp) * cap;
        }
        ag.x += ag.vx;
        ag.y += ag.vy;
        if (ag.x < 0) ag.x += w;
        if (ag.x >= w) ag.x -= w;
        if (ag.y < 0) ag.y += h;
        if (ag.y >= h) ag.y -= h;
        const gx = Math.floor(ag.x / cell);
        const gy = Math.floor(ag.y / cell);
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) {
          const gi = gy * cols + gx;
          residue[gi] = Math.min(1.3, residue[gi] + 0.5);
        }
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const d = residue[cy * cols + cx] + pulseAdd(x, y, t);
          // Trails are ascii; the odd-numbered half of the swarm prints hex.
          put(cx, cy, d, (cx + cy) % 7 === 0 ? 1 : 0);
        }
      }
    };

    // ── 4 AUTOMATON ─────────────────────────────────────────────────────────
    let genFrame = 0;
    const stepLife = () => {
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          let n = 0;
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              if (!ox && !oy) continue;
              const gx = (cx + ox + cols) % cols;
              const gy = (cy + oy + rows) % rows;
              n += life[gy * cols + gx];
            }
          }
          const i = cy * cols + cx;
          lifeNext[i] = life[i] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
        }
      }
      const tmp = life;
      life = lifeNext;
      lifeNext = tmp;
    };
    const drawAutomaton = (t: number) => {
      genFrame++;
      if (genFrame % 8 === 0) stepLife();
      // Cursor paints life.
      if (mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h) {
        const mcx = Math.floor(mouse.x / cell);
        const mcy = Math.floor(mouse.y / cell);
        for (let oy = 0; oy <= 1; oy++) {
          for (let ox = 0; ox <= 1; ox++) {
            const gx = (mcx + ox) % cols;
            const gy = (mcy + oy) % rows;
            life[gy * cols + gx] = 1;
          }
        }
      }
      for (let i = 0; i < ghost.length; i++) {
        ghost[i] = Math.max(ghost[i] * 0.88, life[i]);
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const i = cy * cols + cx;
          const d = ghost[i] + pulseAdd(x, y, t);
          put(cx, cy, d, 0);
        }
      }
    };

    // ── 5 INTERFERENCE ──────────────────────────────────────────────────────
    const drawInterference = (t: number) => {
      carveAtCursor();
      const c1x = w * (0.5 + 0.3 * Math.sin(fieldT * 0.12));
      const c1y = h * (0.5 + 0.3 * Math.cos(fieldT * 0.09));
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const scanY = ((fieldT * 42) % (h + 160)) - 80;
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const dx = x - c1x;
          const dy = y - c1y;
          const r1 = Math.sqrt(dx * dx + dy * dy);
          const g1 = Math.sin(r1 * 0.05 - fieldT * 1.1);
          const g2 = Math.sin((x * cosT + y * sinT) * 0.055 + fieldT * 0.7);
          let d = sstep(0.55, 0.95, g1 * g2 * 0.5 + 0.5) * 1.05;
          const near = Math.exp(-((y - scanY) * (y - scanY)) / 2600);
          d += near * 0.35;
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          d += residue[cy * cols + cx] + pulseAdd(x, y, t);
          put(cx, cy, d, near > 0.4 ? 1 : 0);
        }
      }
    };

    // ── 6 RIPPLE ────────────────────────────────────────────────────────────
    const drawRipple = (t: number) => {
      const srcs: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        srcs.push([
          w * (0.5 + 0.36 * Math.sin(fieldT * (0.08 + i * 0.03) + i * 2.1)),
          h * (0.5 + 0.34 * Math.cos(fieldT * (0.06 + i * 0.04) + i * 1.4)),
        ]);
      }
      const overBox =
        mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h;
      if (overBox) srcs.push([mouse.x, mouse.y]);
      const reach = Math.min(w, h) * 0.75;
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          let d = 0;
          let material = 0;
          for (let s = 0; s < srcs.length; s++) {
            const dx = x - srcs[s][0];
            const dy = y - srcs[s][1];
            const r = Math.sqrt(dx * dx + dy * dy);
            const band = 0.5 + 0.5 * Math.sin(r * 0.075 - fieldT * 2.1 - s * 1.7);
            d += band * band * band * Math.exp(-r / reach) * 0.9;
            if (r < 52) material = 1;
          }
          d += pulseAdd(x, y, t);
          put(cx, cy, d, material);
        }
      }
    };

    // ── 7 SPECTRUM ──────────────────────────────────────────────────────────
    const drawSpectrum = (t: number) => {
      for (let c = 0; c < cols; c++) {
        const xn = c / cols;
        let n =
          0.5 +
          0.28 * Math.sin(xn * 9 + fieldT * 1.7 + colSeed[c] * 0.02) +
          0.2 * Math.sin(xn * 23 - fieldT * 2.6) +
          0.14 * Math.sin(xn * 47 + fieldT * 1.1 + colSeed[c] * 0.05);
        const mdx = c * cell - mouse.x;
        if (mouse.x > -40) n += Math.exp(-(mdx * mdx) / 8000) * 0.45;
        const target = h * (0.06 + 0.72 * Math.max(0, Math.min(1, n)));
        barCur[c] += (target - barCur[c]) * 0.18;
        barPeak[c] = Math.max(barPeak[c] - 1.4, barCur[c]);
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const fromBottom = h - y;
          let d = 0;
          let material = 0;
          if (fromBottom < barCur[cx]) {
            d = 0.35 + 0.65 * (1 - fromBottom / (barCur[cx] || 1));
          }
          const peakY = h - barPeak[cx];
          if (Math.abs(y - peakY) < cell * 0.7) {
            d = Math.max(d, 0.95);
            material = 1;
          }
          d += pulseAdd(x, y, t);
          put(cx, cy, d, material);
        }
      }
    };

    // ── 8 LISSAJOUS ─────────────────────────────────────────────────────────
    const drawLissajous = (t: number) => {
      for (let i = 0; i < residue.length; i++) residue[i] *= 0.945;
      const overBox =
        mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h;
      const ccx = overBox ? w * 0.5 + (mouse.x - w * 0.5) * 0.3 : w * 0.5;
      const ccy = overBox ? h * 0.5 + (mouse.y - h * 0.5) * 0.3 : h * 0.5;
      const P = 110;
      for (let i = 0; i < P; i++) {
        const ph = (i / P) * Math.PI * 2;
        const px = ccx + w * 0.4 * Math.sin(lissA * ph + fieldT * 0.8);
        const py = ccy + h * 0.38 * Math.sin(lissB * ph + fieldT * 0.63 + lissD);
        const gx = Math.floor(px / cell);
        const gy = Math.floor(py / cell);
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) {
          const gi = gy * cols + gx;
          residue[gi] = Math.min(1.3, residue[gi] + 0.42);
        }
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const d = residue[cy * cols + cx] + pulseAdd(x, y, t);
          put(cx, cy, d, (cx * 31 + cy * 17) % 11 === 0 ? 1 : 0);
        }
      }
    };

    // ── 9 VORTEX ────────────────────────────────────────────────────────────
    const drawVortex = (t: number) => {
      const overBox =
        mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h;
      if (overBox) {
        vortX += (mouse.x / w - vortX) * 0.03;
        vortY += (mouse.y / h - vortY) * 0.03;
      } else {
        vortX += (0.5 + 0.2 * Math.sin(fieldT * 0.11) - vortX) * 0.01;
        vortY += (0.5 + 0.18 * Math.cos(fieldT * 0.08) - vortY) * 0.01;
      }
      const vx = vortX * w;
      const vy = vortY * h;
      const reach = Math.min(w, h) * 0.72;
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const dx = x - vx;
          const dy = y - vy;
          const r = Math.sqrt(dx * dx + dy * dy);
          const ang = Math.atan2(dy, dx);
          const band =
            0.5 + 0.5 * Math.sin(ang * arms + Math.log(r + 9) * 5.2 - fieldT * 1.5);
          let d =
            sstep(0.55, 0.95, band) * Math.exp(-r / reach) * (r < 22 ? 0 : 1.05);
          const zone = 0.5 + 0.5 * Math.sin(ang * 2 + fieldT * 0.3);
          d += pulseAdd(x, y, t);
          put(cx, cy, d, zone > 0.78 ? 1 : 0);
        }
      }
    };

    // ── 10 SCOPE ────────────────────────────────────────────────────────────
    const drawScope = (t: number) => {
      // Trace position per column; amplitude swells near the cursor.
      for (let c = 0; c < cols; c++) {
        const x = c * cell;
        let amp = h * 0.26;
        if (mouse.x > -40) {
          const mdx = x - mouse.x;
          amp += Math.exp(-(mdx * mdx) / 14000) * h * 0.16;
        }
        scratchCols[c] =
          h * 0.5 +
          amp *
            (0.62 * Math.sin(x * scopeF1 + fieldT * 2.6) +
              0.38 * Math.sin(x * scopeF2 * 2.7 - fieldT * 3.9));
      }
      const staticSeed = Math.floor(fieldT * 2.3);
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          let d = 0;
          let material = 0;
          // Slow sparse static — reseeds every half beat, never flickers fast.
          const hash = Math.sin(cx * 127.1 + cy * 311.7 + staticSeed * 74.7) * 43758.5;
          if (hash - Math.floor(hash) < 0.055) d = 0.22;
          // Graticule centerline, every third column.
          if (Math.abs(y - h / 2) < cell * 0.5 && cx % 3 === 0) d = Math.max(d, 0.14);
          // The trace itself, two cells thick with a hot core.
          const dyTrace = Math.abs(y - scratchCols[cx]);
          if (dyTrace < cell * 0.7) {
            d = 1;
            material = cx % 9 === 0 ? 1 : 0;
          } else if (dyTrace < cell * 1.6) {
            d = Math.max(d, 0.45);
          }
          d += pulseAdd(x, y, t);
          put(cx, cy, d, material);
        }
      }
    };

    // ── 11 ANTS ─────────────────────────────────────────────────────────────
    const DX = [1, 0, -1, 0];
    const DY = [0, 1, 0, -1];
    const drawAnts = (t: number) => {
      // Rule: on empty turn right and mark; on marked turn left and clear.
      for (const ant of ants) {
        for (let s = 0; s < 42; s++) {
          const i = ant.cy * cols + ant.cx;
          if (life[i]) {
            ant.dir = (ant.dir + 3) % 4;
            life[i] = 0;
          } else {
            ant.dir = (ant.dir + 1) % 4;
            life[i] = 1;
          }
          ant.cx = (ant.cx + DX[ant.dir] + cols) % cols;
          ant.cy = (ant.cy + DY[ant.dir] + rows) % rows;
        }
      }
      // Cursor scribbles marks the ants must negotiate.
      if (mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h) {
        const mcx = Math.floor(mouse.x / cell);
        const mcy = Math.floor(mouse.y / cell);
        if (mcx >= 0 && mcy >= 0 && mcx < cols && mcy < rows) {
          life[mcy * cols + mcx] = 1;
        }
      }
      for (let i = 0; i < ghost.length; i++) {
        ghost[i] = Math.max(ghost[i] * 0.9, life[i] * 0.8);
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          let d = ghost[cy * cols + cx] + pulseAdd(x, y, t);
          let material = 0;
          for (const ant of ants) {
            if (ant.cx === cx && ant.cy === cy) {
              d = 1;
              material = 1;
            }
          }
          put(cx, cy, d, material);
        }
      }
    };

    // ── 12 DUNES ────────────────────────────────────────────────────────────
    const drawDunes = (t: number) => {
      carveAtCursor();
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          // Strata warped by a slow wind; crests are sharp ridges.
          const yy =
            y +
            34 * Math.sin(x * 0.008 + fieldT * 0.13) +
            14 * Math.sin(x * 0.021 - fieldT * 0.08);
          const crest =
            1 - Math.abs(Math.sin(yy * 0.05 - fieldT * 0.3 + Math.sin(x * 0.005) * 1.2));
          let d = crest * crest * crest * 1.1;
          // Saltating grains hopping in the troughs, reseeded slowly.
          const seed = Math.floor(fieldT * 1.6);
          const hash = Math.sin(cx * 91.7 + cy * 233.1 + seed * 51.3) * 43758.5;
          if (hash - Math.floor(hash) < 0.03) d = Math.max(d, 0.3);
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          d += residue[cy * cols + cx] + pulseAdd(x, y, t);
          put(cx, cy, d, crest > 0.93 ? 1 : 0);
        }
      }
    };

    // ── 13 CONSTELLATION ────────────────────────────────────────────────────
    const drawConstellation = (t: number) => {
      const pts = stars.map((s, i) => ({
        x: s.x + 14 * Math.sin(fieldT * 0.14 + s.ph),
        y: s.y + 12 * Math.cos(fieldT * 0.11 + s.ph * 1.7),
        b: 0.55 + 0.4 * Math.sin(fieldT * 0.5 + s.ph * 3 + i),
      }));
      const overBox =
        mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h;
      // Dotted hairlines between neighbours (and to the cursor).
      const link = (ax: number, ay: number, bx: number, by: number, v: number) => {
        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(dist / cell);
        for (let s = 1; s < steps; s += 2) {
          const px = ax + (dx * s) / steps;
          const py = ay + (dy * s) / steps;
          put(Math.floor(px / cell), Math.floor(py / cell), v, 0);
        }
      };
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          if (dx * dx + dy * dy < 170 * 170) {
            link(pts[i].x, pts[i].y, pts[j].x, pts[j].y, 0.24);
          }
        }
        if (overBox) {
          const dx = pts[i].x - mouse.x;
          const dy = pts[i].y - mouse.y;
          if (dx * dx + dy * dy < 210 * 210) {
            link(pts[i].x, pts[i].y, mouse.x, mouse.y, 0.34);
          }
        }
      }
      for (const p of pts) {
        const cx = Math.floor(p.x / cell);
        const cy = Math.floor(p.y / cell);
        put(cx, cy, p.b, 1);
        put(cx + 1, cy, p.b * 0.3, 0);
        put(cx - 1, cy, p.b * 0.3, 0);
      }
      // Pulses still travel the sky.
      for (let cy = 0; cy < rows; cy += 2) {
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
      }
    };

    // ── 14 METABALLS ────────────────────────────────────────────────────────
    const drawMetaballs = (t: number) => {
      const blobs: [number, number, number][] = [];
      for (let i = 0; i < 5; i++) {
        blobs.push([
          w * (0.5 + 0.34 * Math.sin(fieldT * (0.17 + i * 0.05) + i * 2.4)),
          h * (0.5 + 0.32 * Math.cos(fieldT * (0.13 + i * 0.04) + i * 1.1)),
          Math.min(w, h) * (0.1 + 0.05 * Math.sin(fieldT * 0.4 + i * 2)),
        ]);
      }
      if (mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h) {
        blobs.push([mouse.x, mouse.y, Math.min(w, h) * 0.09]);
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          let s = 0;
          for (const [bx, by, br] of blobs) {
            const dx = x - bx;
            const dy = y - by;
            s += (br * br) / (dx * dx + dy * dy + 1);
          }
          const rim = Math.exp(-Math.abs(s - 1) * 5);
          let d = sstep(0.86, 1.3, s) + rim * 0.5;
          d += pulseAdd(x, y, t);
          put(cx, cy, d, rim > 0.55 ? 1 : 0);
        }
      }
    };

    // ── 15 TYPESETTER ───────────────────────────────────────────────────────
    const drawTypesetter = (t: number) => {
      carveAtCursor();
      for (let cy = 0; cy < rows; cy++) {
        if (!rowLen[cy]) continue;
        const y = cy * cell + cell / 2;
        const span = rowLen[cy] + 26;
        const p = (fieldT * rowSpeed[cy] * 5 + rowPhase[cy]) % span;
        const typed = Math.min(p, rowLen[cy]);
        const headCx = rowStart[cy] + Math.floor(typed);
        for (let k = 0; k < typed; k++) {
          const cx = rowStart[cy] + k;
          if (cx >= cols) break;
          const x = cx * cell + cell / 2;
          // Older text settles dimmer; the head burns bright.
          let d = cx === headCx - 1 ? 1 : 0.5 + 0.2 * Math.sin(cx * 7 + cy * 13);
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const m2 = mdx * mdx + mdy * mdy;
          if (m2 < 22000) d -= Math.exp(-m2 / 5200) * 1.1;
          d += residue[cy * cols + cx] + pulseAdd(x, y, t);
          put(cx, cy, d, cx === headCx - 1 ? 1 : (cx + cy) % 13 === 0 ? 1 : 0);
        }
      }
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
        theta += rnd(-0.5, 0.5);
        // Mode-flavored kicks.
        if (mode === 2) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.15) colSpeed[c] = rnd(0.35, 1.4);
          }
        } else if (mode === 3) {
          for (const ag of agents) {
            if (Math.random() < 0.4) {
              const a = rnd(0, Math.PI * 2);
              ag.vx = Math.cos(a) * 3;
              ag.vy = Math.sin(a) * 3;
            }
          }
        } else if (mode === 4) {
          for (let k = 0; k < 3; k++) {
            const bx = Math.floor(rnd(0, Math.max(1, cols - 10)));
            const by = Math.floor(rnd(0, Math.max(1, rows - 10)));
            for (let oy = 0; oy < 9; oy++) {
              for (let ox = 0; ox < 9; ox++) {
                if (Math.random() < 0.45) life[(by + oy) * cols + bx + ox] = 1;
              }
            }
          }
        } else if (mode === 7) {
          for (let c = 0; c < cols; c++) colSeed[c] = rnd(0, 400);
        } else if (mode === 8) {
          lissA = Math.floor(rnd(1, 8));
          lissB = Math.floor(rnd(1, 8));
          if (lissA === lissB) lissB = (lissB % 7) + 1;
          lissD = rnd(0, Math.PI);
        } else if (mode === 9) {
          arms = Math.floor(rnd(2, 6));
        } else if (mode === 10) {
          scopeF1 = rnd(0.012, 0.034);
          scopeF2 = rnd(0.006, 0.02);
        } else if (mode === 11) {
          // Teleport one ant to fresh ground.
          const ant = ants[Math.floor(rnd(0, ants.length))];
          if (ant) {
            ant.cx = Math.floor(rnd(0, cols));
            ant.cy = Math.floor(rnd(0, rows));
            ant.dir = Math.floor(rnd(0, 4));
          }
        } else if (mode === 13) {
          // A few stars relocate.
          for (const s of stars) {
            if (Math.random() < 0.15) {
              s.x = rnd(w * 0.06, w * 0.94);
              s.y = rnd(h * 0.06, h * 0.94);
            }
          }
        } else if (mode === 15) {
          regenLayout();
        }
        if ((mode === 1 || mode === 2) && Math.random() < 0.75) {
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

      if (mode === 2) drawCascade(t);
      else if (mode === 3) drawSwarm(t);
      else if (mode === 4) drawAutomaton(t);
      else if (mode === 5) drawInterference(t);
      else if (mode === 6) drawRipple(t);
      else if (mode === 7) drawSpectrum(t);
      else if (mode === 8) drawLissajous(t);
      else if (mode === 9) drawVortex(t);
      else if (mode === 10) drawScope(t);
      else if (mode === 11) drawAnts(t);
      else if (mode === 12) drawDunes(t);
      else if (mode === 13) drawConstellation(t);
      else if (mode === 14) drawMetaballs(t);
      else if (mode === 15) drawTypesetter(t);
      else drawMass(t);
    };

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
      // A single settled frame per mode; the automaton gets a few
      // generations so the soup shows structure.
      if (mode === 4) {
        for (let k = 0; k < 6; k++) stepLife();
        for (let i = 0; i < ghost.length; i++) ghost[i] = life[i];
      }
      if (mode === 11) {
        // Let the ants walk long enough to leave visible structure.
        for (let k = 0; k < 40; k++) drawAnts(0);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden />;
}
