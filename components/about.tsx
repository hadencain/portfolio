"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// The About section holds no biography by design — just the section label
// over empty space.
export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="about"
      className="relative py-32 md:py-44 px-8 md:px-16 lg:px-24"
    >
      <div ref={ref} className="max-w-none">
        <motion.p
          className="smallcaps text-[13px] tracking-[0.3em] text-paper-mute mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          About
        </motion.p>
      </div>
    </section>
  );
}
