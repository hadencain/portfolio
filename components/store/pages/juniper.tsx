"use client";

import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("juniper")!;

const BEATS = [
  { name: "Wake", text: "Say the word. Vosk wake-word detection runs in a foreground service, fully on-device." },
  { name: "Capture first", text: "Every final transcript is written into your Obsidian vault before the model answers. Nothing spoken is ever lost." },
  { name: "Think", text: "Claude handles the conversation; speech in and out never leaves the phone." },
  { name: "Hands-free", text: "Push-to-talk or continuous conversation — an assistant, not a command line." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a release ships. One email per release, nothing else.";

// A spoken wave landing as vault lines — audio on top, files underneath.
const WAVE = Array.from({ length: 24 }, (_, i) => ({
  x: 30 + i * 8.5,
  h: 6 + 22 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)),
}));
const LINES = [
  { y: 168, w: 150 }, { y: 184, w: 118 }, { y: 200, w: 168 }, { y: 216, w: 92 },
];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {WAVE.map((b, i) => (
        <rect key={i} x={b.x} y={80 - b.h / 2} width="3" height={b.h} fill="#97b598" opacity="0.6" />
      ))}
      <motion.line
        x1="30"
        x2="30"
        y1="52"
        y2="108"
        stroke="#97b598"
        strokeWidth="1"
        animate={{ x1: [30, 232], x2: [30, 232] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
        opacity="0.7"
      />
      {LINES.map((l, i) => (
        <rect key={i} x="30" y={l.y} width={l.w} height="3" fill="#97b598" opacity="0.35" />
      ))}
    </svg>
  );
}

export function JuniperLanding() {
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
    </section>
  );
}
