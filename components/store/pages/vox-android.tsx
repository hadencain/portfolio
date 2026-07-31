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

// The Vox CRT (the app's actual bubble character): pixel monitor, ball riding the
// voice, REC lamp blinking. Same block geometry as the launcher icon; transcript
// arrives as mono dashes beneath the set.
const CRT_RECTS: Array<[number, number, number, number, string]> = [
  [30, 37.33, 48, 31.06, "#6b4a35"],      // body
  [31.13, 68.39, 45.74, 2.82, "#6b4a35"], // lower step
  [32.82, 70.65, 42.35, 2.82, "#553a29"], // rounded bottom
  [32.82, 34.51, 42.35, 2.82, "#7d5843"], // rounded top
  [33.11, 39.03, 38.96, 26.26, "#553a29"],// screen recess
  [34.24, 40.16, 36.71, 24, "#10141f"],   // glass
  [37.34, 66.7, 4.24, 4.24, "#553a29"],   // chin button
  [38.33, 67.69, 2.26, 2.26, "#7d5843"],  // button highlight
];

const DASHES = [
  { x: 20, w: 24 }, { x: 50, w: 14 }, { x: 70, w: 30 },
  { x: 20, w: 16 }, { x: 42, w: 28 }, { x: 76, w: 12 },
].map((d, i) => ({ ...d, y: 82 + Math.floor(i / 3) * 8 }));

function HeroVisual() {
  return (
    <svg width="240" height="240" viewBox="0 0 108 108" aria-hidden className="opacity-80">
      {CRT_RECTS.map(([x, y, w, h, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
      {/* REC lamp */}
      <motion.rect
        x="66.5"
        y="67.2"
        width="2.26"
        height="2.26"
        fill="#ff5f56"
        animate={{ opacity: [0.9, 0.9, 0.12, 0.12] }}
        transition={{ duration: 0.8, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
      />
      {/* the ball, riding the voice */}
      <motion.rect
        x="50.6"
        width="3.95"
        height="3.95"
        fill="#f5efdf"
        animate={{ y: [59.7, 46, 59.7, 52.5, 59.7, 44, 59.7, 56, 59.7] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
      {DASHES.map((d, i) => (
        <motion.rect
          key={`d${i}`}
          x={d.x}
          y={d.y}
          width={d.w}
          height="1.6"
          fill="#f5efdf"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4] }}
          transition={{ duration: 0.5, delay: i * 0.9, repeat: Infinity, repeatDelay: 4.9 }}
        />
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
