"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("poker-coach")!;

const BEATS = [
  { name: "The numbers", text: "VPIP, PFR, 3-bet, aggression — tracked live while you play." },
  { name: "6-max and heads-up", text: "Cash tables against AI seats, side pots and all." },
  { name: "Tournament ladder", text: "SNG blinds, eliminations, six tiers to climb." },
  { name: "No stakes", text: "Play-money table, real-stats conversation." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

const SEATS = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 130 + Math.cos(a) * 84,
    y: 100 + Math.sin(a) * 54,
    hero: i === 3,
  };
});
const BARS = [18, 30, 12, 24];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      <ellipse cx="130" cy="100" rx="90" ry="60" fill="none" stroke="#2a2a2a" strokeWidth="1" />
      <ellipse cx="130" cy="100" rx="62" ry="40" fill="none" stroke="#222222" strokeWidth="1" />
      {SEATS.map((s, i) => (
        <g key={i}>
          <circle
            cx={s.x}
            cy={s.y}
            r="4"
            fill={s.hero ? "#b58f9b" : "#3a3a3a"}
            opacity={s.hero ? 0.9 : 0.9}
          />
          {s.hero && (
            <motion.circle
              cx={s.x}
              cy={s.y}
              fill="none"
              stroke="#b58f9b"
              strokeWidth="1"
              animate={{ r: [6, 14], opacity: [0.7, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </g>
      ))}
      {BARS.map((h, i) => (
        <motion.rect
          key={i}
          x={92 + i * 24}
          width="10"
          fill="#b58f9b"
          initial={{ y: 208 - h, height: h, opacity: 0.5 }}
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}
    </svg>
  );
}

export function PokerCoachLanding() {
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
