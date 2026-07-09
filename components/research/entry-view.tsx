"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Finding = {
  question: string;
  test_name: string;
  test_type: string;
  statistic: number;
  p_value: number;
  effect_size: number;
  q_value?: number | null;
  n: number;
  verification: string;
  figure?: string | null;
};

type Entry = {
  slug: string;
  title: string;
  abstract?: string | null;
  date?: string;
  dataset?: string;
  findings: Finding[];
  synthesis?: string | null;
  quality_issues: { column: string; issue: string; detail: string }[];
  caveat: { total: number; survivors: number; confirmed: number; flagged: number; unverifiable: number };
};

const VERIF_COLOR: Record<string, string> = {
  confirmed: "text-[#4c9e6a]",
  discrepancy: "text-[#c08a3e]",
  unverifiable: "text-[#777]",
};

function fmtP(p: number) {
  return p < 0.001 ? "p < .001" : `p = ${p.toPrecision(3)}`;
}

function FindingBlock({ f, slug, i }: { f: Finding; slug: string; i: number }) {
  return (
    <motion.div
      className="border-t border-[#1e1e1e] py-10"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: 0.05 * i, ease: EASE }}
    >
      <h3 className="text-[15px] font-light text-[#c8c8c8] leading-snug mb-3">
        {f.question}
      </h3>
      <p className="text-[11px] font-mono text-[#777] mb-1">
        {f.test_name} · stat = {f.statistic.toPrecision(3)} · {fmtP(f.p_value)} ·
        effect = {f.effect_size.toPrecision(3)} · n = {f.n.toLocaleString()}
      </p>
      <p className={`text-[10px] font-mono tracking-[0.22em] uppercase mb-5 ${VERIF_COLOR[f.verification] ?? "text-[#777]"}`}>
        {f.verification}
      </p>
      {f.figure && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/research/${slug}/${f.figure}`}
          alt={f.question}
          className="w-full max-w-2xl border border-[#1e1e1e] bg-[#fcfcfb]"
          loading="lazy"
          decoding="async"
        />
      )}
    </motion.div>
  );
}

export function EntryView({ slug }: { slug: string }) {
  const [entry, setEntry] = useState<Entry | null | "missing">(null);

  useEffect(() => {
    fetch(`/research/${slug}/entry.json`)
      .then((r) => (r.ok ? r.json() : "missing"))
      .then(setEntry)
      .catch(() => setEntry("missing"));
  }, [slug]);

  if (entry === null)
    return <p className="px-8 md:px-16 lg:px-24 pt-36 text-[12px] font-mono text-[#555]">loading…</p>;
  if (entry === "missing")
    return (
      <div className="px-8 md:px-16 lg:px-24 pt-36">
        <p className="text-[12px] font-mono text-[#555] mb-4">Entry not found.</p>
        <Link href="/research" className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#777] hover:text-[#aaa]">
          ← Research
        </Link>
      </div>
    );

  const c = entry.caveat;
  return (
    <article className="px-8 md:px-16 lg:px-24 pt-36 pb-28 max-w-3xl">
      <Link
        href="/research"
        className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#555] hover:text-[#999] transition-colors"
      >
        ← Research
      </Link>
      <div className="flex items-baseline gap-6 mt-8 mb-3">
        <span className="text-[10px] font-mono tracking-[0.22em] text-[#555] uppercase">{entry.date}</span>
        <span className="text-[10px] font-mono tracking-[0.22em] text-[#555] uppercase">{entry.dataset}</span>
      </div>
      <motion.h1
        className="text-[26px] md:text-[32px] font-light text-[#c8c8c8] leading-tight mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {entry.title}
      </motion.h1>
      {entry.abstract && (
        <p className="text-[14px] leading-relaxed text-[#999] mb-6">{entry.abstract}</p>
      )}
      <p className="text-[11px] font-mono text-[#555] mb-12">
        {c.total} tests · {c.survivors} survived correction · {c.confirmed} independently
        confirmed{c.flagged ? ` · ${c.flagged} flagged` : ""}{c.unverifiable ? ` · ${c.unverifiable} unverifiable` : ""}
      </p>

      {entry.quality_issues.length > 0 && (
        <div className="border border-[#2a2416] bg-[#12100a] p-5 mb-4 text-[12px] leading-relaxed text-[#a08a55]">
          <p className="text-[10px] font-mono tracking-[0.22em] uppercase mb-2">Data quality flags</p>
          {entry.quality_issues.map((q, i) => (
            <p key={i}>
              {q.column}: {q.issue} ({q.detail})
            </p>
          ))}
        </div>
      )}

      {entry.findings.map((f, i) => (
        <FindingBlock key={i} f={f} slug={entry.slug} i={i} />
      ))}

      {entry.synthesis && (
        <div className="border-t border-[#1e1e1e] pt-10 mt-2">
          <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#555] mb-4">
            Synthesis — interpretation
          </p>
          {entry.synthesis.split(/\n\n+/).map((para, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-[#999] mb-4">
              {para}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}
