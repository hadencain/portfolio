"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("sample-viewer")!;

const BEATS = [
  { name: "The map", text: "Your whole library projected by sonic similarity — neighborhoods of sound, not folders." },
  { name: "Tempo + key", text: "Analyzed locally, visible on every point." },
  { name: "Drag to DAW", text: "Grab a point, drop it on a track. That's the whole workflow." },
  { name: "Local", text: "Scans on your machine. The library never leaves it." },
];

const CAPTURE_HINT =
  "The beta list gets builds first and shapes what the map learns next. Nothing else lands in your inbox.";

// Three deterministic clusters of samples + one highlighted point.
const CLUSTERS = [
  { cx: 70, cy: 70, n: 18, spread: 34 },
  { cx: 185, cy: 95, n: 22, spread: 42 },
  { cx: 115, cy: 180, n: 16, spread: 30 },
];
const POINTS = CLUSTERS.flatMap((c, ci) =>
  Array.from({ length: c.n }, (_, i) => ({
    x: c.cx + Math.sin(i * 2.4 + ci) * c.spread * Math.abs(Math.cos(i * 1.3)),
    y: c.cy + Math.cos(i * 1.9 + ci * 2) * c.spread * Math.abs(Math.sin(i * 1.7)),
    dim: i % 3 === 0,
  }))
);
const HIGHLIGHT = { x: 185, y: 95 };

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {POINTS.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.8"
          fill={p.dim ? "#2f3a34" : "#8fae9a"}
          opacity={p.dim ? 0.9 : 0.55}
        />
      ))}
      <circle cx={HIGHLIGHT.x} cy={HIGHLIGHT.y} r="3" fill="#8fae9a" />
      <motion.circle
        cx={HIGHLIGHT.x}
        cy={HIGHLIGHT.y}
        fill="none"
        stroke="#8fae9a"
        strokeWidth="1"
        animate={{ r: [6, 16], opacity: [0.7, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  );
}

export function SampleViewerLanding() {
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
          <motion.p
            className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#5c564a] mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            in development · beta opening
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
