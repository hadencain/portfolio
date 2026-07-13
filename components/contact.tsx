"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { emitFieldPulse } from "./field-pulse";

// Back cover of the catalog: one word set huge, correspondence marks, colophon.
export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 px-8 md:px-16 lg:px-24 border-t border-paper/12"
    >
      <div ref={ref}>
        <motion.p
          className="font-mono text-[10px] tracking-[0.35em] uppercase text-paper-mute mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          End of catalog — correspondence
        </motion.p>

        <motion.a
          href="mailto:haden.cain@gmail.com"
          onMouseEnter={emitFieldPulse}
          onFocus={emitFieldPulse}
          className="display misreg-trigger block w-fit text-paper leading-[0.85] tracking-[-0.015em] text-[clamp(3.8rem,13vw,11rem)] select-none hover:text-paper transition-colors"
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="misreg" data-text="WRITE.">
            WRITE.
          </span>
        </motion.a>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="mailto:haden.cain@gmail.com"
            onMouseEnter={emitFieldPulse}
            onFocus={emitFieldPulse}
            className="border border-ink-3 font-mono text-paper-dim text-[11px] tracking-[0.25em] px-5 py-3 hover:border-blood-bright hover:text-paper transition-all duration-200 inline-block"
          >
            EMAIL
          </a>
          <a
            href="https://keybase.io/hadencain"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={emitFieldPulse}
            onFocus={emitFieldPulse}
            className="border border-ink-3 font-mono text-paper-dim text-[11px] tracking-[0.25em] px-5 py-3 hover:border-blood-bright hover:text-paper transition-all duration-200 inline-block"
          >
            KEYBASE
          </a>
        </motion.div>

        {/* Colophon */}
        <div className="mt-28 md:mt-36 pt-6 border-t border-paper/12 flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-paper-mute">
            Haden Cain
          </span>
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-paper-mute hidden md:inline">
            Set in Bodoni Moda &amp; Geist Mono
          </span>
          {/* -mr compensates the trailing tracking space so the year sits flush right */}
          <span className="font-mono text-[9px] tracking-[0.3em] -mr-[0.3em] text-paper-mute">
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </section>
  );
}
