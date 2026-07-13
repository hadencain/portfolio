"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("fracture")!;

const BEATS = [
  { name: "Grain engine", text: "The reverb tail is fragmented into grains — pitch, size, and reverse scatter." },
  { name: "FDN core", text: "A feedback-delay-network reverb underneath the fragmentation." },
  { name: "Three views", text: "FIELD, SCOPE, and SHARDS — three visualizers of the same decay." },
  { name: "Crystalline decays", text: "Tails that disintegrate instead of just fading out." },
];

const CAPTURE_HINT =
  "Leave an email and the Windows VST3 installer lands in your inbox when it ships. One email per release, nothing else.";

// Hand-placed shatter web: an impact point at (118,112), primary cracks
// radiating out, secondary cracks bridging them. Deterministic.
const CRACKS: [number, number, number, number][] = [
  [118, 112, 30, 34],
  [118, 112, 74, 16],
  [118, 112, 196, 22],
  [118, 112, 244, 92],
  [118, 112, 226, 190],
  [118, 112, 132, 226],
  [118, 112, 44, 200],
  [118, 112, 14, 130],
  [74, 16, 44, 60],
  [196, 22, 168, 66],
  [244, 92, 196, 110],
  [226, 190, 178, 158],
  [44, 200, 78, 160],
  [14, 130, 62, 118],
];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {CRACKS.map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={i < 8 ? "#9fb4c8" : "#2a2a2a"}
          strokeWidth="1"
          animate={{ opacity: i < 8 ? [0.5, 0.15, 0.5] : [0.9, 0.5, 0.9] }}
          transition={{
            duration: 5 + (i % 4) * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i % 7) * 0.6,
          }}
        />
      ))}
      <circle cx="118" cy="112" r="2.5" fill="#9fb4c8" opacity="0.8" />
    </svg>
  );
}

export function FractureLanding() {
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
