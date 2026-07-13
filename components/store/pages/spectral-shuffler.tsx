"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toolBySlug } from "../registry";
import { AudienceLine, FeatureBeats, MediaSlot } from "../landing-kit";
import { EmailCapture } from "../email-capture";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const tool = toolBySlug("spectral-shuffler")!;

const BEATS = [
  { name: "Capture", text: "Grab FFT frames from a frequency band you define — a window onto part of the spectrum." },
  { name: "Shuffle", text: "Replay the captured frames in random order. The band stutters and scatters while time keeps moving." },
  { name: "Freeze", text: "Lock the band and hold it, indefinitely, as the rest of the signal flows past." },
  { name: "Surgical", text: "Everything outside the range passes unmodified — targeted spectral chaos, not a global wash." },
];

const CAPTURE_HINT =
  "Leave an email and the Windows VST3 installer lands in your inbox when it ships. One email per release, nothing else.";

// 22 spectral bins; a highlighted band in the middle whose bars re-order
// (shuffle) their heights on a loop. Deterministic seed via index math.
const BARS = Array.from({ length: 22 }, (_, i) => ({
  x: 18 + i * 10,
  h: 18 + 58 * Math.abs(Math.sin(i * 1.31)),
  inBand: i >= 8 && i <= 14,
  dur: 2.4 + (i % 4) * 0.55,
}));
const BAND_X1 = 18 + 8 * 10 - 3;
const BAND_X2 = 18 + 14 * 10 + 8;

function HeroVisual() {
  return (
    <svg width="260" height="240" viewBox="0 0 260 240" aria-hidden className="opacity-80">
      <rect
        x={BAND_X1}
        y="24"
        width={BAND_X2 - BAND_X1}
        height="182"
        fill="#8aa9b8"
        fillOpacity="0.07"
        stroke="#8aa9b8"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
      {BARS.map((b, i) =>
        b.inBand ? (
          <motion.rect
            key={i}
            x={b.x}
            width="5"
            fill="#8aa9b8"
            fillOpacity="0.75"
            initial={{ y: 200 - b.h, height: b.h }}
            animate={{
              y: [200 - b.h, 200 - b.h * 0.4, 200 - b.h],
              height: [b.h, b.h * 0.4, b.h],
            }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <rect key={i} x={b.x} y={200 - b.h} width="5" height={b.h} fill="#3a3a3a" />
        )
      )}
    </svg>
  );
}

export function SpectralShufflerLanding() {
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
