"use client";

import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("vox")!;

const BEATS = [
  { name: "Hold to talk", text: "Hold a key, speak, release — cleaned-up text lands in whatever window has focus." },
  { name: "Cleanup pass", text: "A local LLM strips fillers, punctuates, and resolves self-corrections." },
  { name: "Context-aware", text: "Formats for the app you're dictating into — email, code, chat." },
  { name: "Offline", text: "Whisper on your GPU, Ollama on your CPU. No audio leaves the machine." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when a packaged release ships. One email per release, nothing else.";

// Waveform bars left of center, typed lines to the right.
const WAVE = Array.from({ length: 32 }, (_, i) => ({
  x: 18 + i * 3.4,
  a: 4 + 30 * Math.abs(Math.sin(i * 0.55)) * Math.exp(-Math.abs(i - 16) / 12),
}));
const TEXT_LINES = [
  { y: 92, w: 88 },
  { y: 110, w: 66 },
  { y: 128, w: 96 },
  { y: 146, w: 52 },
];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      <motion.g
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {WAVE.map((s, i) => (
          <line
            key={i}
            x1={s.x}
            y1={120 - s.a}
            x2={s.x}
            y2={120 + s.a}
            stroke="#c4b08f"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        ))}
      </motion.g>
      {TEXT_LINES.map((l, i) => (
        <motion.line
          key={i}
          x1="150"
          y1={l.y}
          x2={150 + l.w}
          y2={l.y}
          stroke="#c4b08f"
          strokeWidth="2"
          strokeOpacity="0.55"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.1, delay: i * 1.0, repeat: Infinity, repeatDelay: 3.2, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

export function VoxLanding() {
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
