"use client";

import { useEffect, useRef, useState } from "react";

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

const GLITCH_CHARS = "!<>-_\\/[]{}=+*^?#░▒▓@$%&|~";

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function GlitchLabel() {
  const [labelIndex, setLabelIndex] = useState(0);
  const [display, setDisplay] = useState(LABELS[0]);
  const glitchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function runGlitch(nextIndex: number) {
      const to = LABELS[nextIndex];
      const duration = 420;
      const start = Date.now();

      if (glitchRef.current) clearInterval(glitchRef.current);

      glitchRef.current = setInterval(() => {
        const progress = (Date.now() - start) / duration;
        if (progress >= 1) {
          clearInterval(glitchRef.current!);
          glitchRef.current = null;
          setDisplay(to);
          setLabelIndex(nextIndex);
          scheduleNext(nextIndex);
          return;
        }
        const result = to
          .split("")
          .map((char) => {
            if (char === " ") return " ";
            return Math.random() < progress ? char : randomChar();
          })
          .join("");
        setDisplay(result);
      }, 38);
    }

    function scheduleNext(currentIndex: number) {
      const delay = randomBetween(1500, 4000);
      scheduleRef.current = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % LABELS.length;
        runGlitch(nextIndex);
      }, delay);
    }

    scheduleNext(0);

    return () => {
      if (glitchRef.current) clearInterval(glitchRef.current);
      if (scheduleRef.current) clearTimeout(scheduleRef.current);
    };
  }, []);

  return (
    <span
      className="text-[11px] tracking-[0.35em] uppercase text-[#888] font-mono"
      aria-label={LABELS[labelIndex]}
    >
      {display}
    </span>
  );
}
