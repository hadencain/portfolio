"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { emitFieldPulse } from "../field-pulse";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type ResearchCard = {
  slug: string;
  title: string;
  date?: string;
  dataset?: string;
  headline?: string;
  abstract?: string;
  n_findings?: number;
};

function EntryCard({ card, delay }: { card: ResearchCard; delay: number }) {
  return (
    <motion.div
      onMouseEnter={emitFieldPulse}
      onFocus={emitFieldPulse}
      className="border border-[#1e1e1e] hover:border-[#2c2c2c] transition-colors duration-500 bg-[#0a0a0a]"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      <Link href={`/research/${card.slug}`} className="flex flex-col gap-4 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[10px] font-mono tracking-[0.22em] text-[#555] uppercase">
            {card.date ?? ""}
          </span>
          <span className="text-[10px] font-mono tracking-[0.22em] text-[#555] uppercase truncate">
            {card.dataset ?? ""}
          </span>
        </div>
        <h3 className="text-[15px] font-light text-[#c8c8c8] leading-snug">
          {card.title}
        </h3>
        {card.abstract && (
          <p className="text-[12px] leading-relaxed text-[#777]">{card.abstract}</p>
        )}
        <span className="text-[10px] font-mono tracking-[0.22em] text-[#555] uppercase">
          {card.n_findings ?? 0} verified finding{(card.n_findings ?? 0) === 1 ? "" : "s"} →
        </span>
      </Link>
    </motion.div>
  );
}

export function ResearchSection() {
  const [cards, setCards] = useState<ResearchCard[] | null>(null);

  useEffect(() => {
    fetch("/research/index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCards)
      .catch(() => setCards([]));
  }, []);

  return (
    <section className="px-8 md:px-16 lg:px-24 pt-36 pb-28 max-w-5xl">
      <motion.p
        className="text-[10px] font-mono tracking-[0.22em] text-[#555] uppercase mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        Research
      </motion.p>
      <motion.h1
        className="text-[26px] md:text-[32px] font-light text-[#c8c8c8] leading-tight mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
      >
        Dataset investigations
      </motion.h1>
      <motion.p
        className="text-[13px] leading-relaxed text-[#777] max-w-xl mb-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
      >
        Statistical explorations of public datasets. Every reported number is
        independently recomputed from the raw data; findings survive
        false-discovery correction before they appear here.
      </motion.p>

      {cards === null ? (
        <p className="text-[12px] font-mono text-[#555]">loading…</p>
      ) : cards.length === 0 ? (
        <p className="text-[12px] font-mono text-[#555]">No published research yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((c, i) => (
            <EntryCard key={c.slug} card={c} delay={0.1 + i * 0.06} />
          ))}
        </div>
      )}
    </section>
  );
}
