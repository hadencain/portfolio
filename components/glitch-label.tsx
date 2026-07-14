"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Cycling discipline label. Letters deconstruct — each glyph drifts off on its
// own vector like loose type pulled from a forme — then the next label's
// letters converge and lock in. Labels are drawn in random order, never
// repeating the one on screen. Calm by design: no flicker, no strobe.

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

const HOLD_MS = 3400;

const rnd = (a: number, b: number) => Math.random() * (b - a) + a;

interface Scatter {
  x: number;
  y: number;
  rotate: number;
  delay: number;
}

// One drift vector per glyph, made fresh for every word so no two
// transitions read the same.
function makeScatter(len: number): Scatter[] {
  return Array.from({ length: len }, (_, i) => ({
    x: rnd(-46, 46),
    y: rnd(-26, 26),
    rotate: rnd(-28, 28),
    delay: i * 0.022 + rnd(0, 0.05),
  }));
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
  // Enter and exit each get their own scatter so the word never retraces
  // its own arrival path on the way out.
  const enter = useMemo(() => makeScatter(chars.length), [chars]);
  const exit = useMemo(() => makeScatter(chars.length), [chars]);

  return (
    <span
      className="relative inline-block font-mono text-[13px] md:text-[15px] tracking-[0.22em] uppercase text-paper-dim whitespace-nowrap"
      aria-label={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={label} aria-hidden className="inline-block">
          {chars.map((c, i) => (
            <motion.span
              key={`${label}-${i}`}
              className="inline-block"
              style={{ whiteSpace: "pre" }}
              initial={
                reduced.current
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: enter[i].x,
                      y: enter[i].y,
                      rotate: enter[i].rotate,
                    }
              }
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              exit={
                reduced.current
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: exit[i].x,
                      y: exit[i].y,
                      rotate: exit[i].rotate,
                    }
              }
              transition={{
                duration: reduced.current ? 0.2 : 0.5,
                delay: enter[i].delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {c}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
