"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="about"
      className="py-28 md:py-36 px-8 md:px-16 lg:px-24 border-t border-[#1c1c1c]"
    >
      <div ref={ref}>
        <motion.p
          className="text-[11px] tracking-[0.35em] uppercase text-[#888888] mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          About
        </motion.p>

        <motion.p
          className="text-2xl md:text-3xl font-extralight text-[#b8b8b8] leading-relaxed max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          Experimenting....
        </motion.p>
      </div>
    </section>
  );
}
