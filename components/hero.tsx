"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlitchLabel } from "./glitch-label";
import { ContourField } from "./contour-field";
import { emitFieldPulse } from "./field-pulse";

// Clean type on the left; the artifact — the living ASCII field — framed on
// the right. Nothing draws underneath the text.
function fadeUp(delay: number, y = 10, duration = 0.7) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

const SECTIONS = [
  { n: "01", label: "AUDIO", count: "14", href: "#audio" },
  { n: "02", label: "VIDEO", count: "09", href: "#video" },
  { n: "03", label: "SECURITY", count: "10", href: "#security" },
  { n: "04", label: "3D", count: "02", href: "#threed" },
];

const SOCIALS = [
  { label: "GITHUB", href: "https://github.com/hadencain" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/haden-cain-77031124a/" },
  { label: "YOUTUBE", href: "https://www.youtube.com/@hadencain" },
];

const FIELDS = [1, 2, 3, 4, 5];

export function Hero() {
  const [field, setField] = useState(1);
  return (
    <section id="hero" className="relative min-h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center px-8 md:px-16 lg:px-24 pt-28 pb-16">
        {/* ── Left: the words ── */}
        <div className="lg:col-span-6">
          <motion.h1
            className="display select-none text-paper leading-[0.88] tracking-[0.015em] text-[clamp(4.2rem,11vw,10rem)]"
            initial={{ clipPath: "inset(0 0 100% 0)", y: 24 }}
            animate={{ clipPath: "inset(0 0 -10% 0)", y: 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block">Haden</span>
            <span className="block">Cain</span>
          </motion.h1>

          <motion.div className="mt-7" {...fadeUp(0.4, 8)}>
            <GlitchLabel />
          </motion.div>

          <motion.nav
            className="mt-12 flex flex-col"
            aria-label="Project sections"
            {...fadeUp(0.55, 12, 0.8)}
          >
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onMouseEnter={emitFieldPulse}
                onFocus={emitFieldPulse}
                className="group flex items-baseline gap-5 w-full max-w-sm py-[7px] border-b border-paper/12 hover:border-paper/40 transition-colors duration-300"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-paper-mute transition-colors duration-200 group-hover:text-paper">
                  {s.n}
                </span>
                <span className="font-mono text-[12px] tracking-[0.3em] text-paper-dim group-hover:text-paper transition-colors duration-200">
                  {s.label}
                </span>
                <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-paper-mute">
                  ×{s.count}
                </span>
              </a>
            ))}
          </motion.nav>

          <motion.div className="mt-10 flex gap-6" {...fadeUp(0.7)}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-[0.25em] text-paper-mute hover:text-paper underline underline-offset-4 decoration-paper/25 transition-colors duration-200 py-2 -my-2"
              >
                {s.label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* ── Right: the artifact, framed ── */}
        <motion.div
          className="lg:col-span-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
        >
          <div className="relative border border-paper/20 overflow-hidden h-[340px] sm:h-[420px] lg:h-[min(70vh,620px)]">
            <ContourField key={field} mode={field} />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] tracking-[0.25em] text-paper-mute select-none">
            <div className="flex gap-4">
              {FIELDS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setField(f)}
                  aria-pressed={field === f}
                  className={`py-2 -my-2 tracking-[0.25em] transition-colors duration-200 ${
                    field === f
                      ? "text-paper"
                      : "text-paper-mute hover:text-paper-dim"
                  }`}
                >
                  FIELD·0{f}
                </button>
              ))}
            </div>
            <span className="text-blood-bright">LIVE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
