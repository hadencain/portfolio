"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("anchor")!;

const BEATS = [
  { name: "Local synthesis", text: "An Ollama model writes the answer on your machine — the question never leaves it." },
  { name: "Cited", text: "Every claim links back to the page it came from." },
  { name: "SearXNG search", text: "Meta-search across engines without a tracking profile." },
  { name: "Grounding guardrail", text: "If the sources don't support it, it doesn't get said." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

// Seven sources scattered along the top, one anchored answer below.
const SOURCES = Array.from({ length: 7 }, (_, i) => ({
  x: 34 + i * 32,
  y: 42 + 20 * Math.abs(Math.sin(i * 2.1)),
}));
const ANCHOR_PT = { x: 130, y: 188 };

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {SOURCES.map((s, i) => (
        <g key={i}>
          <line
            x1={s.x}
            y1={s.y}
            x2={ANCHOR_PT.x}
            y2={ANCHOR_PT.y}
            stroke="#2a2a2a"
            strokeWidth="1"
          />
          <circle cx={s.x} cy={s.y} r="2.5" fill="#7a9bb5" opacity="0.55" />
          <motion.circle
            r="1.6"
            fill="#7a9bb5"
            animate={{
              cx: [s.x, ANCHOR_PT.x],
              cy: [s.y, ANCHOR_PT.y],
              opacity: [0.8, 0],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeIn", delay: i * 0.5 }}
          />
        </g>
      ))}
      <circle cx={ANCHOR_PT.x} cy={ANCHOR_PT.y} r="5" fill="none" stroke="#7a9bb5" strokeOpacity="0.7" />
      <circle cx={ANCHOR_PT.x} cy={ANCHOR_PT.y} r="2" fill="#7a9bb5" opacity="0.8" />
    </svg>
  );
}

export function AnchorLanding() {
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
