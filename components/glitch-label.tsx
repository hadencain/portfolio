"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Cycling discipline label — one line of dot-matrix type swapped on a slow
// beat. Deliberately quiet: the framed field to the right owns the motion in
// this viewport, and two generative systems side by side fight each other.
// Labels are drawn in random order, never repeating the one on screen.

const LABELS = [
  "SECURITY TOOLS",
  "OSINT",
  "VIDEO EFFECTS",
  "DATAMOSHING",
  "CREATIVE CODING",
  "GENERATIVE ART",
  "AUGMENTED REALITY",
  "LOCAL-FIRST AI",
  "TOUCHDESIGNER",
  "BLENDER",
];

const HOLD_MS = 3400;

export function GlitchLabel() {
  const [idx, setIdx] = useState(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const cycle = setInterval(() => {
      setIdx((cur) => {
        let next = cur;
        while (next === cur) next = Math.floor(Math.random() * LABELS.length);
        return next;
      });
    }, HOLD_MS);
    return () => clearInterval(cycle);
  }, []);

  const label = LABELS[idx];

  return (
    // min-height holds the line open through the swap — with mode="wait" the
    // box is briefly empty and everything below would jump otherwise.
    <span
      className="doto inline-flex items-center min-h-[1.6em] text-[15px] md:text-[17px] tracking-[0.2em] uppercase text-paper-dim whitespace-nowrap"
      aria-label={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          aria-hidden
          className="inline-block"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{
            duration: reduced ? 0.15 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
