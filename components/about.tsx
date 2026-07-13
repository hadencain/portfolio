"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// The About section holds no biography by design. In print, an empty page
// still gets set — so this one carries the printer's own convention for
// deliberate emptiness, and nothing else.
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
          className="font-mono text-[10px] tracking-[0.35em] uppercase text-paper-mute mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          About
        </motion.p>

        <motion.p
          className="font-mono text-[11px] md:text-[12px] tracking-[0.3em] text-paper-dim"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          [ THIS PAGE INTENTIONALLY LEFT BLANK — SEE INSTRUMENTS ]
        </motion.p>
      </div>
    </section>
  );
}
