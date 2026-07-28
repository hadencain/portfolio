"use client";

import { useEffect, useRef } from "react";

// Cycling discipline label as a living point field. One persistent particle
// pool renders every word — on each cycle the letters dissolve outward into
// a loose cloud and re-condense into the next word's shape. Nothing enters
// or exits discretely; surplus points fade to ambient drift when a shorter
// word needs fewer, and are re-lit when a longer one needs more.

const LABELS = [
  "VST PLUGINS",
  "AUGMENTED REALITY",
  "VIDEO EFFECTS",
  "SECURITY TOOLS",
  "TOUCHDESIGNER",
  "CREATIVE CODING",
  "ABLETON LIVE",
  "BLENDER",
  "MAX FOR LIVE",
  "JUCE",
];

const HOLD_MS = 3000;
const MORPH_MS = 1600;
const FONT_PX = 24; // sampling size (CSS px) — also the drawn cloud's cap height
const STEP = 2; // sampling grid step; lower = denser cloud
const JITTER = 0.55; // breathing amplitude while a word holds

const rnd = (a: number, b: number) => Math.random() * (b - a) + a;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Pt {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  a: number; // live alpha
  fx: number;
  fy: number;
  fa: number; // morph start
  cx: number;
  cy: number; // bezier control — the outward bloom
  tx: number;
  ty: number;
  ta: number; // morph target
  d: number; // per-particle delay, 0..0.35 of the morph
  ph: number; // jitter phase
}

export function GlitchLabel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Reduced motion: plain text, hard swaps, no field.
    if (reduced) {
      canvas.style.display = "none";
      const text = document.createElement("span");
      text.textContent = LABELS[0];
      wrap.appendChild(text);
      let i = 0;
      const id = setInterval(() => {
        i = (i + 1) % LABELS.length;
        text.textContent = LABELS[i];
        wrap.setAttribute("aria-label", LABELS[i]);
      }, HOLD_MS + MORPH_MS);
      return () => {
        clearInterval(id);
        text.remove();
      };
    }

    // ── Sample every label into a point set ──────────────────────────────
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    const font = `700 ${FONT_PX}px Arial, Helvetica, sans-serif`;
    type SpacedCtx = CanvasRenderingContext2D & { letterSpacing?: string };
    const applyFont = (c: SpacedCtx) => {
      c.font = font;
      c.letterSpacing = "3px";
    };
    applyFont(octx as SpacedCtx);
    const W =
      Math.ceil(Math.max(...LABELS.map((l) => octx.measureText(l).width))) + 4;
    const H = Math.ceil(FONT_PX * 1.4);
    off.width = W;
    off.height = H;

    const pointSets: Pt[][] = LABELS.map((l) => {
      applyFont(octx as SpacedCtx); // canvas resize resets ctx state
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.clearRect(0, 0, W, H);
      octx.fillText(l, 1, H / 2);
      const img = octx.getImageData(0, 0, W, H).data;
      const pts: Pt[] = [];
      for (let y = 0; y < H; y += STEP)
        for (let x = 0; x < W; x += STEP)
          if (img[(y * W + x) * 4 + 3] > 128) pts.push({ x, y });
      return pts;
    });

    // ── Display canvas ───────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const color = getComputedStyle(canvas).color;

    // ── Particle pool ────────────────────────────────────────────────────
    const N = Math.max(...pointSets.map((p) => p.length));
    const parts: Particle[] = Array.from({ length: N }, () => {
      const x = rnd(0, W);
      const y = rnd(-6, H + 6);
      return {
        x, y, a: 0,
        fx: x, fy: y, fa: 0,
        cx: x, cy: y,
        tx: x, ty: y, ta: 0,
        d: 0,
        ph: rnd(0, Math.PI * 2),
      };
    });

    let idx = 0;

    // Retarget the pool at a new word. Both the pool and the word's points
    // are ordered by x so the cloud flows laterally instead of shredding.
    const retarget = (next: number) => {
      const pts = [...pointSets[next]].sort((a, b) => a.x - b.x || a.y - b.y);
      const order = parts
        .map((_, i) => i)
        .sort((a, b) => parts[a].x - parts[b].x);
      order.forEach((pi, k) => {
        const p = parts[pi];
        p.fx = p.x;
        p.fy = p.y;
        p.fa = p.a;
        if (k < pts.length) {
          p.tx = pts[k].x;
          p.ty = pts[k].y;
          p.ta = 1;
        } else {
          p.tx = rnd(0, W);
          p.ty = rnd(-6, H + 6);
          p.ta = 0;
        }
        // Control point pushed away from the field's center — mid-morph the
        // cloud blooms outward, then condenses into the next word.
        const mx = (p.fx + p.tx) / 2;
        const my = (p.fy + p.ty) / 2;
        const dx = mx - W / 2;
        const dy = my - H / 2;
        const m = Math.hypot(dx, dy) || 1;
        const bloom = rnd(6, 26);
        p.cx = mx + (dx / m) * bloom + rnd(-9, 9);
        p.cy = my + (dy / m) * bloom * 0.7 + rnd(-7, 7);
        p.d = rnd(0, 0.35);
      });
      wrap.setAttribute("aria-label", LABELS[next]);
    };

    // ── Loop ─────────────────────────────────────────────────────────────
    let raf = 0;
    let phase: "morph" | "hold" = "morph";
    let t0 = performance.now();
    retarget(0); // entrance: ambient scatter condenses into the first word

    const tick = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;

      if (phase === "morph") {
        const raw = Math.min(1, (now - t0) / MORPH_MS);
        for (const p of parts) {
          const u = Math.min(1, Math.max(0, (raw - p.d) / (1 - p.d)));
          const e = easeInOut(u);
          const i1 = 1 - e;
          p.x = i1 * i1 * p.fx + 2 * i1 * e * p.cx + e * e * p.tx;
          p.y = i1 * i1 * p.fy + 2 * i1 * e * p.cy + e * e * p.ty;
          p.a = p.fa + (p.ta - p.fa) * e;
        }
        if (raw >= 1) {
          phase = "hold";
          t0 = now;
        }
      } else {
        const t = now * 0.0016;
        for (const p of parts) {
          if (p.ta === 0) continue;
          p.x = p.tx + Math.sin(t + p.ph) * JITTER;
          p.y = p.ty + Math.cos(t * 1.3 + p.ph) * JITTER * 0.8;
        }
        if (now - t0 >= HOLD_MS) {
          let next = idx;
          while (next === idx)
            next = Math.floor(Math.random() * LABELS.length);
          idx = next;
          retarget(next);
          phase = "morph";
          t0 = now;
        }
      }

      for (const p of parts) {
        if (p.a < 0.02) continue;
        ctx.globalAlpha = p.a * (0.75 + 0.25 * Math.sin(p.ph * 3));
        ctx.fillRect(p.x - 0.65, p.y - 0.65, 1.3, 1.3);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block doto text-[15px] md:text-[17px] tracking-[0.2em] uppercase text-paper-dim whitespace-nowrap"
      aria-label={LABELS[0]}
    >
      <canvas ref={canvasRef} aria-hidden className="block text-paper-dim" />
    </span>
  );
}
