"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("gravity-well")!;

const BEATS = [
  { name: "Mass", text: "Accumulates as audio feeds the well — the effect deepens the longer you play into it." },
  { name: "Redshift", text: "The whole spectrum migrates toward a floor frequency you choose." },
  { name: "Time dilation", text: "As mass grows, time stretches — motion slows near the horizon." },
  { name: "Pooling", text: "Energy collects and holds in the sub-bass instead of dissipating." },
];

const CAPTURE_HINT =
  "Leave an email and the Windows VST3 installer lands in your inbox when it ships. One email per release, nothing else.";

// Ring radii tighten toward the center — spacing compresses like a
// gravity gradient, not even circles.
const RINGS = [104, 84, 66, 50, 36, 24];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {RINGS.map((r, i) => (
        <ellipse
          key={r}
          cx="130"
          cy="120"
          rx={r}
          ry={r * 0.86}
          fill="none"
          stroke={i === RINGS.length - 1 ? "#c49a6c" : "#2a2a2a"}
          strokeOpacity={i === RINGS.length - 1 ? 0.6 : 0.9}
          strokeWidth="1"
        />
      ))}
      <circle cx="130" cy="120" r="7" fill="#050505" stroke="#c49a6c" strokeOpacity="0.5" />
      <motion.g
        style={{ transformOrigin: "130px 120px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="234" cy="120" r="2.5" fill="#c49a6c" opacity="0.8" />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "130px 120px" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="180" cy="120" r="1.8" fill="#c49a6c" opacity="0.5" />
      </motion.g>
    </svg>
  );
}

export function GravityWellLanding() {
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
