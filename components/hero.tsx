"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlitchLabel } from "./glitch-label";
import { ContourField } from "./contour-field";
import { SpecimenField } from "./specimen-field";
import { emitFieldPulse } from "./field-pulse";

// Clean type on the left; the artifact — the living ASCII field — framed on
// the right. Nothing draws underneath the text.
function fadeUp(delay: number, y = 10, duration = 0.7) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

const SECTIONS = [
  { n: "01", label: "SECURITY", count: "10", href: "#security" },
  { n: "02", label: "VIDEO", count: "08", href: "#video" },
];

// Platform accounts only — Arsenic is a destination, not a profile, and gets
// its own feature block below the work catalog.
const SOCIALS = [
  { label: "GITHUB", href: "https://github.com/hadencain" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/haden-cain-77031124a/" },
  { label: "YOUTUBE", href: "https://www.youtube.com/@hadencain" },
];

// All 51 fields ranked by complexity, most intricate first — the selector
// numbers positions, this array supplies the field each position runs.
// Encoding: 1–15 = ContourField modes, 16–51 = SpecimenField modes (+15).
// Rank weighs interacting systems and state (agents, phases, feedback)
// over single-formula fields.
const FIELD_ORDER = [
  1,  // mass — warp + veins + halo + patches + tears
  39, // modules — nine instruments waking in turn
  38, // reticle — parallax + lock-on + rings
  46, // hoard — three-state collectors, items, pile
  47, // detonation — phased drop / burst / verdict
  30, // erosion — fronts eating a mass that re-pours
  3,  // swarm — orbiting agents + trails
  11, // ants — rule-following highways
  4,  // automaton — B3/S23 colony
  50, // shelf print — layer-by-layer print cycle
  45, // pivot web — BFS shells, re-pivot
  37, // chain walk — weighted graph walker
  40, // redaction — scan head + latched redactions
  29, // ejection — decelerating pool at the floor ring
  26, // accretion — infall + growing core
  22, // sorter — falling items binned
  31, // melt — column slump + keyframe snap
  34, // osmosis — blobs crossing a membrane
  15, // typesetter — retyping document
  13, // constellation — drifting linked stars
  16, // grains — enveloped particle cloud
  24, // shatter — impulse shards
  18, // gate roll — probability lanes
  23, // fretboard — scale lattice + run
  51, // tile snap — dungeon assembling
  41, // dep tree — branching growth
  48, // history scrub — timeline findings
  44, // port map — sweep + pings
  43, // runaway fill — sediment + purge
  20, // step grid — pattern under a sweep
  19, // scrub — jumping playhead spray
  21, // wavetable — morphing frame stack
  2,  // cascade — columnar rain
  12, // dunes — creeping strata
  9,  // vortex — spiral arms
  14, // metaballs — merging masses
  5,  // interference — beating gratings
  28, // smear trail — leaky integrator
  27, // decoherence — bands losing phase
  6,  // ripple — ringing tank
  36, // layers — breathing documents
  42, // log tail — scrolling lookups
  32, // two plates — drifting overlap
  33, // slice tear — shearing bands
  25, // freeze bands — latching rows
  8,  // lissajous — traced figure
  10, // scope — trace over static
  7,  // spectrum — analyzer bars
  35, // delay stack — echoing edge
  49, // divergence — two drifting lines
  17, // harmonics — series under a window
];

const FIELDS = Array.from({ length: FIELD_ORDER.length }, (_, i) => i + 1);

export function Hero() {
  // Null until mount — the pick is random per visit, so it can't happen during
  // SSR/hydration without a server-client mismatch. The frame's own fade-in
  // (0.5s delay) covers the one-frame gap.
  const [field, setField] = useState<number | null>(null);
  useEffect(() => {
    setField(1 + Math.floor(Math.random() * FIELD_ORDER.length));
  }, []);
  return (
    <section id="hero" className="relative min-h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center px-8 md:px-16 lg:px-24 pt-16 lg:pt-8 pb-10">
        {/* ── Left: the words ── */}
        <div className="lg:col-span-6">
          <motion.h1
            className="display select-none text-paper leading-[0.92] text-[clamp(3.8rem,9.5vw,9rem)]"
            initial={{ clipPath: "inset(0 0 100% 0)", y: 24 }}
            animate={{ clipPath: "inset(0 0 -10% 0)", y: 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block">Haden</span>
            <span className="block">Cain</span>
          </motion.h1>

          <motion.div className="mt-7" {...fadeUp(0.4, 8)}>
            <GlitchLabel />
          </motion.div>

          <motion.nav
            className="mt-9 flex flex-col"
            aria-label="Project sections"
            {...fadeUp(0.55, 12, 0.8)}
          >
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onMouseEnter={emitFieldPulse}
                onFocus={emitFieldPulse}
                className="group flex items-baseline gap-5 w-full max-w-sm py-[7px] border-b border-paper/12 hover:border-paper/40 transition-colors duration-300"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-paper-mute transition-colors duration-200 group-hover:text-paper">
                  {s.n}
                </span>
                <span className="font-mono text-[12px] tracking-[0.3em] text-paper-dim group-hover:text-paper transition-colors duration-200">
                  {s.label}
                </span>
                <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-paper-mute">
                  ×{s.count}
                </span>
              </a>
            ))}
          </motion.nav>

          <motion.div className="mt-8 flex gap-6" {...fadeUp(0.7)}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-[0.25em] text-paper-mute hover:text-paper underline underline-offset-4 decoration-paper/25 transition-colors duration-200 py-2 -my-2"
              >
                {s.label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* ── Right: the artifact, framed ── */}
        <motion.div
          className="lg:col-span-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
        >
          <div className="relative border border-paper/20 overflow-hidden h-[340px] sm:h-[420px] lg:h-[min(70vh,620px)]">
            {field !== null &&
              ((FIELD_ORDER[field - 1] ?? 1) <= 15 ? (
                <ContourField key={field} mode={FIELD_ORDER[field - 1] ?? 1} />
              ) : (
                <SpecimenField key={field} mode={(FIELD_ORDER[field - 1] ?? 16) - 15} />
              ))}
          </div>
          {/* Full 51-field selector needs room to breathe — on a phone it
              wraps into five or six dense rows of digits. Desktop/tablet
              only; the framed field itself (random per visit) still plays
              on every screen size. */}
          <div className="mt-2 hidden md:flex items-center font-mono text-[9.5px] text-paper-mute select-none">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {FIELDS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setField(f)}
                  aria-pressed={field === f}
                  aria-label={`Field ${f}`}
                  className={`py-1.5 -my-1.5 tracking-[0.15em] transition-colors duration-200 ${
                    field === f
                      ? "text-paper"
                      : "text-paper-mute hover:text-paper-dim"
                  }`}
                >
                  {String(f).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
