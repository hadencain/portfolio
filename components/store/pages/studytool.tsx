"use client";

import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("studytool")!;

const BEATS = [
  { name: "Anki import", text: "Drop in an .apkg and study — unzip and zstd decode in pure JS, no Anki install anywhere." },
  { name: "Scheduler", text: "Spaced repetition with per-deck state in SQLite. Every review persists, every interval earned." },
  { name: "Native", text: "The desktop tool's service layer ported diff-identical; the UI rebuilt native on Expo." },
  { name: "Offline", text: "No account, no sync, no server. The deck lives on the phone." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a release ships. One email per release, nothing else.";

// Review timeline — dots at exponentially widening intervals, the next-due
// card pulsing. Deterministic positions.
const INTERVALS = [0, 1, 2.2, 3.8, 6, 8.8].map((v, i) => ({
  x: 28 + v * 24,
  due: i === 3,
}));
const CARDS = Array.from({ length: 5 }, (_, i) => ({
  x: 36 + i * 8,
  y: 150 - i * 8,
}));

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {CARDS.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width="120"
          height="72"
          fill="#12100c"
          stroke="#b8a68f"
          strokeOpacity={0.25 + i * 0.12}
          strokeWidth="1"
        />
      ))}
      <line x1="28" y1="52" x2="240" y2="52" stroke="#b8a68f" strokeOpacity="0.25" strokeWidth="1" />
      {INTERVALS.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy="52" r="2.2" fill="#b8a68f" opacity={p.due ? 0.9 : 0.5} />
          {p.due && (
            <motion.circle
              cx={p.x}
              cy="52"
              fill="none"
              stroke="#b8a68f"
              strokeWidth="1"
              animate={{ r: [4, 11], opacity: [0.8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

export function StudytoolLanding() {
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
            className="display text-5xl md:text-6xl text-[#e3ddd0] leading-[0.9] mb-6 select-none"
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
    </section>
  );
}
