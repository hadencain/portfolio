"use client";

import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("vox-android")!;

const BEATS = [
  { name: "Bubble", text: "A floating mic bubble rides over every app — tap, talk, done." },
  { name: "Transcribe", text: "whisper.cpp over JNI. Transcription happens on the phone, not on a server." },
  { name: "Cleanup", text: "An on-device Gemma model strips filler and fixes punctuation before a single character lands." },
  { name: "Inject", text: "An AccessibilityService types the result into whatever field has focus. Any app, no paste." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when the Play Store release ships. One email per release, nothing else.";

// Mic dot radiating rings; the transcript arrives as mono dashes below.
const DASHES = [
  { x: 44, w: 30 }, { x: 82, w: 18 }, { x: 108, w: 42 }, { x: 158, w: 24 },
  { x: 44, w: 22 }, { x: 74, w: 38 }, { x: 120, w: 16 }, { x: 144, w: 34 },
].map((d, i) => ({ ...d, y: 158 + Math.floor(i / 4) * 18 }));

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      <circle cx="130" cy="82" r="5" fill="#8fa9b8" opacity="0.85" />
      {[0, 0.9, 1.8].map((delay, i) => (
        <motion.circle
          key={i}
          cx="130"
          cy="82"
          fill="none"
          stroke="#8fa9b8"
          strokeWidth="1"
          animate={{ r: [8, 42], opacity: [0.6, 0] }}
          transition={{ duration: 2.7, delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      {DASHES.map((d, i) => (
        <rect key={i} x={d.x} y={d.y} width={d.w} height="3" fill="#8fa9b8" opacity="0.45" />
      ))}
    </svg>
  );
}

export function VoxAndroidLanding() {
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
