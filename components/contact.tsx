"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      className="py-28 md:py-36 px-8 md:px-16 lg:px-24 border-t border-[#1c1c1c]"
    >
      <div ref={ref}>
        <motion.p
          className="text-[11px] tracking-[0.35em] uppercase text-[#888888] mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          Contact
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="mailto:haden.cain@gmail.com"
            className="border border-[#343434] text-[#787878] text-[11px] tracking-[0.25em] px-5 py-3 hover:border-[#555] hover:text-[#aaa] transition-all duration-300 inline-block"
          >
            EMAIL
          </a>
          <a
            href="https://keybase.io/hadencain"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#343434] text-[#787878] text-[11px] tracking-[0.25em] px-5 py-3 hover:border-[#555] hover:text-[#aaa] transition-all duration-300 inline-block"
          >
            KEYBASE
          </a>
        </motion.div>

        <div className="mt-28 md:mt-36 pt-6 border-t border-[#161616] flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#383838]">
            Haden Cain
          </span>
          <span className="text-[10px] text-[#303030]">{new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}
