"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("assay")!;

const BEATS = [
  { name: "Workbench", text: "From a raw download to profiled, joined, and queried — one place." },
  { name: "Recomputed numbers", text: "Every reported figure is recomputed from the data, not eyeballed from a chart." },
  { name: "False-discovery guard", text: "Findings survive correction before they get called findings." },
  { name: "Local", text: "Datasets stay on your disk." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

// 12x8 cell matrix; cells near the diagonal trend are hot.
const GRID = Array.from({ length: 96 }, (_, i) => {
  const col = i % 12;
  const row = Math.floor(i / 12);
  return {
    x: 30 + col * 18,
    y: 42 + row * 20,
    hot: Math.abs(col - row * 1.4) < 1.2,
  };
});
const FINDING = { x: 30 + 8 * 18, y: 42 + 5 * 20 };

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {GRID.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r="1.8"
          fill={c.hot ? "#8fb897" : "#2f2f2f"}
          opacity={c.hot ? 0.7 : 0.9}
        />
      ))}
      <motion.circle
        cx={FINDING.x}
        cy={FINDING.y}
        fill="none"
        stroke="#8fb897"
        strokeWidth="1"
        animate={{ r: [5, 12], opacity: [0.8, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  );
}

export function AssayLanding() {
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
