"use client";

import { motion } from "framer-motion";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 pt-24"
    >
      <div>
        <motion.p
          className="text-[11px] tracking-[0.35em] uppercase text-[#606060] mb-8"
          {...fadeUp(0.1)}
        >
          Creative Coder
        </motion.p>

        <motion.h1
          className="text-7xl md:text-8xl lg:text-9xl font-extralight tracking-[-0.02em] text-[#e8e8e8] leading-[0.92] mb-10 select-none"
          {...fadeUp(0.2)}
        >
          HADEN
          <br />
          CAIN
        </motion.h1>

        <motion.p
          className="text-base text-[#646464] font-light leading-relaxed mb-12 max-w-sm"
          {...fadeUp(0.35)}
        >
          Stay humble, but always stay hungry.
        </motion.p>

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
    </section>
  );
}
