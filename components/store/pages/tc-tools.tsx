"use client";

import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("tc-tools")!;

const BEATS = [
  { name: "TCGS · available now", text: "A terminal-controlled granular synthesizer — grain engine, 4-LFO modulation matrix, polyphonic voices, live Textual TUI with waveform + grain-field display." },
  { name: "TCDM · available now", text: "A terminal-controlled drum machine — sample-accurate step transport, Elektron-style per-step param locks, an 8-slot pattern bank, and a full master FX chain." },
  { name: "TCWS · available now", text: "A terminal-controlled wavetable synthesizer — a morphing wavetable engine where scanning position is the headline modulation target, with spectral morph mode, a 64-slot mod matrix, unison, and a live morphing-waveform TUI." },
  { name: "More on the way", text: "FM and subtractive instruments in the same family are in progress — the collection grows." },
  { name: "One language", text: "Every instrument is driven entirely from the command line, each with a live terminal interface. No mouse required." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when the collection — and each new instrument — ships. One email per release, nothing else.";

// A terminal window: prompt, blinking cursor, and a step row lighting up.
const STEPS = Array.from({ length: 8 }, (_, i) => ({
  x: 40 + i * 22,
  delay: i * 0.22,
}));

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-85">
      <rect x="20" y="46" width="220" height="150" fill="#0b0d0b" stroke="#2a2f2a" strokeWidth="1" />
      <circle cx="32" cy="58" r="2.5" fill="#3a4a3a" />
      <circle cx="42" cy="58" r="2.5" fill="#3a4a3a" />
      <circle cx="52" cy="58" r="2.5" fill="#3a4a3a" />
      <line x1="20" y1="70" x2="240" y2="70" stroke="#1c221c" strokeWidth="1" />
      <text x="40" y="104" fontFamily="monospace" fontSize="13" fill="#7ea86e" letterSpacing="1">
        TC&gt; play
      </text>
      <motion.rect
        x="112"
        y="93"
        width="7"
        height="14"
        fill="#7ea86e"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
      {STEPS.map((s, i) => (
        <motion.rect
          key={i}
          x={s.x}
          y="150"
          width="14"
          height="18"
          fill="#7ea86e"
          initial={{ opacity: 0.18 }}
          animate={{ opacity: [0.18, 0.9, 0.18] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </svg>
  );
}

export function TcToolsLanding() {
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
