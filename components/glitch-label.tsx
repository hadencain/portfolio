"use client";

import { useEffect, useRef, useState } from "react";

// ─── GlitchText — inline glitch matching hero aesthetic ───────────────────────

interface TextFrame {
  chars: string;
  chromatic: boolean;
  redX: number;
  cyanX: number;
  skewX: number;
}

const TEXT_BASE = (text: string): TextFrame => ({ chars: text, chromatic: false, redX: 0, cyanX: 0, skewX: 0 });

export function GlitchText({ text, className }: { text: string; className?: string }) {
  const [frame, setFrame] = useState<TextFrame>(TEXT_BASE(text));
  const alive = useRef(true);

  useEffect(() => {
    // Reduced motion: the text simply is what it says. No flicker, ever.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    alive.current = true;
    let idle: ReturnType<typeof setTimeout>;
    let ticker: ReturnType<typeof setInterval>;

    function glitch() {
      const dur = rnd(350, 650);
      const t0 = Date.now();
      if (ticker) clearInterval(ticker);

      ticker = setInterval(() => {
        if (!alive.current) return;
        const p = (Date.now() - t0) / dur;

        if (p >= 1) {
          clearInterval(ticker);
          setFrame(TEXT_BASE(text));
          schedule();
          return;
        }

        const peak = p > 0.25 && p < 0.78;
        const chars = text.split("").map((ch) => {
          if (ch === " ") return " ";
          if (p > 0.72) return Math.random() < p ? ch : rc(true);
          if (peak)     return Math.random() < 0.28 ? ch : rc(true);
          return Math.random() < p * 0.9 ? ch : rc(false);
        }).join("");

        setFrame({
          chars,
          chromatic: peak || Math.random() < 0.3,
          redX:  peak ? rnd(-12, -4) : rnd(-4, -1),
          cyanX: peak ? rnd(4, 13)   : rnd(1, 4),
          skewX: peak ? rnd(-3, 3)   : rnd(-1, 1),
        });
      }, 28);
    }

    function schedule() {
      idle = setTimeout(() => { if (alive.current) glitch(); }, rnd(1200, 3800));
    }

    schedule();
    return () => { alive.current = false; clearTimeout(idle); clearInterval(ticker); };
  }, [text]);

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    fontSize: "inherit",
    letterSpacing: "inherit",
    whiteSpace: "nowrap" as const,
  };

  const { chars, chromatic, redX, cyanX, skewX } = frame;

  return (
    <span style={{ position: "relative", display: "inline-block", transform: chromatic ? `skewX(${skewX}deg)` : "none" }}>
      {chromatic && (
        <span aria-hidden style={{ ...mono, position: "absolute", inset: 0, color: "rgba(255,35,35,0.60)", transform: `translateX(${redX}px)`, pointerEvents: "none", userSelect: "none" }}>
          {chars}
        </span>
      )}
      {chromatic && (
        <span aria-hidden style={{ ...mono, position: "absolute", inset: 0, color: "rgba(0,215,205,0.60)", transform: `translateX(${cyanX}px)`, pointerEvents: "none", userSelect: "none" }}>
          {chars}
        </span>
      )}
      <span className={className} style={{ ...mono, position: "relative", zIndex: 1 }}>{chars}</span>
    </span>
  );
}

// ─── GlitchLabel — hero cycling label ─────────────────────────────────────────

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

const CHARS_SOFT = "!<>-_\\/[]{}=+*^?";
const CHARS_HARD = "!<>-_\\/[]{}=+*^?#░▒▓@$%&|~█▄▀■□▪†§~`";

function rc(hard = false) {
  const s = hard ? CHARS_HARD : CHARS_SOFT;
  return s[Math.floor(Math.random() * s.length)];
}
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

interface Tear { y: number; h: number; w: number; x: number; }
interface Frame {
  chars: string;
  chromatic: boolean;
  redX: number; cyanX: number; skewX: number;
  tears: Tear[];
}

const BASE: Frame = { chars: LABELS[0], chromatic: false, redX: 0, cyanX: 0, skewX: 0, tears: [] };

export function GlitchLabel() {
  const [labelIdx, setLabelIdx] = useState(0);
  const [frame, setFrame] = useState<Frame>(BASE);
  const alive = useRef(true);
  const currentIdx = useRef(0);

  useEffect(() => {
    alive.current = true;
    let idle: ReturnType<typeof setTimeout>;
    let ticker: ReturnType<typeof setInterval>;

    // Reduced motion: the label still cycles (the content matters) but as a
    // plain swap — no substitution frames, no chromatic split, no tears.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const cycle = setInterval(() => {
        if (!alive.current) return;
        const next = (currentIdx.current + 1) % LABELS.length;
        currentIdx.current = next;
        setLabelIdx(next);
        setFrame({ ...BASE, chars: LABELS[next] });
      }, 4000);
      return () => {
        alive.current = false;
        clearInterval(cycle);
      };
    }

    function makeTears(n: number, intense: boolean): Tear[] {
      return Array.from({ length: n }, () => ({
        y:  rnd(intense ? -30 : -8, intense ? 50 : 24),
        h:  rnd(1, intense ? 6 : 2.5),
        w:  rnd(80, intense ? 520 : 200),
        x:  rnd(-40, intense ? 60 : 20),
      }));
    }

    function glitch(targetIdx: number) {
      const to = LABELS[targetIdx];
      const dur = rnd(600, 1000);
      const t0  = Date.now();
      if (ticker) clearInterval(ticker);

      ticker = setInterval(() => {
        if (!alive.current) return;
        const p = (Date.now() - t0) / dur;

        if (p >= 1) {
          clearInterval(ticker);
          setLabelIdx(targetIdx);
          currentIdx.current = targetIdx;
          setFrame({ ...BASE, chars: to });
          schedule();
          return;
        }

        const peak = p > 0.25 && p < 0.78;

        // Character substitution: noisy → resolving
        const chars = to.split("").map((ch) => {
          if (ch === " ") return " ";
          if (p > 0.72) return Math.random() < p ? ch : rc(true);
          if (peak)     return Math.random() < 0.28 ? ch : rc(true);
          return Math.random() < p * 0.9 ? ch : rc(false);
        }).join("");

        const chromatic = peak || Math.random() < 0.3;
        const redX  = peak ? rnd(-14, -5) : rnd(-5, -1);
        const cyanX = peak ? rnd(5, 16)   : rnd(1, 5);
        const skewX = peak ? rnd(-4, 4)   : rnd(-1, 1);
        const tn    = peak ? Math.floor(rnd(3, 8)) : Math.floor(rnd(0, 3));

        setFrame({ chars, chromatic, redX, cyanX, skewX, tears: makeTears(tn, peak) });
      }, 28);
    }

    function micro() {
      const label = LABELS[currentIdx.current];
      const i = Math.floor(Math.random() * label.length);
      const glitched = label.split("").map((c, j) => (j === i && c !== " " ? rc(false) : c)).join("");
      setFrame(prev => ({ ...prev, chars: glitched }));
      setTimeout(() => {
        if (alive.current) setFrame(prev => ({ ...prev, chars: LABELS[currentIdx.current] }));
      }, 70);
    }

    function schedule() {
      const delay = rnd(1500, 4000);
      // Scatter 1–3 micro-glitches randomly through the idle window
      const mc = Math.floor(rnd(1, 4));
      for (let i = 0; i < mc; i++) {
        setTimeout(() => { if (alive.current) micro(); }, rnd(150, delay - 300));
      }
      idle = setTimeout(() => {
        if (!alive.current) return;
        glitch((currentIdx.current + 1) % LABELS.length);
      }, delay);
    }

    schedule();
    return () => {
      alive.current = false;
      clearTimeout(idle);
      clearInterval(ticker);
    };
  }, []);

  const { chars, chromatic, redX, cyanX, skewX, tears } = frame;
  const base: React.CSSProperties = {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    fontSize: "15px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "visible",
        transform: chromatic ? `skewX(${skewX}deg)` : "none",
      }}
    >
      {/* Red channel */}
      {chromatic && (
        <span
          aria-hidden
          style={{
            ...base,
            position: "absolute",
            inset: 0,
            color: "rgba(255,35,35,0.60)",
            transform: `translateX(${redX}px)`,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >{chars}</span>
      )}

      {/* Cyan channel */}
      {chromatic && (
        <span
          aria-hidden
          style={{
            ...base,
            position: "absolute",
            inset: 0,
            color: "rgba(0,215,205,0.60)",
            transform: `translateX(${cyanX}px)`,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >{chars}</span>
      )}

      {/* Main text */}
      <span
        aria-label={LABELS[labelIdx]}
        style={{ ...base, color: "#aaa", position: "relative", zIndex: 1 }}
      >{chars}</span>

      {/* Scan-line tears — extend spatially into the canvas behind */}
      {tears.map((t, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left:    `${t.x}px`,
            top:     `${t.y}px`,
            width:   `${t.w}px`,
            height:  `${t.h}px`,
            background: "rgba(200,200,200,0.06)",
            backdropFilter: "brightness(2)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </div>
  );
}
