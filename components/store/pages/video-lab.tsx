"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("video-lab")!;

const BEATS = [
  { name: "glitch", text: "Temporal corruption — datamosh-style frame damage applied to uploaded video in real time through Canvas." },
  { name: "osmosis", text: "Pixel contamination between two videos — bleed, bleed rate, and blend, frame by frame." },
  { name: "spectral", text: "Audio-reactive temporal displacement — spectral energy drives frame buffering and displacement live." },
  { name: "palimpsest", text: "Audio-reactive temporal compositor — layers of frames blended by spectral energy, exports to WEBM." },
  { name: "markov", text: "Markov-chain video sequencer — learns transition probabilities from playback history and remixes statistically." },
  { name: "smear", text: "Audio-driven corruption — the track melts the picture: sustained energy drags frames along estimated motion, transients rupture them in blocks." },
];

// Every instrument runs in the browser right now — these are the doors.
const DEMOS = [
  { name: "glitch", href: "/tools/glitch/" },
  { name: "osmosis", href: "/tools/osmosis/" },
  { name: "spectral", href: "/tools/spectral/" },
  { name: "palimpsest", href: "/tools/palimpsest/" },
  { name: "markov", href: "/tools/markov/" },
  { name: "smear", href: "/tools/smear/" },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when new instruments join the lab. One email per release, nothing else.";

// A video frame mid-tear: tone bars with two slice bands shearing sideways.
const BANDS = [
  { y: 92, h: 16, from: 0, to: 18, dur: 2.6 },
  { y: 138, h: 10, from: 0, to: -24, dur: 3.4 },
];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-85">
      <rect x="20" y="46" width="220" height="150" fill="#0d0b0b" stroke="#2f2a2a" strokeWidth="1" />
      {/* tone bars */}
      {Array.from({ length: 7 }, (_, i) => (
        <rect
          key={i}
          x={24 + i * 31}
          y="50"
          width="27"
          height="142"
          fill="#c47a6e"
          opacity={0.05 + i * 0.02}
        />
      ))}
      {/* slice bands shearing out of register */}
      {BANDS.map((b, i) => (
        <motion.g
          key={i}
          animate={{ x: [b.from, b.to, b.from, b.from] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 1] }}
        >
          <rect x="20" y={b.y} width="220" height={b.h} fill="#0d0b0b" />
          {Array.from({ length: 7 }, (_, j) => (
            <rect
              key={j}
              x={24 + j * 31}
              y={b.y}
              width="27"
              height={b.h}
              fill="#c47a6e"
              opacity={0.1 + j * 0.03}
            />
          ))}
        </motion.g>
      ))}
      {/* scanline sweeping */}
      <motion.line
        x1="20"
        x2="240"
        stroke="#c47a6e"
        strokeWidth="1"
        strokeOpacity="0.55"
        animate={{ y1: [50, 192], y2: [50, 192] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

export function VideoLabLanding() {
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

      {/* Every instrument is live right now — no waitlist for these. */}
      <div className="mb-20">
        <p className="text-[10px] font-mono tracking-[0.22em] text-[#5c564a] mb-4">
          RUN THEM NOW
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {DEMOS.map((d) => (
            <a
              key={d.name}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline gap-3 py-1"
            >
              <span className="font-mono text-[8.5px] tracking-[0.25em] text-[#c4574a] border border-[#c4574a]/50 px-1.5 py-0.5 group-hover:bg-[#c4574a] group-hover:text-[#e3ddd0] transition-colors duration-200">
                LIVE
              </span>
              <span className="font-mono text-[12px] tracking-[0.02em] text-[#a69f8f] group-hover:text-[#e3ddd0] transition-colors duration-200">
                {d.name}
              </span>
            </a>
          ))}
        </div>
      </div>

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
