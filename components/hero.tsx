"use client";

import { motion } from "framer-motion";
import { GlitchLabel } from "./glitch-label";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

const SECTIONS = [
  { n: "01", label: "SOUND / VIDEO", href: "#sound-video" },
  { n: "02", label: "SECURITY", href: "#security" },
  { n: "03", label: "AR / MOBILE", href: "#ar-mobile" },
  { n: "04", label: "3D", href: "#threed" },
];

const SOCIALS = [
  { label: "GITHUB", href: "https://github.com/hadencain" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/haden-cain-77031124a/" },
  { label: "YOUTUBE", href: "https://www.youtube.com/@hadencain" },
];

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen h-screen overflow-x-hidden">
      {/* Readability gradient — the contour field shows through everywhere else */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 25% 55%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex items-center h-full px-8 md:px-16 lg:px-24 pt-24">
        <div>
          <motion.div className="mb-8" {...fadeUp(0.1)}>
            <GlitchLabel />
          </motion.div>

          <motion.h1
            className="text-7xl md:text-8xl lg:text-9xl font-extralight tracking-[-0.02em] text-[#e8e8e8] leading-[0.92] mb-10 select-none"
            {...fadeUp(0.2)}
          >
            HADEN
            <br />
            CAIN
          </motion.h1>

          <motion.nav
            className="flex flex-col gap-3 mb-12"
            aria-label="Project sections"
            {...fadeUp(0.35)}
          >
            {SECTIONS.map((s) => (
              <a key={s.href} href={s.href} className="group flex items-baseline gap-4 w-fit">
                <span className="text-[10px] tracking-[0.2em] text-[#606060] group-hover:text-[#787878] transition-colors duration-300">
                  {s.n}
                </span>
                <span className="text-[12px] tracking-[0.3em] text-[#787878] group-hover:text-[#e8e8e8] transition-colors duration-300">
                  {s.label}
                </span>
              </a>
            ))}
          </motion.nav>

          <motion.div className="flex gap-3" {...fadeUp(0.5)}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#343434] text-[#787878] text-[11px] tracking-[0.25em] px-5 py-3 hover:border-[#555] hover:text-[#aaa] transition-all duration-300"
              >
                {s.label}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
