"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("audio-sort")!;

const BEATS = [
  { name: "Read", text: "Path context, file metadata, and librosa spectral + onset analysis on every sample." },
  { name: "Classify", text: "A weighted multi-signal classifier — with an optional AST ML model — not just filename keyword matching." },
  { name: "Sort", text: "WAV, MP3, AIF, AIFF, FLAC, and OGG filed into categorized folders you can actually navigate." },
  { name: "In place", text: "Point it at a folder and it organizes what's already there. Nothing leaves your machine." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

// Twelve unsorted squares that slide from a scattered column into three tidy
// stacks and back — the sort, looping. Deterministic start via index math.
const COLS = [78, 130, 182];
const SQUARES = Array.from({ length: 12 }, (_, i) => ({
  col: COLS[i % 3],
  y: 44 + Math.floor(i / 3) * 34,
  startX: 118 + 54 * Math.sin(i * 2.11),
  dur: 3 + (i % 4) * 0.5,
  delay: (i % 3) * 0.25,
}));

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {COLS.map((x) => (
        <line key={x} x1={x + 7} y1="34" x2={x + 7} y2="196" stroke="#262626" strokeWidth="1" />
      ))}
      {SQUARES.map((s, i) => (
        <motion.rect
          key={i}
          y={s.y}
          width="14"
          height="14"
          fill="#8aa98f"
          fillOpacity="0.72"
          initial={{ x: s.startX }}
          animate={{ x: [s.startX, s.col, s.col, s.startX] }}
          transition={{
            duration: s.dur,
            times: [0, 0.35, 0.7, 1],
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}
    </svg>
  );
}

export function AudioSortLanding() {
  return (
    <section className="relative min-h-screen pt-40 pb-28 px-8 md:px-16 lg:px-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(18,16,12,0.62) 0%, rgba(18,16,12,0.52) 62%, rgba(18,16,12,0.18) 85%, transparent 100%)",
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center mb-20 max-w-4xl">
        <div>
          <motion.h1
            className="display text-6xl md:text-7xl tracking-[-0.01em] text-[#e3ddd0] leading-[0.9] mb-6 select-none"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {tool.title}.
          </motion.h1>
          <motion.p
            className="text-[15px] font-light text-[#a69f8f] leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            {tool.pitch}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
        >
          <HeroVisual />
        </motion.div>
      </div>

      <AudienceLine>{tool.audience}</AudienceLine>
      <MediaSlot src={tool.screenshot} alt={`${tool.title} interface`} />
      <FeatureBeats beats={BEATS} />
      <EmailCapture
        tag={tool.tag}
        prompt={tool.capturePrompt}
        cta={tool.captureCta}
        hint={CAPTURE_HINT}
      />

      <div className="mt-24 pt-8 border-t border-[#24201a]">
        <Link
          href="/store"
          className="text-[10px] font-mono tracking-[0.22em] text-[#5c564a] hover:text-[#8d867a] transition-colors duration-300 py-2 -my-2"
        >
          ← ALL TOOLS
        </Link>
      </div>
    </section>
  );
}
