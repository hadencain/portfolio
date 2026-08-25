"use client";

import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";
import { MOBILE_ORIGIN } from "@/lib/mobile";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("focus-garden")!;

const BEATS = [
  { name: "Placed in your space", text: "One tap puts the garden on your actual desk through the camera. It stays where you left it." },
  { name: "Grown, not picked", text: "Every plant is grown procedurally from its own seed — twelve species, no two alike." },
  { name: "Stakes", text: "Walk away mid-cycle and the plant withers. The bench keeps it next to the ones you finished." },
  { name: "Deadline-true core", text: "The desktop timer's timestamp engine, ported — it never drifts when the phone sleeps." },
];

const CAPTURE_HINT =
  "In development, Android first. Leave an email and you'll hear when it ships — one email per release, nothing else.";

// A plant drawing itself: ground line, stem, leaves peeling off in sequence —
// growth as the loop, in place of the timer's ring.
const LEAVES = [
  { d: "M130 178 C 118 168, 104 166, 92 172", delay: 0.9 },
  { d: "M132 156 C 146 148, 160 148, 170 156", delay: 1.7 },
  { d: "M133 132 C 122 122, 110 118, 98 122", delay: 2.5 },
  { d: "M134 110 C 146 100, 158 98, 168 104", delay: 3.3 },
];

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      {/* ground */}
      <line x1="60" y1="204" x2="200" y2="204" stroke="#2f2f2f" strokeWidth="1.5" />
      <line x1="76" y1="212" x2="184" y2="212" stroke="#242424" strokeWidth="1" />
      {/* stem */}
      <motion.path
        d="M128 204 C 132 180, 128 150, 134 120 C 137 104, 134 92, 136 80"
        fill="none"
        stroke="#c4b08f"
        strokeOpacity="0.6"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, repeatDelay: 3.4, ease: "easeOut" }}
      />
      {LEAVES.map((l, i) => (
        <motion.path
          key={i}
          d={l.d}
          fill="none"
          stroke="#c4b08f"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.1, delay: l.delay, repeat: Infinity, repeatDelay: 6.5, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

export function FocusGardenLanding() {
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
      <p className="mt-6 text-[12px] text-[#7d7566] font-light leading-relaxed max-w-md">
        The other Android apps live at{" "}
        <a
          href={MOBILE_ORIGIN}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a69f8f] hover:text-[#d8453a] underline underline-offset-4 decoration-[#3a352b] transition-colors duration-300"
        >
          Mobile
        </a>
        .
      </p>
    </section>
  );
}
