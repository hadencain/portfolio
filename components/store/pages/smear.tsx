"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("smear")!;

const BEATS = [
  { name: "Smear", text: "A leaky integrator drags each spectral band through time — transients melt into texture." },
  { name: "Freeze", text: "Latch the spectrum and hold it. Indefinitely." },
  { name: "Decohere", text: "Slide from intact pitch to a phase-scrambled Paulstretch wash." },
  { name: "Width", text: "Blur energy across neighboring frequencies for wider, softer smears." },
];

const CAPTURE_HINT =
  "Leave an email and the Windows VST3 installer lands in your inbox when it ships. One email per release, nothing else.";

// 14 spectral bands, deterministic lengths — bars at left smear into
// horizontal streaks whose reach breathes slowly.
const BANDS = Array.from({ length: 14 }, (_, i) => ({
  y: 12 + i * 16,
  len: 90 + 70 * Math.abs(Math.sin(i * 1.7)),
  dur: 6 + (i % 5) * 1.5,
}));

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      <defs>
        <linearGradient id="smear-streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f85b8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8f85b8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {BANDS.map((b, i) => (
        <g key={i}>
          <rect x="16" y={b.y} width="3" height="10" fill="#8f85b8" opacity="0.7" />
          <motion.rect
            x="22"
            y={b.y + 3}
            height="4"
            fill="url(#smear-streak)"
            initial={{ width: b.len * 0.6 }}
            animate={{ width: [b.len * 0.6, b.len, b.len * 0.6] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  );
}

export function SmearLanding() {
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
