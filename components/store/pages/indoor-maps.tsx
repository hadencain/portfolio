"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("indoor-maps")!;

const BEATS = [
  { name: "Author", text: "Draw rooms, doors, and vertical links on a snap grid." },
  { name: "Route", text: "A* wayfinding, across floors — routes follow elevators and stairs." },
  { name: "Floors", text: "Switch levels; geometry and routing stay coherent." },
  { name: "Your building", text: "IMDF-flavored data you own. No platform, no per-seat pricing." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

// Outer shell, then interior walls with door gaps (the gaps are where the route crosses).
const WALLS: [number, number, number, number][] = [
  [24, 40, 236, 40],
  [236, 40, 236, 200],
  [236, 200, 24, 200],
  [24, 200, 24, 40],
  [24, 120, 140, 120],
  [172, 120, 236, 120],
  [120, 40, 120, 88],
  [120, 104, 120, 120],
  [170, 120, 170, 158],
  [170, 174, 170, 200],
];
const ROUTE = "M 60 80 L 100 80 L 100 96 L 150 96 L 150 150 L 200 150 L 200 176";

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {WALLS.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2f2f2f" strokeWidth="1.5" />
      ))}
      <motion.path
        d={ROUTE}
        fill="none"
        stroke="#c48f8f"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeDasharray="6 6"
        animate={{ strokeDashoffset: [0, -48] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="60" cy="80" r="3" fill="#c48f8f" opacity="0.8" />
      <motion.circle
        cx="200"
        cy="176"
        fill="none"
        stroke="#c48f8f"
        strokeWidth="1"
        animate={{ r: [4, 11], opacity: [0.8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <circle cx="200" cy="176" r="2.5" fill="#c48f8f" opacity="0.8" />
    </svg>
  );
}

export function IndoorMapsLanding() {
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
