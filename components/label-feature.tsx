"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { emitFieldPulse } from "./field-pulse";

// Feature block for one line of work — a satellite site (external href, new
// tab) or an on-site catalog page (internal href, same tab).
// Renders bare (no page padding, no max-width) so each host places it.
export function LabelFeature({
  eyebrow,
  name,
  blurb,
  href,
  cta,
  className = "",
}: {
  eyebrow: string;
  name: string;
  blurb: string;
  href: string; // internal ("/security") or external ("https://…")
  cta: string;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {(() => {
        const internal = href.startsWith("/");
        const linkClass =
          "group block border-y border-paper/12 hover:border-paper/30 transition-colors duration-500 py-10 md:py-12";
        const body = (
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
            <div className="flex-1">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-paper-mute mb-4">
                {eyebrow}
              </p>
              <h2 className="display text-4xl md:text-5xl text-paper leading-none mb-4 select-none">
                {name}
              </h2>
              <p className="text-[12.5px] leading-relaxed text-paper-mute max-w-[58ch]">
                {blurb}
              </p>
            </div>
            <span className="font-mono text-[10px] tracking-[0.25em] text-paper-mute group-hover:text-blood-bright transition-colors duration-300 shrink-0">
              {cta}
            </span>
          </div>
        );
        return internal ? (
          <Link
            href={href}
            onMouseEnter={emitFieldPulse}
            onFocus={emitFieldPulse}
            className={linkClass}
          >
            {body}
          </Link>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={emitFieldPulse}
            onFocus={emitFieldPulse}
            className={linkClass}
          >
            {body}
          </a>
        );
      })()}
    </motion.div>
  );
}
