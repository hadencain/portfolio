"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("senses")!;

const BEATS = [
  { name: "Camera", text: "The phone's camera and motion sensors become control surfaces you perform with." },
  { name: "Artifacts", text: "Modular audio-visual instruments — find the artifact in your environment and play it." },
  { name: "Generative", text: "Sound and visuals rendered live and reactive, not pre-baked clips." },
  { name: "Android", text: "Built on Expo / React Native with Skia rendering and on-device audio." },
];

const CAPTURE_HINT =
  "Leave an email and you'll hear when there's a build to try. One email per release, nothing else.";

// A viewfinder frame with tracked landmark dots joined by faint edges, plus a
// scanning pulse — the machine reading the room.
const LANDMARKS: [number, number][] = [
  [96, 96],
  [132, 84],
  [166, 104],
  [150, 140],
  [110, 150],
  [130, 116],
];
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [5, 1],
  [5, 3],
  [5, 4],
];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-85">
      {/* viewfinder corner brackets */}
      {[
        "M40 56 L40 40 L56 40",
        "M204 40 L220 40 L220 56",
        "M220 184 L220 200 L204 200",
        "M56 200 L40 200 L40 184",
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#6f9aa2" strokeWidth="1.5" strokeOpacity="0.6" />
      ))}
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={LANDMARKS[a][0]}
          y1={LANDMARKS[a][1]}
          x2={LANDMARKS[b][0]}
          y2={LANDMARKS[b][1]}
          stroke="#7fb0b8"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      {LANDMARKS.map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="3"
          fill="#7fb0b8"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
      <motion.circle
        cx="130"
        cy="120"
        fill="none"
        stroke="#7fb0b8"
        strokeWidth="1"
        animate={{ r: [10, 74], opacity: [0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  );
}

export function SensesLanding() {
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
