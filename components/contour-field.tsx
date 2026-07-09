"use client";

import { useEffect, useRef } from "react";

/**
 * Full-viewport contour-line field — the site's persistent background.
 * Five displacement modes blended continuously by scroll position:
 *   0 audio ridge (hero + sound/video)   1 network topology (security)
 *   2 scan dome (ar/mobile)              3 printed layers (3d)
 *   4 idle drift (about/contact)
 * Interaction: cursor disturbance + "field-pulse" CustomEvents from cards.
 * Pulse detail {x, y} is in viewport coordinates (the canvas's fixed coord space).
 * Decorative only — every failure path is a silent no-op.
 */

// First anchor is #audio: the ridge holds through hero + audio + video, then
// interpolates toward network as the viewport center approaches #security.
const ANCHOR_IDS = ["audio", "security", "ar-mobile", "threed", "about"];

const ACCENTS: [number, number, number][] = [
  [232, 228, 220], // ridge — warm white
  [160, 255, 190], // network — green
  [255, 130, 175], // scan — pink
  [150, 200, 255], // layers — blue
  [170, 170, 170], // idle — dim white
];

const tri = (v: number) => Math.abs(((v % 1) + 1) % 1 - 0.5) * 4 - 1;
const sstep = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const NETWORK_NODES = [
  [0.22, 0.3],
  [0.55, 0.62],
  [0.8, 0.25],
  [0.4, 0.85],
] as const;

// Displacement in px: x = normalized horizontal, l = normalized line index,
// t = seconds. Negative = up.
type ModeFn = (x: number, l: number, t: number) => number;

const MODES: ModeFn[] = [
  // 0 — audio ridge: gaussian-enveloped layered sines
  (x, l, t) => {
    const env = Math.exp(-Math.pow((x - 0.5) * 2.6, 2)) + 0.1;
    return (
      (Math.sin(x * 14 + l * 3.2 + t * 2.0) * 6 +
        Math.sin(x * 5 - t * 1.4 + l) * 11) *
      env
    );
  },
  // 1 — network topology: angular traces + pulsing node wells
  (x, l, t) => {
    let e = tri(x * 5 + l * 1.6 + t * 0.25) * 5;
    for (const [nx, nl] of NETWORK_NODES) {
      e -=
        30 *
        Math.exp(-((x - nx) ** 2) * 150 - ((l - nl) ** 2) * 30) *
        (0.75 + 0.25 * Math.sin(t * 3 + nx * 20));
    }
    return e;
  },
  // 2 — scan dome: hemispheric bulge, rotation wobble, scanline shimmer
  (x, l, t) => {
    const dx = (x - 0.5) * 2.4;
    const dl = (l - 0.5) * 2.1;
    const r2 = dx * dx + dl * dl;
    const dome = r2 < 1 ? Math.sqrt(1 - r2) : 0;
    return (
      -38 * dome * (1 + 0.06 * Math.sin(t * 1.6 + x * 9)) +
      Math.sin(x * 30 + t * 4) * 0.8 * dome
    );
  },
  // 3 — printed layers: vase silhouette raised out of flat layers
  (x, l, t) => {
    const prof =
      0.16 + 0.13 * Math.sin(l * Math.PI) + 0.05 * Math.sin(l * Math.PI * 3 + 0.6);
    const inside = sstep(prof + 0.04, prof - 0.02, Math.abs(x - 0.5));
    return -17 * inside * (0.7 + 0.3 * Math.sin(t * 1.2 + l * 10));
  },
  // 4 — idle drift: low-amplitude breathing
  (x, l, t) => Math.sin(x * 3 + l * 2 + t * 0.6) * 4 + Math.sin(x * 7 - t * 0.4) * 2,
];

interface Pulse {
  x: number;
  y: number;
  t0: number;
}

export function ContourField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let anchors: { top: number; mode: number }[] = [];
    // tx/ty is the raw cursor; x/y trails it each frame so the dent moves
    // like a disturbance in a medium with viscosity, not a glued decal.
    const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };
    const pulses: Pulse[] = [];
    let raf = 0;
    let running = false;

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
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      measure();
      if (reduced) draw(performance.now());
    };

    // Continuous mode progress from viewport-center position between anchors.
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

      const p = progress();
      const weights = MODES.map((_, i) => Math.max(0, 1 - Math.abs(p - i)));
      const wsum = weights.reduce((a, b) => a + b, 0) || 1;
      const active: { fn: ModeFn; w: number }[] = [];
      for (let i = 0; i < MODES.length; i++) {
        if (weights[i] > 0.01) active.push({ fn: MODES[i], w: weights[i] / wsum });
      }

      let cr = 0;
      let cg = 0;
      let cb = 0;
      weights.forEach((wt, i) => {
        cr += (ACCENTS[i][0] * wt) / wsum;
        cg += (ACCENTS[i][1] * wt) / wsum;
        cb += (ACCENTS[i][2] * wt) / wsum;
      });

      // Full amplitude in the hero, dimmed ~45% once content arrives.
      const dim = 1 - 0.55 * sstep(0.3, 1, window.scrollY / (h * 0.9));
      const spacing = coarse ? 22 : 14;
      const nLines = Math.max(10, Math.floor(h / spacing));
      const step = Math.max(4, Math.floor(w / 160));

      for (let i = pulses.length - 1; i >= 0; i--) {
        if (t - pulses[i].t0 > 1.4) pulses.splice(i, 1);
      }

      // Cursor smoothing: snap across the offscreen sentinel, trail otherwise.
      if (mouse.tx < -9e3 || mouse.x < -9e3) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      } else {
        mouse.x += (mouse.tx - mouse.x) * 0.16;
        mouse.y += (mouse.ty - mouse.y) * 0.16;
      }

      for (let li = 0; li < nLines; li++) {
        const l = li / (nLines - 1);
        const baseY = h * 0.04 + l * h * 0.92;
        const edge = 0.25 + 0.75 * Math.sin(l * Math.PI);
        ctx.strokeStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${
          (0.1 + edge * 0.34) * dim
        })`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = 0; px <= w + step; px += step) {
          const cx = Math.min(px, w);
          const x = cx / w;
          let e = 0;
          for (let k = 0; k < active.length; k++) {
            e += active[k].fn(x, l, t) * active[k].w;
          }
          const mdx = cx - mouse.x;
          const mdy = baseY - mouse.y;
          e -= Math.exp(-(mdx * mdx + mdy * mdy) / 3800) * 30;
          // Pulses propagate: a wavefront leaves the card at 260px/s and
          // decays — a ping through the medium, not a dent that fades in place.
          for (const pu of pulses) {
            const age = t - pu.t0;
            const dx2 = cx - pu.x;
            const dy2 = baseY - pu.y;
            const ring = Math.sqrt(dx2 * dx2 + dy2 * dy2) - age * 260;
            if (ring > 120 || ring < -120) continue;
            e -= 20 * Math.exp((-ring * ring) / 2600) * Math.exp(-age * 2.6);
          }
          const y = baseY + e;
          if (cx === 0) ctx.moveTo(cx, y);
          else ctx.lineTo(cx, y);
          if (cx === w) break;
        }
        ctx.stroke();
      }
    };

    const loop = (tms: number) => {
      draw(tms);
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

    // Layout shifts after mount (fonts, iframes) move the anchors — re-measure.
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
  }, []);

  return (
    <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />
  );
}
