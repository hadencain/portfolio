"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("claude-dispatch")!;

const BEATS = [
  { name: "Queue", text: "Capture work items as they come up; dispatch when you're ready." },
  { name: "Launch", text: "Spins up coding sessions per project — right directory, every time." },
  { name: "Ledger", text: "Live token usage, exact cost, GPU and CPU load — before the bill surprises you." },
  { name: "Local TUI", text: "A terminal app over your own transcripts. No service, no account." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

const QUEUE_YS = [56, 76, 96, 116, 136];
const ACTIVE = 2; // index of the dispatching row
const SESSIONS = [
  { x: 212, y: 62 },
  { x: 212, y: 112 },
  { x: 212, y: 162 },
];
const ORIGIN = { x: 100, y: QUEUE_YS[ACTIVE] };

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {QUEUE_YS.map((y, i) => (
        <rect
          key={i}
          x="24"
          y={y - 5}
          width="76"
          height="10"
          fill="none"
          stroke={i === ACTIVE ? "#8fa3c4" : "#2f2f2f"}
          strokeOpacity={i === ACTIVE ? 0.8 : 0.9}
          strokeWidth="1"
        />
      ))}
      {SESSIONS.map((s, i) => (
        <g key={i}>
          <line x1={ORIGIN.x} y1={ORIGIN.y} x2={s.x} y2={s.y} stroke="#2a2a2a" strokeWidth="1" />
          <circle cx={s.x} cy={s.y} r="4" fill="none" stroke="#8fa3c4" strokeOpacity="0.7" />
          <circle cx={s.x} cy={s.y} r="1.5" fill="#8fa3c4" opacity="0.8" />
          <motion.circle
            r="1.6"
            fill="#8fa3c4"
            animate={{
              cx: [ORIGIN.x, s.x],
              cy: [ORIGIN.y, s.y],
              opacity: [0.9, 0],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeIn", delay: i * 0.9 }}
          />
        </g>
      ))}
    </svg>
  );
}

export function ClaudeDispatchLanding() {
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
