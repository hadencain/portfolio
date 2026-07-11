"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("local-ai-voiceover")!;

const BEATS = [
  { name: "Your notes, read", text: "Any note becomes a chapterized m4a audiobook." },
  { name: "Local TTS", text: "The voice model runs on your own GPU — nothing is uploaded." },
  { name: "Chapterized", text: "Headings become chapters you can skip between." },
  { name: "Lands in the note", text: "The audio embeds back into the note, ready to play." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

const CHAPTERS = [
  { y: 62, w: 70 },
  { y: 80, w: 88 },
  { y: 98, w: 62 },
  { y: 116, w: 92 },
  { y: 134, w: 56 },
  { y: 152, w: 80 },
];
const ARCS = [24, 40, 56, 72];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {CHAPTERS.map((c, i) => (
        <line
          key={i}
          x1="24"
          y1={c.y}
          x2={24 + c.w}
          y2={c.y}
          stroke={i === 2 ? "#a08fc4" : "#3a3a3a"}
          strokeWidth="3"
          strokeOpacity={i === 2 ? 0.8 : 0.9}
        />
      ))}
      {ARCS.map((r, i) => (
        <motion.path
          key={r}
          d={`M 190 ${107 - r} A ${r} ${r} 0 0 1 190 ${107 + r}`}
          fill="none"
          stroke="#a08fc4"
          strokeWidth="1"
          animate={{ opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
      <circle cx="190" cy="107" r="3" fill="#a08fc4" opacity="0.8" />
    </svg>
  );
}

export function LocalAiVoiceoverLanding() {
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
