"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("daily-prayer")!;

const BEATS = [
  { name: "Pray to unlock", text: "Your apps stay behind a lock until the ritual is done — check in, receive a prayer, pray it." },
  { name: "A prayer written for you", text: "Two quick check-ins — how you're feeling, what's weighing on you — become a prayer for that moment." },
  { name: "Streaks & scripture", text: "A daily streak, a week strip, and a verse of the day to carry with you." },
  { name: "Your unlock window", text: "You choose how long the phone stays open — 15 to 60 minutes — then it locks again." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when it reaches testing on Android and iOS. One email per release, nothing else.";

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x1: 130 + Math.cos(a) * 78,
    y1: 115 + Math.sin(a) * 78,
    x2: 130 + Math.cos(a) * 88,
    y2: 115 + Math.sin(a) * 88,
  };
});

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {RAYS.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#2f2f2f" strokeWidth="1.5" />
      ))}
      {/* breathing halo — the pace of a prayer, not a timer */}
      <motion.circle
        cx="130"
        cy="115"
        r="62"
        fill="none"
        stroke="#c9a86a"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        animate={{ strokeOpacity: [0.15, 0.55, 0.15], r: [58, 62, 58] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* lock body */}
      <rect x="106" y="112" width="48" height="38" rx="6" fill="none" stroke="#242424" strokeWidth="2" />
      {/* shackle */}
      <path d="M 114 112 V 100 A 16 16 0 0 1 146 100 V 112" fill="none" stroke="#242424" strokeWidth="2" />
      <motion.circle
        cx="130"
        cy="131"
        r="3"
        fill="#c9a86a"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function DailyPrayerLanding() {
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
