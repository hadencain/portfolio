"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NICHES, TOOLS, type Tool } from "./registry";
import { emitFieldPulse } from "../field-pulse";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ToolRow({ tool, delay }: { tool: Tool; delay: number }) {
  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-[15px] font-light text-[#c2bbab] leading-snug shrink-0">
          {tool.title}
        </h3>
        {tool.status === "page" ? (
          <span className="text-[10px] font-mono tracking-[0.22em] text-[#5c564a] uppercase shrink-0">
            →
          </span>
        ) : (
          <span className="text-[9px] font-mono tracking-[0.22em] text-[#4e483c] uppercase shrink-0">
            soon
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#7d7566] font-light leading-relaxed max-w-[70ch]">
        {tool.pitch}
      </p>
    </>
  );

  const shell = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {tool.status === "page" ? (
        <Link
          href={`/store/${tool.slug}`}
          onMouseEnter={emitFieldPulse}
          onFocus={emitFieldPulse}
          className="flex flex-col gap-2 py-5 border-b border-[#1d1a15] hover:border-[#322d24] transition-colors duration-500 group"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex flex-col gap-2 py-5 border-b border-[#1d1a15] opacity-45 select-none">
          {inner}
        </div>
      )}
    </motion.div>
  );
  return shell;
}

export function StoreHub() {
  const visible = TOOLS.filter((t) => t.status !== "retired");

  return (
    <section className="relative min-h-screen pt-40 pb-28 px-8 md:px-16 lg:px-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(18,16,12,0.62) 0%, rgba(18,16,12,0.52) 62%, rgba(18,16,12,0.18) 85%, transparent 100%)",
        }}
      />

      <motion.h1
        className="display text-5xl md:text-6xl text-[#e3ddd0] leading-[0.9] mb-4 select-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        Tools.
      </motion.h1>
      <motion.p
        className="text-[11px] tracking-[0.3em] uppercase text-[#665f51] mb-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      >
        small software for specific people · pick your field
      </motion.p>

      <div className="flex flex-col gap-16 max-w-3xl">
        {NICHES.map((niche) => {
          const group = visible.filter((t) => t.niche === niche.id);
          if (group.length === 0) return null;
          return (
            <div key={niche.id}>
              <div className="flex items-center gap-5 mb-2">
                <span className="text-[10px] tracking-[0.35em] uppercase text-[#665f51] shrink-0">
                  {niche.label}
                </span>
                <motion.div
                  className="flex-1 h-px bg-[#24201a] origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 1.2, ease: EASE }}
                />
              </div>
              {group.map((t, i) => (
                <ToolRow key={t.slug} tool={t} delay={i * 0.06} />
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-24 pt-8 border-t border-[#24201a] flex gap-8">
        <Link
          href="/#work"
          className="text-[10px] font-mono tracking-[0.22em] text-[#5c564a] hover:text-[#8d867a] transition-colors duration-300 py-2 -my-2"
        >
          FREE BROWSER TOOLS
        </Link>
        <a
          href="https://github.com/hadencain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono tracking-[0.22em] text-[#5c564a] hover:text-[#8d867a] transition-colors duration-300 py-2 -my-2"
        >
          GITHUB
        </a>
      </div>
    </section>
  );
}
