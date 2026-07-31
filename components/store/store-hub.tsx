"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TOOLS, type Tool } from "./registry";
import { ArsenicFeature } from "../arsenic-feature";
import { LabelFeature } from "../label-feature";
import { emitFieldPulse } from "../field-pulse";
import { MOBILE_ORIGIN } from "@/lib/mobile";

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
        className="display text-5xl md:text-6xl text-[#e3ddd0] leading-[0.9] mb-6 select-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        Tools.
      </motion.h1>

      {/* The two imprints, equal weight. -mt-px overlaps the adjoining
          hairlines so the stack reads as one ruled block, not a double line. */}
      <div className="max-w-3xl mb-20">
        <ArsenicFeature labelLine={false} />
        <LabelFeature
          className="-mt-px"
          eyebrow="The mobile line"
          name="mobile"
          blurb="AR instruments, flashcards, on-device dictation, and a voice assistant — local-first Android apps."
          href={MOBILE_ORIGIN}
          cta="VISIT MOBILE ↗"
        />
      </div>

      {/* Flat list, not niche groups — seven tools across four categories
          made three of those categories a heading over a single row. Regroup
          once the catalog is dense enough to earn the headings back. */}
      <div className="flex flex-col max-w-3xl">
        {visible.map((tool, i) => (
          <ToolRow key={tool.slug} tool={tool} delay={i * 0.06} />
        ))}
      </div>
    </section>
  );
}
