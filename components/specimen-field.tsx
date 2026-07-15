"use client";

import { useEffect, useRef } from "react";

/**
 * The specimen frame — thirty-six glyph-grid sketches, one per catalog
 * entry, sharing the hero's toolset (glyph sprites, Bayer dither, sporadic
 * clock, field pulses, cursor) but none of its fields. Each sketch behaves
 * like the tool it stands for: reverbs shatter, wells accrete, scanners
 * redact, terrain snaps together tile by tile.
 *
 * Mode = catalog number, 001–036. Decorative only — silent no-op on failure.
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

// Label strip names, indexed by mode-1.
export const SPEC_NAMES = [
  "grains",
  "harmonics",
  "gate roll",
  "scrub",
  "step grid",
  "wavetable",
  "sorter",
  "fretboard",
  "shatter",
  "freeze bands",
  "accretion",
  "decoherence",
  "smear trail",
  "ejection",
  "erosion",
  "melt",
  "two plates",
  "slice tear",
  "osmosis",
  "delay stack",
  "layers",
  "chain walk",
  "reticle",
  "modules",
  "redaction",
  "dep tree",
  "log tail",
  "runaway fill",
  "port map",
  "pivot web",
  "hoard",
  "detonation",
  "history scrub",
  "divergence",
  "shelf print",
  "tile snap",
];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (a: number, b: number, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

export function SpecimenField({ mode = 1 }: { mode?: number }) {
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

    const rampMax = RAMPS[0].length - 1;
    const put = (cx: number, cy: number, v: number, material = 0, xShift = 0) => {
      if (v <= 0.06 || cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
      const bay = (BAYER[cy & 3][cx & 3] / 16 - 0.5) * 2.4;
      const idx = Math.min(rampMax, Math.max(1, Math.round(v * rampMax + bay)));
      const tier = v > 0.66 ? 2 : v > 0.38 ? 1 : 0;
      ctx.drawImage(sprites[material][tier][idx], cx * cell + xShift, cy * cell, cell, cell);
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

    // Dotted hairline in grid space.
    const link = (ax: number, ay: number, bx: number, by: number, v: number, mat = 0) => {
      const dx = bx - ax;
      const dy = by - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / cell));
      for (let s = 1; s < steps; s += 2) {
        put(Math.floor((ax + (dx * s) / steps) / cell), Math.floor((ay + (dy * s) / steps) / cell), v, mat);
      }
    };

    // Sporadic clock — idle flow with lurching bursts, same voice as the hero.
    let fieldT = rnd(0, 100);
    let lastMs = 0;
    let burstUntil = 0;
    let burstSpeed = 1;
    let nextBurstAt = 1500;

    // Shared scratch state; each mode claims what it needs in initMode().
    let scratch = new Float32Array(0);
    let colA = new Float32Array(0);
    // Loosely-typed per-mode bag — decorative module, mutation-heavy by design.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let S: any = {};

    const initMode = () => {
      scratch = new Float32Array(cols * rows);
      colA = new Float32Array(cols);
      S = { seed: Math.floor(rnd(1, 999)) };
      if (mode === 1) S.grains = [];
      if (mode === 3) {
        S.lanes = 8;
        S.probs = Array.from({ length: 8 }, () => rnd(0.15, 0.9));
        S.pulsesDown = [];
        S.lastTick = 0;
      }
      if (mode === 4) S.px = 0.5;
      if (mode === 5) {
        S.pattern = 0;
        S.sweeps = 0;
      }
      if (mode === 7) S.items = [];
      if (mode === 8) {
        S.root = 0;
        S.runFret = 0;
        S.runStr = 0;
      }
      if (mode === 9) {
        S.shards = [];
        S.nextHit = 0;
      }
      if (mode === 10) {
        S.bands = Array.from({ length: 6 }, () => ({
          state: Math.floor(rnd(0, 3)),
          off: 0,
          targ: 0,
        }));
      }
      if (mode === 11) {
        S.parts = [];
        S.mass = 0.2;
      }
      if (mode === 12) S.coh = [1, 1, 1];
      if (mode === 13) {
        S.frozen = 0;
        S.srcY = 0.5;
      }
      if (mode === 14) S.parts = [];
      if (mode === 15) {
        S.mass = 1;
        S.fronts = Array.from({ length: 4 }, (_, i) => ({
          a: rnd(0, Math.PI),
          d: -Math.max(w, h) * 0.7,
          sp: rnd(18, 42),
          k: i,
        }));
      }
      if (mode === 16) {
        S.off = new Float32Array(cols);
        S.integ = new Float32Array(cols).fill(1);
        S.bandY = -10;
      }
      if (mode === 18) {
        S.slices = Array.from({ length: 6 }, () => ({
          r: Math.floor(rnd(0, Math.max(1, rows))),
          hgt: Math.floor(rnd(1, 4)),
          off: 0,
          targ: 0,
        }));
      }
      if (mode === 19) S.blobs = [];
      if (mode === 20) S.delay = new Float32Array(rows);
      if (mode === 22) {
        const N = 10;
        S.nodes = Array.from({ length: N }, (_, i) => ({
          x: w * (0.5 + 0.38 * Math.cos((i / N) * Math.PI * 2 + 0.4)),
          y: h * (0.5 + 0.36 * Math.sin((i / N) * Math.PI * 2 + 0.4)),
        }));
        S.wgt = new Float32Array(N * N);
        S.at = 0;
        S.to = 1;
        S.prog = 1;
      }
      if (mode === 23) {
        S.rx = w * 0.3;
        S.ry = h * 0.3;
        S.locked = 0;
      }
      if (mode === 25) {
        S.head = 0;
        S.row = 0;
      }
      if (mode === 26) S.nodes = [{ x: w / 2, y: cell * 2, depth: 0, flag: false }];
      if (mode === 27) S.lines = [];
      if (mode === 28) {
        S.level = 0.1;
        S.alarm = 0;
      }
      if (mode === 30) {
        S.cx = w / 2;
        S.cy = h / 2;
        S.shell = 0;
        S.nodes = [];
        S.phase = 0;
      }
      if (mode === 31) {
        S.nest = { x: w * 0.18, y: h * 0.78 };
        S.pile = 2;
        S.items = [];
        S.birds = Array.from({ length: 3 }, () => ({
          x: w * 0.18,
          y: h * 0.78,
          st: 0,
          tx: 0,
          ty: 0,
        }));
      }
      if (mode === 32) {
        S.phase = 0;
        S.py = -h * 0.2;
        S.frag = [];
        S.verdict = 0;
        S.tv = 0;
      }
      if (mode === 33) {
        S.head = 0;
        S.ticks = Array.from({ length: 14 }, (_, i) => ({
          x: (i + 1) / 15 + rnd(-0.02, 0.02),
          n: Math.floor(rnd(1, 5)),
          bad: Math.random() < 0.22,
        }));
      }
      if (mode === 35) {
        S.slot = 0;
        S.layer = 0;
      }
      if (mode === 36) {
        S.placed = 0;
        S.order = [];
      }
    };

    // Per-mode lurch — retargets, reseeds, teleports. Fired by the clock.
    const kick = () => {
      if (mode === 3) {
        S.probs = S.probs.map((p: number) => (Math.random() < 0.4 ? rnd(0.15, 0.9) : p));
      } else if (mode === 5) {
        S.pattern++;
      } else if (mode === 8) {
        S.root = (S.root + Math.floor(rnd(1, 5))) % 12;
      } else if (mode === 10) {
        for (const b of S.bands) {
          if (Math.random() < 0.6) {
            b.state = Math.floor(rnd(0, 3));
            b.targ = Math.floor(rnd(-6, 7));
          }
        }
      } else if (mode === 12) {
        const k = Math.floor(rnd(0, 3));
        S.coh[k] = Math.random() < 0.5 ? rnd(0, 0.25) : 1;
      } else if (mode === 13) {
        S.frozen = Math.random() < 0.4 ? performance.now() + rnd(600, 1400) : 0;
      } else if (mode === 18) {
        for (const sl of S.slices) {
          if (Math.random() < 0.7) {
            sl.r = Math.floor(rnd(0, Math.max(1, rows)));
            sl.targ = Math.round(rnd(-5, 5));
          }
        }
        if (Math.random() < 0.2) for (const sl of S.slices) sl.targ = 0;
      } else if (mode === 21) {
        S.seed = Math.floor(rnd(1, 999));
      } else if (mode === 27) {
        S.storm = performance.now() + rnd(300, 900);
      } else if (mode === 36 && S.placed > 8) {
        S.placed = Math.max(0, S.placed - Math.floor(rnd(3, 7)));
      }
    };

    /* ── 1 GRAINS — a granular cloud popping around a wandering playhead ── */
    const s1 = (t: number) => {
      const px = w * (0.5 + 0.38 * Math.sin(fieldT * 0.4 + Math.sin(fieldT * 0.13) * 2));
      const py = h * (0.5 + 0.3 * Math.sin(fieldT * 0.27));
      for (let k = 0; k < 3; k++) {
        if (S.grains.length < 160 && Math.random() < 0.8) {
          const a = rnd(0, Math.PI * 2);
          const r = Math.abs(rnd(0, 1) * rnd(0, 1)) * Math.min(w, h) * 0.34;
          S.grains.push({
            x: px + Math.cos(a) * r,
            y: py + Math.sin(a) * r * 0.7,
            age: 0,
            dur: rnd(0.4, 1.6),
            m: Math.random() < 0.18 ? 1 : 0,
          });
        }
      }
      for (let i = S.grains.length - 1; i >= 0; i--) {
        const g = S.grains[i];
        g.age += 0.016;
        if (g.age > g.dur) {
          S.grains.splice(i, 1);
          continue;
        }
        const env = Math.sin(Math.PI * (g.age / g.dur));
        put(Math.floor(g.x / cell), Math.floor(g.y / cell), env, g.m);
      }
      // The buffer line the grains are read from.
      const bufY = Math.floor(h / 2 / cell);
      for (let cx = 0; cx < cols; cx += 2) put(cx, bufY, 0.14, 0);
      put(Math.floor(px / cell), Math.floor(py / cell), 1, 1);
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const a = pulseAdd(cx * cell, cy * cell, t);
          if (a > 0.1) put(cx, cy, a, 0);
        }
    };

    /* ── 2 HARMONICS — a bandpass window sweeping a harmonic series ── */
    const s2 = (t: number) => {
      const K = 11;
      const step = Math.floor(fieldT * 1.6) % 8;
      const winC = 1 + Math.floor(hash(step, 3, S.seed) * (K - 1));
      const winW = 1.6 + 2.4 * hash(step, 7, S.seed);
      for (let k = 1; k <= K; k++) {
        const yn = 1 - 0.88 * (Math.log(k) / Math.log(K + 1)) - 0.06;
        const cy = Math.floor(yn * rows);
        const inWin = Math.abs(k - winC) < winW;
        const amp = inWin ? 0.95 : 0.16;
        for (let cx = 0; cx < cols; cx++) {
          const vib = inWin ? 0.25 * Math.sin(cx * 0.8 + fieldT * (2 + k)) : 0;
          const v = amp + vib + pulseAdd(cx * cell, cy * cell, t);
          if (cx % (inWin ? 1 : 3) === 0) put(cx, cy, v, inWin && k === winC ? 1 : 0);
        }
      }
      // The window edges as faint verticals.
      const eTop = Math.floor((1 - 0.88 * (Math.log(Math.max(1, winC - winW)) / Math.log(K + 1)) - 0.06) * rows);
      const eBot = Math.floor((1 - 0.88 * (Math.log(Math.min(K, winC + winW)) / Math.log(K + 1)) - 0.06) * rows);
      for (let cy = eBot; cy <= eTop; cy += 2) {
        put(2, cy, 0.3, 1);
        put(cols - 3, cy, 0.3, 1);
      }
    };

    /* ── 3 GATE ROLL — probability gates firing pulses down their lanes ── */
    const s3 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.9;
      const laneW = cols / S.lanes;
      if (fieldT - S.lastTick > 0.55) {
        S.lastTick = fieldT;
        for (let l = 0; l < S.lanes; l++) {
          if (Math.random() < S.probs[l]) {
            S.pulsesDown.push({ l, y: 2, sp: rnd(0.4, 0.9) });
          } else {
            const cx = Math.floor((l + 0.5) * laneW);
            scratch[2 * cols + cx] = 0.3; // miss tick
          }
        }
      }
      for (let i = S.pulsesDown.length - 1; i >= 0; i--) {
        const p = S.pulsesDown[i];
        p.y += p.sp;
        if (p.y > rows) {
          S.pulsesDown.splice(i, 1);
          continue;
        }
        const cx = Math.floor((p.l + 0.5) * laneW);
        for (let k = 0; k < 5; k++) {
          const cy = Math.floor(p.y) - k;
          if (cy >= 0 && cy < rows) scratch[cy * cols + cx] = Math.max(scratch[cy * cols + cx], 1 - k * 0.2);
        }
      }
      for (let l = 0; l < S.lanes; l++) {
        const cx = Math.floor((l + 0.5) * laneW);
        // Header: probability rendered as a short stack of hex marks.
        const ph = Math.round(S.probs[l] * 4);
        for (let k = 0; k <= ph; k++) put(cx - 1 + (k % 2), 0, 0.3 + 0.1 * k, 1);
        // Lane guide.
        for (let cy = 2; cy < rows; cy += 3) put(cx, cy, 0.08, 0);
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, v > 0.9 ? 1 : 0);
        }
    };

    /* ── 4 SCRUB — a jumping playhead spraying grains off a waveform ── */
    const s4 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.88;
      if (Math.random() < 0.03) S.px = rnd(0.1, 0.9);
      S.px += Math.sin(fieldT * 0.7) * 0.0012;
      const headCx = Math.floor(S.px * cols);
      const mid = rows / 2;
      for (let cx = 0; cx < cols; cx++) {
        const env =
          0.5 + 0.45 * Math.sin(cx * 0.32 + S.seed) * Math.sin(cx * 0.071 + S.seed * 2);
        const amp = Math.abs(env) * rows * 0.3;
        for (let cy = Math.floor(mid - amp); cy <= Math.ceil(mid + amp); cy++) {
          const base = 0.14 + 0.1 * (1 - Math.abs(cy - mid) / (amp + 1));
          put(cx, cy, base, 0);
        }
      }
      // Spray around the head.
      for (let k = 0; k < 6; k++) {
        const gx = headCx + Math.round(rnd(-4, 4) * rnd(0, 1));
        const gy = Math.floor(mid + rnd(-1, 1) * rows * 0.3);
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows)
          scratch[gy * cols + gx] = Math.min(1.2, scratch[gy * cols + gx] + rnd(0.4, 0.9));
      }
      for (let cy = 0; cy < rows; cy++) {
        put(headCx, cy, cy % 2 ? 0.5 : 0.2, 1);
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, 0);
        }
      }
    };

    /* ── 5 STEP GRID — a drum pattern under a sweeping column cursor ── */
    const s5 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.9;
      const GX = 8;
      const GY = 6;
      const cw = Math.floor(cols / GX);
      const ch = Math.floor(rows / GY);
      const sweep = Math.floor(fieldT * 3.2) % GX;
      if (sweep === 0 && S.lastSweep === GX - 1) S.sweeps++;
      S.lastSweep = sweep;
      for (let gy = 0; gy < GY; gy++) {
        for (let gx = 0; gx < GX; gx++) {
          const on = hash(gx, gy, S.pattern + Math.floor(S.sweeps / 8)) < 0.34;
          const cx0 = gx * cw;
          const cy0 = gy * ch;
          const hit = on && gx === sweep;
          if (hit) {
            for (let oy = 0; oy < ch - 1; oy++)
              for (let ox = 0; ox < cw - 1; ox++)
                scratch[(cy0 + oy) * cols + cx0 + ox] = 1;
          }
          // Cell marks: on-cells solid dim, off-cells corner dot.
          if (on) {
            for (let oy = 0; oy < ch - 1; oy += 1)
              for (let ox = 0; ox < cw - 1; ox += 2) put(cx0 + ox, cy0 + oy, 0.22, 0);
          } else {
            put(cx0, cy0, 0.1, 0);
          }
        }
      }
      // Sweep column overlay.
      for (let cy = 0; cy < rows; cy++) put(sweep * cw + Math.floor(cw / 2), cy, 0.16, 1);
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, v > 0.8 ? 1 : 0);
        }
    };

    /* ── 6 WAVETABLE — a trace morphing shape as the scan position sweeps ── */
    const s6w = (t: number) => {
      const shapes = [
        (p: number) => Math.sin(p),
        (p: number) => (2 / Math.PI) * Math.asin(Math.sin(p)),
        (p: number) => 2 * ((p / (Math.PI * 2)) % 1) - 1,
        (p: number) => Math.sign(Math.sin(p)) || 1,
      ];
      const pos = 0.5 + 0.5 * Math.sin(fieldT * 0.24);
      const m = pos * shapes.length;
      const i0 = Math.floor(m) % shapes.length;
      const i1 = (i0 + 1) % shapes.length;
      const frac = m - Math.floor(m);
      const mid = rows / 2;
      const amp = rows * 0.3;
      for (let cx = 0; cx < cols; cx++) {
        const ph = (cx / cols) * Math.PI * 2 + fieldT * 0.5;
        const v = shapes[i0](ph) * (1 - frac) + shapes[i1](ph) * frac;
        const cy = Math.floor(mid + v * amp);
        put(cx, cy, 0.9, 0);
        put(cx, cy + 1, 0.22, 0);
      }
      // The position cursor, sweeping a thin spine row near the bottom.
      const spineY = rows - 2;
      for (let cx = 0; cx < cols; cx++) put(cx, spineY, 0.08, 0);
      const rail = Math.floor(pos * (cols - 1));
      put(rail, spineY, 0.95, 1);
      put(rail, spineY - 1, 0.4, 1);
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 7 SORTER — samples raining into classified bins ── */
    const s6 = (t: number) => {
      const BINS = 5;
      if (S.items.length < 26 && Math.random() < 0.35) {
        S.items.push({
          x: rnd(w * 0.08, w * 0.92),
          y: -8,
          vy: rnd(0.8, 1.8),
          bin: Math.floor(rnd(0, BINS)),
        });
      }
      const floorY = h - cell * 2;
      for (let i = S.items.length - 1; i >= 0; i--) {
        const it = S.items[i];
        it.y += it.vy;
        const bx = w * ((it.bin + 0.5) / BINS);
        if (it.y > h * 0.5) it.x += (bx - it.x) * 0.08;
        const stackH = colA[it.bin] * cell;
        if (it.y >= floorY - stackH) {
          colA[it.bin] = Math.min(rows * 0.5, colA[it.bin] + 0.6);
          S.items.splice(i, 1);
          continue;
        }
        put(Math.floor(it.x / cell), Math.floor(it.y / cell), 0.85, it.bin % 2);
      }
      // Bins drain slowly; the fullest occasionally flushes.
      for (let b = 0; b < BINS; b++) {
        colA[b] *= 0.999;
        const bx = Math.floor(cols * ((b + 0.5) / BINS));
        const hgt = Math.floor(colA[b]);
        for (let k = 0; k < hgt; k++)
          for (let ox = -1; ox <= 1; ox++) put(bx + ox, rows - 2 - k, 0.5 - k * 0.02, b % 2);
        put(bx, rows - 1, 0.3, 1);
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const a = pulseAdd(cx * cell, cy * cell, t);
          if (a > 0.1) put(cx, cy, a, 0);
        }
    };

    /* ── 8 FRETBOARD — scale shapes lighting a neck, a run walking it ── */
    const s7 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.93;
      const SCALE = [0, 2, 4, 5, 7, 9, 11]; // major, rotated by root
      const nStr = 6;
      const strGap = Math.floor(rows / (nStr + 1));
      const fretGap = 4;
      // Run walker.
      if (frame % 5 === 0) {
        S.runFret = (S.runFret + (Math.random() < 0.7 ? 1 : -1) + cols) % Math.floor(cols / fretGap);
        if (Math.random() < 0.3) S.runStr = Math.floor(rnd(0, nStr));
      }
      for (let s = 0; s < nStr; s++) {
        const cy = strGap * (s + 1);
        for (let cx = 0; cx < cols; cx++) put(cx, cy, 0.1, 0);
        for (let f = 0; f < Math.floor(cols / fretGap); f++) {
          const cx = f * fretGap + 2;
          put(cx, cy - Math.floor(strGap / 2), 0.08, 0);
          const note = (f + s * 5) % 12;
          const rel = (note - S.root + 12) % 12;
          if (SCALE.includes(rel)) {
            const isRoot = rel === 0;
            put(cx, cy, isRoot ? 0.9 : 0.4, isRoot ? 1 : 0);
          }
          if (f === S.runFret && s === S.runStr) {
            scratch[cy * cols + cx] = 1.2;
          }
        }
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, 1);
        }
    };

    /* ── 9 SHATTER — impulses bursting into drifting crystalline shards ── */
    const s8 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.95;
      if (fieldT > S.nextHit) {
        S.nextHit = fieldT + rnd(1.2, 3.2);
        const ix = rnd(w * 0.2, w * 0.8);
        const iy = rnd(h * 0.2, h * 0.8);
        const n = Math.floor(rnd(16, 30));
        for (let k = 0; k < n; k++) {
          const a = rnd(0, Math.PI * 2);
          const sp = rnd(0.6, 3);
          S.shards.push({
            x: ix,
            y: iy,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: rnd(1.5, 4),
            m: Math.random() < 0.2 ? 1 : 0,
          });
        }
      }
      for (let i = S.shards.length - 1; i >= 0; i--) {
        const sh = S.shards[i];
        sh.life -= 0.016;
        if (sh.life <= 0) {
          S.shards.splice(i, 1);
          continue;
        }
        sh.vx *= 0.985;
        sh.vy *= 0.985;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const gx = Math.floor(sh.x / cell);
        const gy = Math.floor(sh.y / cell);
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows)
          scratch[gy * cols + gx] = Math.max(scratch[gy * cols + gx], Math.min(1, sh.life * 0.6));
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, hash(cx, cy, S.seed) < 0.15 ? 1 : 0);
        }
    };

    /* ── 10 FREEZE BANDS — frequency bands latching and shuffling ── */
    const s9 = (t: number) => {
      const nB = S.bands.length;
      const bh = Math.floor(rows / nB);
      for (let b = 0; b < nB; b++) {
        const band = S.bands[b];
        band.off += (band.targ - band.off) * 0.1;
        const gain = band.state === 0 ? 0.18 : band.state === 1 ? 0.9 : 0.45;
        for (let cy = b * bh; cy < Math.min(rows, (b + 1) * bh - 1); cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const sx = (cx + Math.round(band.off) + cols) % cols;
            let v = hash(sx, cy, S.seed) < 0.3 ? gain * (0.5 + 0.5 * hash(sx, cy, 7)) : 0;
            if (band.state !== 1) v *= 0.75 + 0.25 * Math.sin(fieldT * 2 + cx * 0.4 + b);
            v += pulseAdd(cx * cell, cy * cell, t);
            if (v > 0.06) put(cx, cy, v, band.state === 1 ? 1 : 0);
          }
        }
        for (let cx = 0; cx < cols; cx += 4) put(cx, (b + 1) * bh - 1, 0.08, 0);
      }
    };

    /* ── 11 ACCRETION — matter spiralling into a growing well ── */
    const s10 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.93;
      const ccx = w / 2;
      const ccy = h / 2;
      if (S.parts.length < 90 && Math.random() < 0.7) {
        const a = rnd(0, Math.PI * 2);
        const r = Math.max(w, h) * 0.55;
        S.parts.push({ x: ccx + Math.cos(a) * r, y: ccy + Math.sin(a) * r * 0.8 });
      }
      const coreR = 8 + S.mass * 26;
      for (let i = S.parts.length - 1; i >= 0; i--) {
        const p = S.parts[i];
        const dx = ccx - p.x;
        const dy = ccy - p.y;
        const r = Math.sqrt(dx * dx + dy * dy) || 1;
        if (r < coreR) {
          S.mass = Math.min(1.4, S.mass + 0.012);
          S.parts.splice(i, 1);
          continue;
        }
        const pull = 90 / r;
        p.x += (dx / r) * pull + (-dy / r) * pull * 1.15;
        p.y += (dy / r) * pull + (dx / r) * pull * 1.15;
        const gx = Math.floor(p.x / cell);
        const gy = Math.floor(p.y / cell);
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows)
          scratch[gy * cols + gx] = Math.min(1.1, scratch[gy * cols + gx] + 0.5);
      }
      S.mass *= 0.9992;
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const y = cy * cell + cell / 2;
          const dx = x - ccx;
          const dy = y - ccy;
          const r = Math.sqrt(dx * dx + dy * dy);
          let v = scratch[cy * cols + cx];
          if (r < coreR) v = Math.max(v, 0.85 + 0.15 * Math.sin(fieldT * 3));
          else if (r < coreR + 14) v = Math.max(v, 0.35);
          v += pulseAdd(x, y, t);
          if (v > 0.06) put(cx, cy, v, r < coreR ? 1 : 0);
        }
    };

    /* ── 12 DECOHERENCE — three bands losing and regaining phase ── */
    const s11 = (t: number) => {
      const bh = rows / 3;
      for (let b = 0; b < 3; b++) {
        // Coherence drifts home to 1.
        S.coh[b] += (1 - S.coh[b]) * 0.006;
        const c = S.coh[b];
        const mid = bh * (b + 0.5);
        for (let cx = 0; cx < cols; cx++) {
          const cy0 =
            mid +
            bh *
              0.3 *
              Math.sin(cx * (0.25 + b * 0.09) + fieldT * (1.4 + b * 0.5));
          const jit = (1 - c) * (hash(cx, Math.floor(fieldT * 6), b) - 0.5) * bh * 0.9;
          const cy = Math.floor(cy0 + jit);
          put(cx, cy, 0.55 + 0.4 * c, c > 0.6 ? 0 : 1);
          if (c < 0.5 && hash(cx, Math.floor(fieldT * 8), b + 9) < 0.12) {
            put(cx, Math.floor(mid + rnd(-bh, bh) * 0.42), 0.3, 1);
          }
        }
        const divY = Math.floor(bh * (b + 1));
        if (b < 2) for (let cx = 0; cx < cols; cx += 3) put(cx, divY, 0.1, 0);
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const a = pulseAdd(cx * cell, cy * cell, t);
          if (a > 0.1) put(cx, cy, a, 0);
        }
    };

    /* ── 13 SMEAR TRAIL — everything drags a horizontal tail; freeze latches ── */
    const s12 = (t: number) => {
      const frozen = S.frozen > performance.now();
      if (!frozen) {
        // Leaky integrator drifting right.
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = cols - 1; cx > 0; cx--) {
            const i = cy * cols + cx;
            scratch[i] = Math.max(scratch[i] * 0.9, scratch[i - 1] * 0.965);
          }
          scratch[cy * cols] *= 0.9;
        }
        S.srcY += (0.5 + 0.36 * Math.sin(fieldT * 0.5) - S.srcY) * 0.05;
        const sx = Math.floor(cols * 0.12);
        const sy = Math.floor(S.srcY * rows);
        for (let k = -2; k <= 2; k++) {
          const gy = sy + k;
          if (gy >= 0 && gy < rows)
            scratch[gy * cols + sx] = Math.min(1.2, 1 - Math.abs(k) * 0.25);
        }
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, frozen ? 1 : 0);
        }
    };

    /* ── 14 EJECTION — a hollow core pooling matter at the floor ring ── */
    const s13 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.985;
      const ccx = w / 2;
      const ccy = h / 2;
      const floorR = Math.min(w, h) * 0.36;
      if (S.parts.length < 70 && Math.random() < 0.6) {
        const a = rnd(0, Math.PI * 2);
        S.parts.push({ x: ccx + Math.cos(a) * 16, y: ccy + Math.sin(a) * 16, a, v: rnd(2.2, 3.4) });
      }
      for (let i = S.parts.length - 1; i >= 0; i--) {
        const p = S.parts[i];
        const dx = p.x - ccx;
        const dy = p.y - ccy;
        const r = Math.sqrt(dx * dx + dy * dy) || 1;
        p.v *= 0.975;
        p.x += (dx / r) * p.v;
        p.y += (dy / r) * p.v;
        if (r > floorR || p.v < 0.12) {
          const gx = Math.floor(p.x / cell);
          const gy = Math.floor(p.y / cell);
          if (gx >= 0 && gy >= 0 && gx < cols && gy < rows)
            scratch[gy * cols + gx] = Math.min(1.1, scratch[gy * cols + gx] + 0.55);
          S.parts.splice(i, 1);
          continue;
        }
        put(Math.floor(p.x / cell), Math.floor(p.y / cell), 0.7, 0);
      }
      // Core rim flicker.
      for (let k = 0; k < 10; k++) {
        const a = rnd(0, Math.PI * 2);
        put(Math.floor((ccx + Math.cos(a) * 14) / cell), Math.floor((ccy + Math.sin(a) * 14) / cell), rnd(0.2, 0.5), 1);
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, v > 0.8 ? 1 : 0);
        }
    };

    /* ── 15 EROSION — corrosion fronts eating a mass that re-pours ── */
    const s14 = (t: number) => {
      // (Re)pour.
      if (S.mass > 0.999) {
        for (let cy = 0; cy < rows; cy++)
          for (let cx = 0; cx < cols; cx++) {
            const inBlock =
              cx > cols * 0.14 && cx < cols * 0.86 && cy > rows * 0.16 && cy < rows * 0.84;
            scratch[cy * cols + cx] = inBlock ? 0.55 + 0.3 * hash(cx, cy, S.seed) : 0;
          }
        S.mass = 0.99;
      }
      let alive = 0;
      for (const f of S.fronts) {
        f.d += f.sp * 0.06;
        if (f.d > Math.max(w, h) * 0.8) {
          f.d = -Math.max(w, h) * 0.7;
          f.a = rnd(0, Math.PI);
          f.sp = rnd(18, 42);
        }
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const i = cy * cols + cx;
          let v = scratch[i];
          if (v > 0.04) {
            const x = cx * cell - w / 2;
            const y = cy * cell - h / 2;
            for (const f of S.fronts) {
              const d = x * Math.cos(f.a) + y * Math.sin(f.a) - f.d;
              if (Math.abs(d) < 26) {
                v *= 0.86;
                if (hash(cx, cy, Math.floor(fieldT * 5) + f.k) < 0.2) put(cx, cy, rnd(0.5, 1), 1);
              }
            }
            if (v < 0.05) v = 0;
            scratch[i] = v;
            alive += v;
          }
          const vv = v + pulseAdd(cx * cell, cy * cell, t);
          if (vv > 0.06) put(cx, cy, vv, 0);
        }
      if (alive < cols * rows * 0.02) S.mass = 1; // feedback: pour again
    };

    /* ── 16 MELT — broadcast columns slumping until the keyframe snaps ── */
    const s15 = (t: number) => {
      S.bandY += 0.6;
      if (S.bandY > rows + 12) S.bandY = -14;
      let melted = 0;
      for (let cx = 0; cx < cols; cx++) {
        // Corruption band passing a column weakens it.
        if (Math.abs(S.bandY - rows * 0.5) < rows && Math.random() < 0.02) {
          S.integ[cx] = Math.max(0.1, S.integ[cx] - rnd(0, 0.2));
        }
        S.off[cx] += (1 - S.integ[cx]) * 0.35;
        melted += S.off[cx];
        for (let cy = 0; cy < rows; cy++) {
          const srcY = cy - S.off[cx];
          const by = Math.floor(srcY / 4);
          const bx = Math.floor(cx / 5);
          const v = hash(bx, by, S.seed) < 0.55 ? 0.2 + 0.5 * hash(bx * 3 + 1, by, S.seed) : 0.05;
          const stretch = srcY < 0 ? 0.7 : 1; // stretched head of the melt
          const vv = v * stretch + pulseAdd(cx * cell, cy * cell, t);
          if (vv > 0.07)
            put(cx, cy, vv, S.off[cx] > 3 && hash(cx, cy, 5) < 0.2 ? 1 : 0);
        }
      }
      // I-frame: snap back clean.
      if (melted > cols * rows * 0.34) {
        S.off.fill(0);
        S.integ.fill(1);
        S.seed = Math.floor(rnd(1, 999));
      }
    };

    /* ── 17 TWO PLATES — two sources blending where they overlap ── */
    const s16 = (t: number) => {
      const px1 = w * (0.32 + 0.16 * Math.sin(fieldT * 0.23));
      const py1 = h * (0.4 + 0.14 * Math.cos(fieldT * 0.17));
      const px2 = w * (0.62 + 0.15 * Math.sin(fieldT * 0.19 + 2));
      const py2 = h * (0.55 + 0.16 * Math.cos(fieldT * 0.26 + 1));
      const pw = w * 0.34;
      const ph = h * 0.42;
      const jit = Math.random() < 0.04 ? 1 : 0;
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const inA = x > px1 && x < px1 + pw && y > py1 && y < py1 + ph;
          const inB = x > px2 && x < px2 + pw && y > py2 && y < py2 + ph;
          let v = 0;
          let m = 0;
          if (inA) v += 0.24 + 0.3 * hash(cx, cy, S.seed);
          if (inB) {
            v += 0.24 + 0.3 * hash(cx, cy, S.seed + 40);
            m = 1;
          }
          if (inA && inB) {
            v = Math.min(1.1, v * 1.35);
            m = (cx + cy) % 2;
          }
          v += pulseAdd(x, y, t);
          if (v > 0.06) put(cx, cy, v, m, inA && inB ? jit : 0);
        }
      }
    };

    /* ── 18 SLICE TEAR — the tear is the subject; clean frames flash by ── */
    const s17 = (t: number) => {
      for (const sl of S.slices) sl.off += (sl.targ - sl.off) * 0.12;
      for (let cy = 0; cy < rows; cy++) {
        let shift = 0;
        let torn = false;
        for (const sl of S.slices) {
          if (cy >= sl.r && cy < sl.r + sl.hgt) {
            shift = Math.round(sl.off);
            torn = Math.abs(sl.off) > 0.8;
          }
        }
        for (let cx = 0; cx < cols; cx++) {
          const sx = (cx - shift + cols * 4) % cols;
          // Base picture: vertical tone bars.
          const bar = Math.floor((sx / cols) * 7);
          let v = 0.1 + 0.075 * bar;
          if (torn && hash(sx, cy, Math.floor(fieldT * 4)) < 0.1) v = rnd(0.5, 1);
          v += pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, torn ? 1 : 0, 0);
        }
      }
    };

    /* ── 19 OSMOSIS — two textures seeping across a membrane ── */
    const s18 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.985;
      const bx = (y: number) => w * 0.5 + 26 * Math.sin(y * 0.02 + fieldT * 0.6);
      if (S.blobs.length < 14 && Math.random() < 0.12) {
        const fromLeft = Math.random() < 0.5;
        const y = rnd(h * 0.1, h * 0.9);
        S.blobs.push({
          x: bx(y) + (fromLeft ? -10 : 10),
          y,
          vx: fromLeft ? rnd(0.6, 1.4) : rnd(-1.4, -0.6),
          sgn: fromLeft ? 1 : -1,
          life: rnd(2, 5),
        });
      }
      for (let i = S.blobs.length - 1; i >= 0; i--) {
        const b = S.blobs[i];
        b.life -= 0.016;
        b.x += b.vx;
        b.y += Math.sin(fieldT * 2 + i) * 0.4;
        if (b.life <= 0 || b.x < 0 || b.x > w) {
          S.blobs.splice(i, 1);
          continue;
        }
        const gx = Math.floor(b.x / cell);
        const gy = Math.floor(b.y / cell);
        if (gx >= 0 && gy >= 0 && gx < cols && gy < rows) {
          const i2 = gy * cols + gx;
          scratch[i2] = Math.max(-1, Math.min(1, scratch[i2] + b.sgn * 0.5));
        }
      }
      for (let cy = 0; cy < rows; cy++) {
        const y = cy * cell + cell / 2;
        const memX = bx(y);
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * cell + cell / 2;
          const left = x < memX;
          let v = hash(cx, cy, S.seed) < 0.16 ? 0.16 : 0;
          let m = left ? 0 : 1;
          const s = scratch[cy * cols + cx];
          if (Math.abs(s) > 0.1) {
            v = Math.max(v, Math.abs(s));
            m = s > 0 ? 0 : 1;
          }
          v += pulseAdd(x, y, t);
          if (v > 0.06) put(cx, cy, v, m);
        }
        if (cy % 2 === 0) put(Math.floor(memX / cell), cy, 0.4, 1);
      }
    };

    /* ── 20 DELAY STACK — a displaced edge echoing down a frame buffer ── */
    const s19 = (t: number) => {
      // Delay line: each row inherits yesterday's offset from the row above.
      for (let r = rows - 1; r > 0; r--) S.delay[r] = S.delay[r - 1];
      S.delay[0] =
        w * 0.25 * (Math.sin(fieldT * 1.9) * 0.6 + Math.sin(fieldT * 0.77 + 1.3) * 0.4);
      for (let cy = 0; cy < rows; cy++) {
        const ex = Math.floor((w / 2 + S.delay[cy]) / cell);
        const fade = 1 - (cy / rows) * 0.55;
        put(ex, cy, 0.95 * fade, 0);
        put(ex - 1, cy, 0.4 * fade, 0);
        put(ex + 1, cy, 0.4 * fade, 0);
        // A second, quieter echo displaced further.
        const ex2 = Math.floor((w / 2 + S.delay[cy] * 1.7) / cell);
        if (cy % 2 === 0) put(ex2, cy, 0.22 * fade, 1);
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const a = pulseAdd(cx * cell, cy * cell, t);
          if (a > 0.1) put(cx, cy, a, 0);
        }
    };

    /* ── 21 LAYERS — three documents breathing over each other ── */
    const s20 = (t: number) => {
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          let v = 0;
          let hot = false;
          for (let L = 0; L < 3; L++) {
            const op = 0.5 + 0.5 * Math.sin(fieldT * (0.24 + L * 0.11) + L * 2.1);
            // Paragraph blocks per layer.
            const para = hash(Math.floor(cx / 6) + L * 31, Math.floor(cy / 3), S.seed + L) < 0.5;
            const glyph = hash(cx, cy, S.seed + L * 7) < 0.5;
            if (para && glyph) {
              v += 0.34 * op;
              if (v > 0.75) hot = true;
            }
          }
          v += pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.07) put(cx, cy, Math.min(1.1, v), hot ? 1 : 0);
        }
      }
    };

    /* ── 22 CHAIN WALK — a walker wearing highways into a graph ── */
    const s21 = (t: number) => {
      const N = S.nodes.length;
      for (let i = 0; i < S.wgt.length; i++) S.wgt[i] *= 0.9995;
      S.prog += 0.045;
      if (S.prog >= 1) {
        S.at = S.to;
        // Weighted choice of next hop.
        let total = 0;
        for (let j = 0; j < N; j++) if (j !== S.at) total += S.wgt[S.at * N + j] + 0.12;
        let roll = Math.random() * total;
        for (let j = 0; j < N; j++) {
          if (j === S.at) continue;
          roll -= S.wgt[S.at * N + j] + 0.12;
          if (roll <= 0) {
            S.to = j;
            break;
          }
        }
        S.wgt[S.at * N + S.to] = Math.min(1.6, S.wgt[S.at * N + S.to] + 0.3);
        S.prog = 0;
      }
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const wgt = S.wgt[i * N + j];
          if (wgt > 0.08)
            link(S.nodes[i].x, S.nodes[i].y, S.nodes[j].x, S.nodes[j].y, Math.min(0.7, wgt * 0.5), wgt > 0.8 ? 1 : 0);
        }
        put(Math.floor(S.nodes[i].x / cell), Math.floor(S.nodes[i].y / cell), i === S.at ? 0.9 : 0.4, i === S.at ? 1 : 0);
      }
      const a = S.nodes[S.at];
      const b = S.nodes[S.to];
      const hx = a.x + (b.x - a.x) * S.prog;
      const hy = a.y + (b.y - a.y) * S.prog;
      put(Math.floor(hx / cell), Math.floor(hy / cell), 1, 1);
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 23 RETICLE — a viewfinder hunting an anchored artifact ── */
    const s22 = (t: number) => {
      const ax = w * (0.62 + 0.05 * Math.sin(fieldT * 0.11));
      const ay = h * (0.44 + 0.05 * Math.cos(fieldT * 0.13));
      // Reticle wanders; sometimes locks on.
      const wantLock = Math.sin(fieldT * 0.31) > 0.4;
      const txx = wantLock ? ax : w * (0.5 + 0.34 * Math.sin(fieldT * 0.5));
      const tyy = wantLock ? ay : h * (0.5 + 0.3 * Math.cos(fieldT * 0.37));
      S.rx += (txx - S.rx) * 0.04;
      S.ry += (tyy - S.ry) * 0.04;
      const near = Math.hypot(S.rx - ax, S.ry - ay) < 30;
      S.locked = near ? Math.min(1, S.locked + 0.05) : Math.max(0, S.locked - 0.03);
      // Parallax dust — two layers countershifting with the reticle.
      for (let k = 0; k < 40; k++) {
        const lay = k % 2 ? 0.06 : 0.12;
        const dx = (hash(k, 1, S.seed) * w - (S.rx - w / 2) * lay + w) % w;
        const dy = (hash(k, 2, S.seed) * h - (S.ry - h / 2) * lay + h) % h;
        put(Math.floor(dx / cell), Math.floor(dy / cell), k % 2 ? 0.1 : 0.16, 0);
      }
      // The artifact: a small dense cluster, waking when locked.
      const acx = Math.floor(ax / cell);
      const acy = Math.floor(ay / cell);
      for (let oy = -1; oy <= 1; oy++)
        for (let ox = -1; ox <= 1; ox++) {
          const v = 0.3 + 0.6 * S.locked * hash(ox, oy, Math.floor(fieldT * 6));
          put(acx + ox, acy + oy, v, 1);
        }
      if (S.locked > 0.9) {
        const r = ((fieldT * 60) % 70) + 16;
        for (let a2 = 0; a2 < Math.PI * 2; a2 += 0.4) {
          put(Math.floor((ax + Math.cos(a2) * r) / cell), Math.floor((ay + Math.sin(a2) * r) / cell), 0.3 * (1 - r / 90), 0);
        }
      }
      // Reticle crosshair + corner brackets.
      const rcx = Math.floor(S.rx / cell);
      const rcy = Math.floor(S.ry / cell);
      for (let k = 2; k < 5; k++) {
        put(rcx + k, rcy, 0.5, 0);
        put(rcx - k, rcy, 0.5, 0);
        put(rcx, rcy + k, 0.5, 0);
        put(rcx, rcy - k, 0.5, 0);
      }
      const bs = 7;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        put(rcx + sx * bs, rcy + sy * bs, 0.7, 1);
        put(rcx + sx * (bs - 1), rcy + sy * bs, 0.4, 1);
        put(rcx + sx * bs, rcy + sy * (bs - 1), 0.4, 1);
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 24 MODULES — instrument tiles waking one at a time ── */
    const s23 = (t: number) => {
      const GX = 3;
      const GY = 3;
      const tw = Math.floor(cols / GX);
      const th = Math.floor(rows / GY);
      const awake = Math.floor(fieldT * 0.5) % (GX * GY);
      for (let gy = 0; gy < GY; gy++) {
        for (let gx = 0; gx < GX; gx++) {
          const id = gy * GX + gx;
          const x0 = gx * tw + 1;
          const y0 = gy * th + 1;
          const iw = tw - 2;
          const ih = th - 2;
          const on = id === awake;
          const dim = on ? 1 : 0.16;
          // Border.
          for (let k = 0; k < iw; k += 2) {
            put(x0 + k, y0, 0.14 * (on ? 3 : 1), on ? 1 : 0);
            put(x0 + k, y0 + ih - 1, 0.14 * (on ? 3 : 1), on ? 1 : 0);
          }
          for (let k = 0; k < ih; k += 2) {
            put(x0, y0 + k, 0.14 * (on ? 3 : 1), on ? 1 : 0);
            put(x0 + iw - 1, y0 + k, 0.14 * (on ? 3 : 1), on ? 1 : 0);
          }
          // Interior behavior by module type.
          const type = id % 4;
          if (type === 0) {
            for (let k = 1; k < iw - 1; k++) {
              const yy = y0 + ih / 2 + (ih * 0.3) * Math.sin(k * 0.7 + fieldT * (on ? 3 : 0.2));
              put(x0 + k, Math.floor(yy), 0.6 * dim, 0);
            }
          } else if (type === 1) {
            const ph = Math.floor(fieldT * (on ? 6 : 0.3)) % (iw - 2);
            for (let k = 1; k < ih - 1; k++) put(x0 + 1 + ph, y0 + k, 0.5 * dim, 0);
          } else if (type === 2) {
            for (let k = 0; k < 8; k++) {
              const gx2 = x0 + 1 + Math.floor(hash(k, Math.floor(fieldT * (on ? 5 : 0.2)), id) * (iw - 2));
              const gy2 = y0 + 1 + Math.floor(hash(k + 9, Math.floor(fieldT * (on ? 5 : 0.2)), id) * (ih - 2));
              put(gx2, gy2, 0.5 * dim, 0);
            }
          } else {
            const a = fieldT * (on ? 2.4 : 0.1) + id;
            put(
              Math.floor(x0 + iw / 2 + (iw * 0.3) * Math.cos(a)),
              Math.floor(y0 + ih / 2 + (ih * 0.3) * Math.sin(a)),
              0.7 * dim,
              0
            );
          }
        }
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 25 REDACTION — a read head boxing secrets and blacking them out ── */
    const s24 = (t: number) => {
      // Document layout from hash; scratch stores redactions.
      S.head += 1.4;
      if (S.head >= cols) {
        S.head = 0;
        S.row += 2;
        if (S.row >= rows) {
          S.row = 0;
          S.seed = Math.floor(rnd(1, 999));
          scratch.fill(0);
        }
      }
      for (let cy = 0; cy < rows; cy += 2) {
        const rowSeed = hash(1, cy, S.seed);
        if (rowSeed < 0.2) continue; // paragraph gap
        const start = 1 + Math.floor(rowSeed * 4);
        const len = Math.floor(cols * (0.4 + hash(2, cy, S.seed) * 0.5));
        for (let k = 0; k < len; k++) {
          const cx = start + k;
          if (cx >= cols - 1) break;
          const isSecret = hash(Math.floor((cx + 2) / 5), cy, S.seed + 5) < 0.14;
          const passed = cy < S.row || (cy === S.row && cx < S.head);
          const red = scratch[cy * cols + cx] > 0.5;
          if (isSecret && passed && !red) scratch[cy * cols + cx] = 1;
          let v = hash(cx, cy, S.seed + 2) < 0.72 ? (passed ? 0.16 : 0.3) : 0;
          let m = 0;
          if (scratch[cy * cols + cx] > 0.5) {
            v = 0.95;
            m = 1;
          }
          v += pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, m);
        }
      }
      // The head.
      put(Math.floor(S.head), S.row, 1, 1);
      put(Math.floor(S.head), S.row + 1, 0.4, 1);
    };

    /* ── 26 DEP TREE — a dependency graph growing until it withers ── */
    const s25 = (t: number) => {
      const maxDepth = 6;
      if (S.nodes.length < 46 && Math.random() < 0.24) {
        const parent = S.nodes[Math.floor(rnd(0, S.nodes.length))];
        if (parent.depth < maxDepth) {
          S.nodes.push({
            x: clamp01(parent.x / w + rnd(-0.13, 0.13)) * w,
            y: parent.y + cell * rnd(2, 3.4),
            depth: parent.depth + 1,
            flag: Math.random() < 0.16,
            px: parent.x,
            py: parent.y,
          });
        }
      }
      if (S.nodes.length >= 46 && Math.random() < 0.01) {
        S.nodes = [{ x: w / 2, y: cell * 2, depth: 0, flag: false }];
      }
      for (const n of S.nodes) {
        if (n.px !== undefined) link(n.px, n.py, n.x, n.y, 0.2, 0);
        const gcx = Math.floor(n.x / cell);
        const gcy = Math.floor(n.y / cell);
        if (n.flag) {
          const blink = 0.5 + 0.5 * Math.sin(fieldT * 5 + n.x);
          put(gcx, gcy, 0.6 + 0.4 * blink, 1);
          put(gcx + 1, gcy, 0.3 * blink, 1);
        } else {
          put(gcx, gcy, n.depth === 0 ? 0.95 : 0.5, 0);
        }
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 27 LOG TAIL — lookups scrolling past; entropy gets flagged ── */
    const s26 = (t: number) => {
      const storm = S.storm && performance.now() < S.storm;
      if (Math.random() < (storm ? 0.5 : 0.1)) {
        S.lines.unshift({
          len: Math.floor(rnd(6, cols * 0.55)),
          hot: Math.random() < 0.14,
          age: 0,
        });
        if (S.lines.length > Math.floor(rows / 2)) S.lines.pop();
      }
      for (let li = 0; li < S.lines.length; li++) {
        const ln = S.lines[li];
        ln.age += 0.016;
        const cy = rows - 2 - li * 2;
        if (cy < 0) break;
        const fade = Math.max(0.16, 1 - ln.age * 0.16);
        for (let k = 0; k < ln.len; k++) {
          const v = (hash(k, li, S.seed) < 0.8 ? 0.5 : 0.2) * fade;
          put(3 + k, cy, v, ln.hot ? 1 : 0);
        }
        if (ln.hot) put(1, cy, 0.9 * fade, 1);
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 28 RUNAWAY FILL — sediment rising until the watchdog purges ── */
    const s27 = (t: number) => {
      if (S.alarm > 0) {
        S.level = Math.max(0.08, S.level - 0.025);
        S.alarm -= 0.016;
      } else {
        S.level = Math.min(0.9, S.level + 0.0016 + (Math.random() < 0.02 ? 0.02 : 0));
        if (S.level > 0.82) S.alarm = rnd(0.8, 1.4);
      }
      const lineY = Math.floor(rows * (1 - S.level));
      const alarming = S.level > 0.7;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          let v = 0;
          let m = 0;
          if (cy > lineY) {
            const depth = (cy - lineY) / Math.max(1, rows - lineY);
            v = hash(cx, cy, S.seed) < 0.3 + depth * 0.55 ? 0.18 + depth * 0.4 : 0;
          }
          if (cy === lineY) {
            v = alarming ? 0.6 + 0.4 * Math.sin(fieldT * 8 + cx * 0.5) : 0.5;
            m = alarming ? 1 : 0;
          }
          v += pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, m);
        }
      }
      // Watchdog needle sweeping above the waterline.
      const nx = Math.floor((0.5 + 0.45 * Math.sin(fieldT * 1.3)) * cols);
      for (let cy = 2; cy < lineY; cy += 2) put(nx, cy, 0.25, 1);
      // Side ruler.
      for (let cy = 0; cy < rows; cy += 3) put(cols - 2, cy, 0.14, 0);
    };

    /* ── 29 PORT MAP — a sweep pinging open ports on a grid ── */
    const s28 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.92;
      const sweepX = Math.floor((0.5 + 0.5 * Math.sin(fieldT * 0.7)) * (cols - 1));
      for (let gy = 2; gy < rows - 1; gy += 3) {
        for (let gx = 2; gx < cols - 1; gx += 3) {
          const openPh = hash(gx, gy, S.seed) * 20;
          const isOpen = Math.sin(fieldT * 0.3 + openPh) > 0.1;
          const sus = hash(gx, gy, S.seed + 3) < 0.06;
          let v = isOpen ? 0.55 : 0.1;
          let m = 0;
          if (sus && isOpen) {
            v = 0.6 + 0.4 * Math.sin(fieldT * 6);
            m = 1;
          }
          if (isOpen && Math.abs(gx - sweepX) < 2) {
            scratch[gy * cols + gx] = 1.2;
            for (let k = gy - 1; k > 0; k--) scratch[k * cols + gx] = Math.max(scratch[k * cols + gx], 0.5 * (k / gy));
          }
          put(gx, gy, v, m);
        }
      }
      for (let cy = 0; cy < rows; cy++) put(sweepX, cy, 0.14, 0);
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, 1);
        }
    };

    /* ── 30 PIVOT WEB — infrastructure discovered shell by shell ── */
    const s29 = (t: number) => {
      S.phase += 0.016;
      if (S.phase > 1.1 && S.shell < 4) {
        S.phase = 0;
        S.shell++;
        const count = 3 + S.shell * 2;
        for (let k = 0; k < count; k++) {
          const a = rnd(0, Math.PI * 2);
          const r = S.shell * Math.min(w, h) * 0.11;
          const nx = S.cx + Math.cos(a) * r;
          const ny = S.cy + Math.sin(a) * r * 0.85;
          const parents = S.nodes.filter((n: { sh: number }) => n.sh === S.shell - 1);
          const par = parents.length
            ? parents[Math.floor(rnd(0, parents.length))]
            : { x: S.cx, y: S.cy };
          S.nodes.push({ x: nx, y: ny, sh: S.shell, px: par.x, py: par.y, new: 1 });
        }
      }
      if (S.shell >= 4 && S.phase > 2.4) {
        // Re-pivot from an outer node.
        const outers = S.nodes.filter((n: { sh: number }) => n.sh >= 3);
        const nx = outers.length ? outers[Math.floor(rnd(0, outers.length))] : { x: w / 2, y: h / 2 };
        S.cx = nx.x;
        S.cy = nx.y;
        S.nodes = [];
        S.shell = 0;
        S.phase = 0;
      }
      put(Math.floor(S.cx / cell), Math.floor(S.cy / cell), 1, 1);
      for (const n of S.nodes) {
        n.new = Math.max(0, (n.new ?? 0) - 0.01);
        link(n.px, n.py, n.x, n.y, 0.16 + n.new * 0.4, 0);
        put(Math.floor(n.x / cell), Math.floor(n.y / cell), 0.4 + n.new * 0.6, n.new > 0.5 ? 1 : 0);
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 31 HOARD — collectors ferrying shiny finds back to the nest ── */
    const s30 = (t: number) => {
      if (S.items.length < 7 && Math.random() < 0.05) {
        S.items.push({ x: rnd(w * 0.1, w * 0.9), y: rnd(h * 0.1, h * 0.62) });
      }
      for (const b of S.birds) {
        if (b.st === 0) {
          // Idle at nest; pick a target.
          if (S.items.length && Math.random() < 0.04) {
            const it = S.items[Math.floor(rnd(0, S.items.length))];
            b.tx = it.x;
            b.ty = it.y;
            b.st = 1;
          }
          b.x += (S.nest.x - b.x) * 0.06;
          b.y += (S.nest.y - b.y) * 0.06;
        } else if (b.st === 1) {
          b.x += (b.tx - b.x) * 0.055;
          b.y += (b.ty - b.y) * 0.055;
          if (Math.hypot(b.tx - b.x, b.ty - b.y) < 9) {
            const idx = S.items.findIndex(
              (it: { x: number; y: number }) => Math.hypot(it.x - b.tx, it.y - b.ty) < 4
            );
            if (idx >= 0) S.items.splice(idx, 1);
            b.st = 2;
          }
        } else {
          b.x += (S.nest.x - b.x) * 0.05;
          b.y += (S.nest.y - b.y) * 0.05;
          if (Math.hypot(S.nest.x - b.x, S.nest.y - b.y) < 10) {
            S.pile = Math.min(26, S.pile + 1);
            b.st = 0;
          }
        }
        put(Math.floor(b.x / cell), Math.floor(b.y / cell), 0.9, b.st === 2 ? 1 : 0);
      }
      // Shiny items blink hex.
      for (const it of S.items) {
        const blink = 0.5 + 0.5 * Math.sin(fieldT * 4 + it.x);
        put(Math.floor(it.x / cell), Math.floor(it.y / cell), 0.4 + 0.5 * blink, 1);
      }
      // The pile — a mound around the nest.
      const ncx = Math.floor(S.nest.x / cell);
      const ncy = Math.floor(S.nest.y / cell);
      for (let k = 0; k < S.pile; k++) {
        const ox = Math.round((hash(k, 1, S.seed) - 0.5) * Math.sqrt(k) * 2.4);
        const oy = -Math.floor(hash(k, 2, S.seed) * Math.sqrt(k) * 1.2);
        put(ncx + ox, ncy + oy, 0.5 + 0.3 * hash(k, 3, S.seed), k % 3 === 0 ? 1 : 0);
      }
      if (S.pile >= 26 && Math.random() < 0.008) S.pile = 3; // fenced off
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 32 DETONATION — a package detonating inside a sealed box ── */
    const s31 = (t: number) => {
      for (let i = 0; i < scratch.length; i++) scratch[i] *= 0.9;
      const bx0 = Math.floor(cols * 0.18);
      const bx1 = Math.floor(cols * 0.82);
      const by0 = Math.floor(rows * 0.2);
      const by1 = Math.floor(rows * 0.86);
      // Border, always.
      for (let cx = bx0; cx <= bx1; cx += 1) {
        put(cx, by0, 0.24 + S.verdict * 0.7, S.verdict > 0.3 ? 1 : 0);
        put(cx, by1, 0.24 + S.verdict * 0.7, S.verdict > 0.3 ? 1 : 0);
      }
      for (let cy = by0; cy <= by1; cy += 1) {
        put(bx0, cy, 0.24 + S.verdict * 0.7, S.verdict > 0.3 ? 1 : 0);
        put(bx1, cy, 0.24 + S.verdict * 0.7, S.verdict > 0.3 ? 1 : 0);
      }
      S.verdict *= 0.96;
      if (S.phase === 0) {
        // Package descends.
        S.py += h * 0.006;
        const pcx = Math.floor(cols / 2);
        const pcy = Math.floor(S.py / cell);
        for (let oy = 0; oy < 2; oy++)
          for (let ox = -1; ox <= 1; ox++) put(pcx + ox, pcy + oy, 0.8, 0);
        if (S.py > h * 0.45) {
          S.phase = 1;
          S.tv = fieldT + rnd(2.5, 4.5);
          for (let k = 0; k < 22; k++) {
            const a = rnd(0, Math.PI * 2);
            S.frag.push({
              x: w / 2,
              y: S.py,
              vx: Math.cos(a) * rnd(1, 3.2),
              vy: Math.sin(a) * rnd(1, 3.2),
            });
          }
        }
      } else if (S.phase === 1) {
        for (const f of S.frag) {
          f.x += f.vx;
          f.y += f.vy;
          // Bounce off the sandbox walls; flash where they hit.
          if (f.x < (bx0 + 1) * cell || f.x > bx1 * cell) {
            f.vx *= -1;
            f.x += f.vx * 2;
            scratch[Math.max(0, Math.min(rows - 1, Math.floor(f.y / cell))) * cols + (f.x < w / 2 ? bx0 : bx1)] = 1.3;
          }
          if (f.y < (by0 + 1) * cell || f.y > by1 * cell) {
            f.vy *= -1;
            f.y += f.vy * 2;
          }
          const gx = Math.floor(f.x / cell);
          const gy = Math.floor(f.y / cell);
          if (gx > bx0 && gx < bx1 && gy > by0 && gy < by1)
            scratch[gy * cols + gx] = Math.min(1.2, scratch[gy * cols + gx] + 0.4);
        }
        if (fieldT > S.tv) {
          S.phase = 0;
          S.py = -h * 0.15;
          S.frag = [];
          S.verdict = 1;
        }
      }
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++) {
          const v = scratch[cy * cols + cx] + pulseAdd(cx * cell, cy * cell, t);
          if (v > 0.06) put(cx, cy, v, v > 1 ? 1 : 0);
        }
    };

    /* ── 33 HISTORY SCRUB — findings rising off a commit timeline ── */
    const s32 = (t: number) => {
      const lineY = Math.floor(rows * 0.66);
      S.head += 0.0022;
      if (S.head > 1.08) {
        S.head = -0.04;
        S.ticks = S.ticks.map((tk: { x: number }) => ({
          x: tk.x,
          n: Math.floor(rnd(1, 5)),
          bad: Math.random() < 0.22,
        }));
      }
      for (let cx = 0; cx < cols; cx += 2) put(cx, lineY, 0.16, 0);
      const headX = S.head * cols;
      for (const tk of S.ticks) {
        const tcx = Math.floor(tk.x * cols);
        const passed = tk.x < S.head;
        put(tcx, lineY, passed ? 0.6 : 0.3, 0);
        put(tcx, lineY + 1, 0.2, 0);
        if (passed) {
          for (let k = 1; k <= tk.n; k++) put(tcx, lineY - k, 0.5 - k * 0.06, 0);
          if (tk.bad) {
            const blink = 0.5 + 0.5 * Math.sin(fieldT * 5 + tcx);
            for (let k = 1; k < Math.floor(rows * 0.28); k += 2)
              put(tcx, lineY + 1 + k, 0.4 * blink, 1);
            put(tcx, lineY - tk.n - 1, 0.7 + 0.3 * blink, 1);
          }
        }
      }
      // The read head.
      const hcx = Math.floor(headX);
      for (let cy = lineY - 6; cy <= lineY + 6; cy++) put(hcx, cy, 0.5, 1);
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 34 DIVERGENCE — model vs market; the gap is the signal ── */
    const s33 = (t: number) => {
      for (let cx = 0; cx < cols; cx++) {
        const xn = cx / cols;
        const base =
          rows * (0.5 + 0.16 * Math.sin(xn * 5 + fieldT * 0.5) + 0.08 * Math.sin(xn * 13 - fieldT * 0.3));
        const gap =
          rows *
          0.2 *
          Math.sin(xn * 7 + fieldT * 0.9) *
          Math.sin(xn * 2.3 - fieldT * 0.4);
        const yA = Math.floor(base - gap / 2);
        const yB = Math.floor(base + gap / 2);
        put(cx, yA, 0.7, 0);
        put(cx, yB, 0.5, 0);
        const edge = Math.abs(gap) > rows * 0.12;
        if (edge) {
          const lo = Math.min(yA, yB);
          const hi = Math.max(yA, yB);
          for (let cy = lo + 1; cy < hi; cy++) {
            if (hash(cx, cy, S.seed) < 0.4) put(cx, cy, 0.4, 1);
          }
          if (cx % 4 === 0) put(cx, lo - 1, 0.8, 1);
        }
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 35 SHELF PRINT — a catalog of meshes, one printing layer by layer ── */
    const s34 = (t: number) => {
      const GX = 4;
      const GY = 2;
      const tw = Math.floor(cols / GX);
      const th = Math.floor(rows / GY);
      S.layer += 0.16;
      const boxH = th - 6;
      if (S.layer > boxH) {
        S.layer = 0;
        S.slot = (S.slot + 1) % (GX * GY);
      }
      for (let gy = 0; gy < GY; gy++) {
        for (let gx = 0; gx < GX; gx++) {
          const id = gy * GX + gx;
          const x0 = gx * tw + 2;
          const y0 = gy * th + 2;
          const bw = tw - 5;
          const bh2 = th - 6;
          const printing = id === S.slot;
          const resident = (id + GX * GY - S.slot) % (GX * GY) !== 0 && id !== S.slot;
          const fill = printing ? S.layer : resident ? bh2 : 0;
          const dim = printing ? 0.7 : 0.2;
          // Wireframe box — outline plus an iso top hint.
          for (let k = 0; k <= bw; k += 2) {
            put(x0 + k, y0 + bh2, dim, 0);
            if (fill >= bh2) put(x0 + k, y0, dim, 0);
          }
          for (let k = 0; k <= Math.min(fill, bh2); k += 2) {
            put(x0, y0 + bh2 - k, dim, 0);
            put(x0 + bw, y0 + bh2 - k, dim, 0);
          }
          // Interior slices up to the fill line.
          for (let k = 1; k < Math.min(fill, bh2); k += 2) {
            for (let j = 1; j < bw; j += 3)
              put(x0 + j, y0 + bh2 - k, (printing ? 0.34 : 0.12) * (1 - k / bh2 + 0.4), 0);
          }
          if (printing) {
            const py = y0 + bh2 - Math.floor(S.layer);
            for (let j = 0; j <= bw; j++) put(x0 + j, py, 0.95, 1);
          }
        }
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    /* ── 36 TILE SNAP — a dungeon assembling itself tile by tile ── */
    const s35 = (t: number) => {
      const TS = 5;
      const GX = Math.floor(cols / TS);
      const GY = Math.floor(rows / TS);
      const total = GX * GY;
      if (S.order.length !== total) {
        S.order = Array.from({ length: total }, (_, i) => i);
        for (let i = total - 1; i > 0; i--) {
          const j = Math.floor(hash(i, 3, S.seed) * (i + 1));
          [S.order[i], S.order[j]] = [S.order[j], S.order[i]];
        }
        S.placed = 0;
      }
      if (frame % 6 === 0 && S.placed < total) S.placed++;
      for (let k = 0; k < S.placed; k++) {
        const id = S.order[k];
        const gx = (id % GX) * TS;
        const gy = Math.floor(id / GX) * TS;
        const type = Math.floor(hash(id, 9, S.seed) * 3);
        const fresh = k === S.placed - 1 ? 0.5 : 0;
        // Tile border corners.
        put(gx, gy, 0.2 + fresh, fresh ? 1 : 0);
        put(gx + TS - 1, gy, 0.2 + fresh, fresh ? 1 : 0);
        put(gx, gy + TS - 1, 0.2 + fresh, fresh ? 1 : 0);
        put(gx + TS - 1, gy + TS - 1, 0.2 + fresh, fresh ? 1 : 0);
        if (type === 0) {
          // Corridor.
          for (let j = 0; j < TS; j++) put(gx + j, gy + 2, 0.32 + fresh, 0);
        } else if (type === 1) {
          for (let j = 0; j < TS; j++) put(gx + 2, gy + j, 0.32 + fresh, 0);
        } else {
          // Room.
          for (let oy = 1; oy < TS - 1; oy++)
            for (let ox = 1; ox < TS - 1; ox++)
              if (ox === 1 || oy === 1 || ox === TS - 2 || oy === TS - 2)
                put(gx + ox, gy + oy, 0.26 + fresh, 0);
        }
      }
      for (let cy = 0; cy < rows; cy += 2)
        for (let cx = 0; cx < cols; cx += 2) {
          const add = pulseAdd(cx * cell, cy * cell, t);
          if (add > 0.1) put(cx, cy, add, 0);
        }
    };

    const SKETCHES: ((t: number) => void)[] = [
      s1, s2, s3, s4, s5, s6w, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15,
      s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29,
      s30, s31, s32, s33, s34, s35,
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
      buildSprites();
      initMode();
      if (reduced) drawFrame(performance.now());
    };

    const drawFrame = (tms: number) => {
      const t = tms * 0.001;
      const dt = Math.min(0.1, Math.max(0, (tms - lastMs) * 0.001));
      lastMs = tms;
      const inBurst = tms < burstUntil;
      fieldT += dt * (inBurst ? burstSpeed : 0.5);
      if (tms >= nextBurstAt) {
        burstSpeed = rnd(2.6, 7);
        burstUntil = tms + rnd(160, 520);
        nextBurstAt = tms + rnd(1600, 6000);
        kick();
      }
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
      const sk = SKETCHES[Math.max(0, Math.min(SKETCHES.length - 1, mode - 1))];
      sk(t);
    };

    const loop = (tms: number) => {
      frame++;
      if (frame % 2 === 0) drawFrame(tms);
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
      // Warm the sketch so accumulating states show structure, then settle.
      for (let k = 0; k < 45; k++) {
        fieldT += 0.06;
        frame++;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        SKETCHES[Math.max(0, Math.min(SKETCHES.length - 1, mode - 1))](k * 0.033);
      }
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
