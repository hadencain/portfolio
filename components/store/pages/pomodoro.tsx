"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("pomodoro")!;

const BEATS = [
  { name: "Stays out of the way", text: "Tray-native. Close to tray, get a notification when the session ends." },
  { name: "Deadline-true", text: "A timestamp core — it never drifts when the window sleeps." },
  { name: "Your cadence", text: "Work and break lengths, long-break cadence — all configurable." },
  { name: "No account", text: "No sync, no login, nothing phoned home." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

const R = 70;
const C = 2 * Math.PI * R;
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x1: 130 + Math.cos(a) * 80,
    y1: 115 + Math.sin(a) * 80,
    x2: 130 + Math.cos(a) * 88,
    y2: 115 + Math.sin(a) * 88,
  };
});

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {TICKS.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#2f2f2f" strokeWidth="1.5" />
      ))}
      <circle cx="130" cy="115" r={R} fill="none" stroke="#242424" strokeWidth="2" />
      <motion.circle
        cx="130"
        cy="115"
        r={R}
        fill="none"
        stroke="#cc8f7a"
        strokeOpacity="0.65"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={C}
        transform="rotate(-90 130 115)"
        animate={{ strokeDashoffset: [C * 0.15, C * 0.85] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="130" cy="115" r="3" fill="#cc8f7a" opacity="0.8" />
    </svg>
  );
}

export function PomodoroLanding() {
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
