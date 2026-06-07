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

      </div>
    </section>
  );
}
