"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Cycling discipline label. Each word is formed from dots: scattered points
// converge into position, hold as dots for a beat, then resolve into the
// letters. On the way out the letters collapse back toward dots and scatter.
// Labels are drawn in random order, never repeating the one on screen.

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

const HOLD_MS = 3600;

const rnd = (a: number, b: number) => Math.random() * (b - a) + a;

interface Seed {
  x: number;
  y: number;
  delay: number;
}

function makeSeeds(len: number): Seed[] {
  return Array.from({ length: len }, (_, i) => ({
    x: rnd(-36, 36),
    y: rnd(-22, 22),
    delay: i * 0.02 + rnd(0, 0.06),
  }));
}

// A single glyph: arrives as a dot, resolves into its letter once settled.
function DotChar({
  ch,
  seed,
  out,
  reduced,
}: {
  ch: string;
  seed: Seed;
  out: Seed;
  reduced: boolean;
}) {
  const [resolved, setResolved] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => setResolved(true), (seed.delay + 0.55) * 1000);
    return () => clearTimeout(id);
  }, [seed.delay, reduced]);

  return (
    <motion.span
      className="inline-block"
      style={{ whiteSpace: "pre" }}
      initial={
        reduced ? { opacity: 0 } : { opacity: 0, x: seed.x, y: seed.y, scale: 0.4 }
      }
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, x: out.x, y: out.y, scale: 0.3 }
      }
      transition={{
        duration: reduced ? 0.2 : 0.55,
        delay: seed.delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {resolved ? (ch === " " ? " " : ch) : ch === " " ? " " : "•"}
    </motion.span>
  );
}

export function GlitchLabel() {
  const [idx, setIdx] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const cycle = setInterval(() => {
      setIdx((cur) => {
        let next = cur;
        while (next === cur) {
          next = Math.floor(Math.random() * LABELS.length);
        }
        return next;
      });
    }, HOLD_MS);
    return () => clearInterval(cycle);
  }, []);

  const label = LABELS[idx];
  const chars = useMemo(() => label.split(""), [label]);
  const seeds = useMemo(() => makeSeeds(chars.length), [chars]);
  const outs = useMemo(() => makeSeeds(chars.length), [chars]);

  return (
    <span
      className="relative inline-block doto text-[15px] md:text-[17px] tracking-[0.2em] uppercase text-paper-dim whitespace-nowrap"
      aria-label={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={label} aria-hidden className="inline-block">
          {chars.map((c, i) => (
            <DotChar
              key={`${label}-${i}`}
              ch={c}
              seed={seeds[i]}
              out={outs[i]}
              reduced={reduced.current}
            />
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
