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
          className="smallcaps text-[13px] tracking-[0.3em] text-paper-mute mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          Contact
        </motion.p>

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
            href="https://www.linkedin.com/in/haden-cain-77031124a/"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={emitFieldPulse}
            onFocus={emitFieldPulse}
            className="border border-ink-3 font-mono text-paper-dim text-[11px] tracking-[0.25em] px-5 py-3 hover:border-blood-bright hover:text-paper transition-all duration-200 inline-block"
          >
            LINKEDIN
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

        {/* Closing rule — thick over thin, the printer's end mark. The page
            stops here on purpose rather than trailing off. */}
        <div className="mt-24 md:mt-32 flex flex-col gap-[3px]">
          <motion.div
            className="h-[2px] bg-paper/25 origin-left"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="h-px bg-paper/12 origin-left"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </section>
  );
}
