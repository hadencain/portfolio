"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("white-hole")!;

const BEATS = [
  { name: "Lift", text: "Quiet spectral content gets pushed up into audibility." },
  { name: "Thin", text: "Peaks flatten toward the floor — density without pumping." },
  { name: "Floor + radius", text: "A dead-zone band where nothing moves. You choose where it sits." },
  { name: "Phase-preserving", text: "Magnitude-only gain — no smearing, transients arrive intact." },
];

const CAPTURE_HINT =
  "Leave an email and the Windows VST3 installer lands in your inbox when it ships. One email per release, nothing else.";

// 36 rays, deterministic lengths; two alternating groups pulse outward
// out of phase so the field breathes.
const RAYS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2;
  const len = 58 + 40 * Math.abs(Math.sin(i * 2.3));
  return {
    x1: 130 + Math.cos(a) * 26,
    y1: 120 + Math.sin(a) * 24,
    x2: 130 + Math.cos(a) * (26 + len),
    y2: 120 + Math.sin(a) * (24 + len * 0.9),
    group: i % 2,
  };
});

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {[0, 1].map((g) => (
        <motion.g
          key={g}
          style={{ transformOrigin: "130px 120px" }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.9, 0.5, 0.9] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: g * 3.5 }}
        >
          {RAYS.filter((r) => r.group === g).map((r, i) => (
            <line
              key={i}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              stroke={g === 0 ? "#8fb8c4" : "#2a2a2a"}
              strokeOpacity={g === 0 ? 0.45 : 0.9}
              strokeWidth="1"
            />
          ))}
        </motion.g>
      ))}
      <circle cx="130" cy="120" r="10" fill="none" stroke="#8fb8c4" strokeOpacity="0.7" />
      <circle cx="130" cy="120" r="3" fill="#8fb8c4" opacity="0.6" />
    </svg>
  );
}

export function WhiteHoleLanding() {
  return (
    <section className="relative min-h-screen pt-40 pb-28 px-8 md:px-16 lg:px-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.52) 62%, rgba(0,0,0,0.18) 85%, transparent 100%)",
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center mb-20 max-w-4xl">
        <div>
          <motion.h1
            className="text-6xl md:text-7xl font-extralight tracking-[-0.02em] text-[#e8e8e8] leading-[0.92] mb-6 select-none"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {tool.title}.
          </motion.h1>
          <motion.p
            className="text-[15px] font-light text-[#a8a8a8] leading-relaxed max-w-md"
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

      <div className="mt-24 pt-8 border-t border-[#1c1c1c]">
        <Link
          href="/store"
          className="text-[10px] font-mono tracking-[0.22em] text-[#555] hover:text-[#888] transition-colors duration-300 py-2 -my-2"
        >
          ← ALL TOOLS
        </Link>
      </div>
    </section>
  );
}
