"use client";

import { motion } from "framer-motion";
import { GlitchLabel } from "./glitch-label";
import { emitFieldPulse } from "./field-pulse";

// The field is the hero; everything printed on top of it earns its place.
// Name, one cycling label, the section index, three links. Nothing else.
function fadeUp(delay: number, y = 10, duration = 0.7) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

const SECTIONS = [
  { n: "01", label: "AUDIO", count: "14", href: "#audio" },
  { n: "02", label: "VIDEO", count: "07", href: "#video" },
  { n: "03", label: "SECURITY", count: "10", href: "#security" },
  { n: "04", label: "AR / MOBILE", count: "02", href: "#ar-mobile" },
  { n: "05", label: "3D", count: "02", href: "#threed" },
];

const SOCIALS = [
  { label: "GITHUB", href: "https://github.com/hadencain" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/haden-cain-77031124a/" },
  { label: "YOUTUBE", href: "https://www.youtube.com/@hadencain" },
];

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Readability pool — kept shallow so the field stays present */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 30% 55%, rgba(18,16,12,0.5) 0%, rgba(18,16,12,0.2) 55%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-28 pb-16">
        <motion.h1
          className="display select-none text-paper leading-[0.92] tracking-[0.01em] text-[clamp(4rem,13vw,11rem)] misreg-trigger"
          initial={{ clipPath: "inset(0 0 100% 0)", y: 24 }}
          animate={{ clipPath: "inset(0 0 -8% 0)", y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="misreg block" data-text="HADEN">
            HADEN
          </span>
          <span className="misreg block" data-text="CAIN">
            CAIN
          </span>
        </motion.h1>

        <motion.div className="mt-7" {...fadeUp(0.4, 8)}>
          <GlitchLabel />
        </motion.div>

        <motion.nav
          className="mt-14 md:mt-16 flex flex-col"
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
              <span className="font-mono text-[10px] tracking-[0.2em] text-paper-mute group-hover:text-blood-bright transition-colors duration-200">
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

        <motion.div className="mt-12 flex gap-6" {...fadeUp(0.7)}>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[0.25em] text-paper-mute hover:text-paper underline underline-offset-4 decoration-paper/25 hover:decoration-blood-bright transition-colors duration-200 py-2 -my-2"
            >
              {s.label}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
