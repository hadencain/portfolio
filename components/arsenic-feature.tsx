"use client";

import { motion } from "framer-motion";
import { ARSENIC_ORIGIN } from "@/lib/arsenic";
import { emitFieldPulse } from "./field-pulse";

// House ad for the sister label — a catalog runs one of these for its own
// imprint. Renders bare (no page padding, no max-width) so each host places it.
export function ArsenicFeature() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={ARSENIC_ORIGIN}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={emitFieldPulse}
        onFocus={emitFieldPulse}
        className="group block border-y border-paper/12 hover:border-paper/30 transition-colors duration-500 py-10 md:py-12"
      >
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
          <div className="flex-1">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-paper-mute mb-4">
              The audio line
            </p>
            <h2 className="display text-4xl md:text-5xl text-paper leading-none mb-4 select-none">
              Arsenic
            </h2>
            <p className="text-[12.5px] leading-relaxed text-paper-mute max-w-[58ch]">
              Spectral processors, terminal instruments, and sample tools. The
              audio work runs as its own label.
            </p>
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-paper-mute group-hover:text-blood-bright transition-colors duration-300 shrink-0">
            VISIT ARSENIC ↗
          </span>
        </div>
      </a>
    </motion.div>
  );
}
