"use client";

import { motion } from "framer-motion";
import { GlitchLabel } from "./glitch-label";
import { emitFieldPulse } from "./field-pulse";

// Cover plate of the catalog. The name is the pressing — it wipes in like a
// sheet coming off the press; annotations are the operator's marks and settle
// quickly around it.
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
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden flex flex-col"
    >
      {/* Readability pool under the composition */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 75% at 50% 55%, rgba(18,16,12,0.62) 0%, rgba(18,16,12,0.3) 55%, transparent 100%)",
        }}
      />

      {/* ── Frame: registration marks + operator annotations ── */}
      <motion.div
        className="absolute inset-x-6 md:inset-x-10 top-20 bottom-6 pointer-events-none text-paper-mute"
        {...fadeUp(0.9, 0, 1.2)}
      >
        <div className="absolute top-0 left-0 flex items-center gap-3">
          <span className="regmark" />
          <span className="font-mono text-[9px] tracking-[0.3em]">
            HC / CATALOG — {new Date().getFullYear()}
          </span>
        </div>
        <div className="absolute top-0 right-0 hidden sm:flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.3em]">
            PLATE 00 / COVER
          </span>
          <span className="regmark" />
        </div>
        <div className="absolute bottom-0 left-0 flex items-center gap-3">
          <span className="regmark" />
          <span className="font-mono text-[9px] tracking-[0.3em]">
            SOFTWARE ENGINEER &amp; AUDIO TOOLMAKER
          </span>
        </div>
        <div className="absolute bottom-0 right-0 hidden sm:flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.3em]">35 ENTRIES</span>
          <span className="regmark" />
        </div>
      </motion.div>

      {/* ── Composition ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-28 pb-16">
        {/* Eyebrow: the tagline split across the measure, poster-register */}
        <motion.div
          className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between mb-5 font-mono text-[10px] tracking-[0.35em] text-paper-dim"
          {...fadeUp(0.55, 6)}
        >
          <span>THINGS THAT MAKE NOISE</span>
          <span className="hidden sm:inline text-paper-mute" aria-hidden>
            ·
          </span>
          <span>THINGS THAT MAKE SENSE</span>
        </motion.div>

        {/* The pressing */}
        <motion.h1
          className="display select-none text-paper leading-[0.8] tracking-[-0.015em] text-[clamp(4.6rem,16.5vw,15rem)] misreg-trigger"
          initial={{ clipPath: "inset(0 0 100% 0)", y: 24 }}
          animate={{ clipPath: "inset(0 0 -8% 0)", y: 0 }}
          transition={{ duration: 1.15, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="misreg block" data-text="HADEN">
            HADEN
          </span>
          <span className="misreg block" data-text="CAIN">
            CAIN
          </span>
        </motion.h1>

        {/* Underline rule + cycling discipline label, set like a plate caption */}
        <motion.div
          className="mt-6 flex items-center gap-6 border-t border-paper/25 pt-4"
          {...fadeUp(0.45, 8)}
        >
          <span className="font-mono text-[9px] tracking-[0.3em] text-blood-bright shrink-0">
            NOW PRINTING
          </span>
          <GlitchLabel />
        </motion.div>

        {/* Index + socials */}
        <div className="mt-14 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 items-end">
          <motion.nav
            className="md:col-span-7 flex flex-col"
            aria-label="Project sections"
            {...fadeUp(0.6, 12, 0.8)}
          >
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onMouseEnter={emitFieldPulse}
                onFocus={emitFieldPulse}
                className="group flex items-baseline gap-5 w-full max-w-md py-[7px] border-b border-paper/12 hover:border-paper/40 transition-colors duration-300"
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

          <motion.div
            className="md:col-span-5 md:justify-self-end flex flex-col items-start md:items-end gap-5"
            {...fadeUp(0.75)}
          >
            <p className="font-mono text-[10px] leading-relaxed tracking-[0.14em] text-paper-mute border border-paper/20 px-4 py-3 max-w-[30ch] md:text-right">
              INSTRUMENTS FOR DESTROYING SIGNAL CAREFULLY — SPECTRAL, GRANULAR,
              TERMINAL, PRINTED.
            </p>
            <div className="flex gap-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] tracking-[0.25em] text-paper-dim hover:text-paper underline underline-offset-4 decoration-paper/25 hover:decoration-blood-bright transition-colors duration-200 py-2 -my-2"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
