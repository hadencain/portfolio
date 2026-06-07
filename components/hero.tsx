"use client";

import { motion } from "framer-motion";
import { BlackHoleSim } from "./black-hole-sim";
import { GlitchLabel } from "./glitch-label";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen h-screen overflow-hidden">

      {/* Fluid fills entire background */}
      <div className="absolute inset-0">
        <BlackHoleSim />
      </div>

      {/* Dark gradient — keeps left-side text readable without killing the fluid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 25% 55%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
        }}
      />

      {/* Text content */}
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


          <motion.div className="flex gap-3" {...fadeUp(0.5)}>
            <a
              href="https://github.com/hadencain"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#343434] text-[#787878] text-[11px] tracking-[0.25em] px-5 py-3 hover:border-[#555] hover:text-[#aaa] transition-all duration-300"
            >
              GITHUB
            </a>
            <a
              href="https://www.linkedin.com/in/haden-cain-77031124a/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#343434] text-[#787878] text-[11px] tracking-[0.25em] px-5 py-3 hover:border-[#555] hover:text-[#aaa] transition-all duration-300"
            >
              LINKEDIN
            </a>
            <a
              href="https://www.youtube.com/@hadencain"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#343434] text-[#787878] text-[11px] tracking-[0.25em] px-5 py-3 hover:border-[#555] hover:text-[#aaa] transition-all duration-300"
            >
              YOUTUBE
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
