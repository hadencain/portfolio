"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Project {
  title: string;
  description: string;
  tags: string[];
  github: string;
  youtube?: string;
  demo?: string;
}

const AUDIO: Project[] = [
  {
    title: "granular-synthesizer",
    description:
      "Granular synthesis engine built as a VST3 plugin. Full grain control, LFO modulation matrix, and real-time waveform display.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/granular-synthesizer",
  },
  {
    title: "harmonic-filter-sequencer",
    description:
      "Bandpass filter applied to the harmonics of incoming audio. Max for Live patch for spectral rhythm processing.",
    tags: ["Max/MSP"],
    github: "https://github.com/hadencain/harmonic-filter-sequencer",
  },
  {
    title: "TCBBP",
    description:
      "Terminal-controlled beat-based probability system. Stochastic sequencing driven entirely from the command line.",
    tags: ["ChucK"],
    github: "https://github.com/hadencain/TCBBP",
  },
  {
    title: "TCGS",
    description:
      "Terminal-controlled granular synthesizer. Full grain engine with playhead, FX chain, 4-LFO modulation matrix, polyphonic voices, and a live Textual TUI with waveform display and grain-field visualizer.",
    tags: ["Python", "numpy", "Textual"],
    github: "https://github.com/hadencain/TCGS",
  },
  {
    title: "audioSort",
    description:
      "Audio sample organizer evolved from keyword matching into a weighted multi-signal classifier — path context, metadata, librosa spectral analysis, and an AST ML model.",
    tags: ["Python", "librosa", "HuggingFace"],
    github: "https://github.com/hadencain/audioSort",
  },
  {
    title: "tunedown-theory",
    description:
      "Interactive scale and theory practice tool for guitar and keyboard. Fretboard and keyboard visualization with selectable scales, modes, and chord highlighting.",
    tags: ["TypeScript", "React"],
    github: "https://github.com/hadencain/tunedown-theory",
  },
  {
    title: "fracturedReverb",
    description:
      "Granular reverb VST3. A feedback delay network tail fragmented by a grain engine — captures late reverb field as FFT frames and re-scatters them for disintegrating, crystalline textures.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/fracturedReverb",
  },
  {
    title: "spectralShuffler",
    description:
      "Spectral shuffler VST3. Captures FFT frames from a user-defined frequency band and randomly replays them — freeze, scatter, or smear specific frequency ranges in real time while the rest of the signal passes through unmodified.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/spectralShuffler",
  },
  {
    title: "gravityWell",
    description:
      "Spectral black-hole VST3. Audio falls into a gravitational well below a configurable floor frequency — bins redshift (pitch lowers), energy pools into the sub-bass, and time dilates as mass accumulates. Decoherence thermalizes structured partials into rumble at full mass. Phase vocoder core with lock-free audio-to-UI spectrum bridge.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/gravityWell",
  },
];

const VIDEO: Project[] = [
  {
    title: "RGBA_blending",
    description:
      "Alpha-blend two files to generate cover art or video output. Max for Live patch for generative visual composition.",
    tags: ["Max/MSP"],
    github: "https://github.com/hadencain/RGBA_blending",
  },
  {
    title: "glitch",
    description:
      "Browser-based video manipulation. Temporal corruption algorithms applied to uploaded video in real-time through Canvas.",
    tags: ["HTML5", "Canvas", "JavaScript"],
    github: "https://github.com/hadencain/glitch",
    demo: "/tools/glitch/",
  },
  {
    title: "osmosis",
    description:
      "Pixel contamination between two videos. Bleed, bleed rate, and blend controls applied frame by frame in the browser.",
    tags: ["HTML5", "Canvas", "JavaScript"],
    github: "https://github.com/hadencain/osmosis",
    demo: "/tools/osmosis/",
  },
  {
    title: "spectral",
    description:
      "Audio-reactive temporal displacement of video frames. Spectral energy drives frame buffering and displacement in real-time.",
    tags: ["HTML5", "Canvas", "Web Audio"],
    github: "https://github.com/hadencain/spectral",
    demo: "/tools/spectral/",
  },
  {
    title: "palimpsest",
    description:
      "Audio-reactive temporal compositor. Layers of video frames blended by spectral energy, with export to WEBM.",
    tags: ["HTML5", "Canvas", "Web Audio"],
    github: "https://github.com/hadencain/palimpsest",
    demo: "/tools/palimpsest/",
  },
  {
    title: "markov",
    description:
      "Markov chain video sequencer. Learns transition probabilities from playback history and remixes video segments statistically.",
    tags: ["HTML5", "Canvas", "JavaScript"],
    github: "https://github.com/hadencain/markov",
    demo: "/tools/markov/",
  },
];

const SECURITY: Project[] = [
  {
    title: "secret-scanner",
    description:
      "Scans source files for accidentally committed secrets — API keys, private keys, AWS credentials, passwords, and connection strings. Named regex patterns plus optional entropy-based detection. Git pre-commit hook blocks commits before exposure.",
    tags: ["Python"],
    github: "https://github.com/hadencain/secret-scanner",
  },
  {
    title: "dependency-risk-scan",
    description:
      "CLI tool that audits Python dependencies for outdated packages, abandoned libraries, and known CVEs — from a local requirements.txt or any GitHub repo URL.",
    tags: ["Python"],
    github: "https://github.com/hadencain/dependency-risk-scan",
  },
  {
    title: "capabilityaccessmanager-monitor",
    description:
      "Monitors and auto-remediates the Windows 11 camsvc WAL runaway write bug — a system process that silently fills drives. Electron tray app with alerting and one-click remediation.",
    tags: ["Electron", "JavaScript"],
    github: "https://github.com/hadencain/capabilityaccessmanager_monitor",
  },
  {
    title: "portCheck",
    description:
      "Windows CLI for monitoring localhost dev server ports. Lists all listeners, inspects process detail, health-scans for exposed interfaces and port conflicts, kills processes by PID, and watches for real-time open/close events.",
    tags: ["Go"],
    github: "https://github.com/hadencain/portCheck",
  },
  {
    title: "mlb-ev-analysis",
    description:
      "Model-generated win probabilities compared against sportsbook lines. Baseball analytics with edge detection.",
    tags: ["Python"],
    github: "https://github.com/hadencain/mlb-ev-analysis",
  },
];

const AR_MOBILE: Project[] = [
  {
    title: "vessel",
    description:
      "Android AR instrument. Import a video, locate the artifact in your physical environment, and perform with it through space.",
    tags: ["Kotlin", "ARCore", "MediaPipe", "AAudio"],
    github: "https://github.com/hadencain/vessel",
  },
  {
    title: "senses",
    description:
      "Modular AR audio-visual instruments for Android. Camera, motion, and generative audio as playable pieces.",
    tags: ["React Native", "Skia", "Web Audio"],
    github: "https://github.com/hadencain/senses",
  },
];

const THREED: Project[] = [
  {
    title: "openlock-terrain-gen",
    description:
      "Browser-based OpenLOCK dungeon tile generator. Configurable piece types (straight, corner, T, cross, doorway, window, curved, column, staircase), six surface themes with parametric detail, and batch STL export — powered by manifold-3d WASM CSG for watertight boolean geometry.",
    tags: ["TypeScript", "React", "WebGL", "WASM"],
    github: "https://github.com/hadencain/openlock-terrain-gen",
  },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function emitFieldPulse(e: React.MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("field-pulse", {
      detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    })
  );
}

const Arrow = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M1 11L11 1M11 1H2.5M11 1V9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" />
  </svg>
);

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="text-[10px] tracking-[0.18em] uppercase text-[#787878] border border-[#2c2c2c] px-2 py-[3px]"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// Large card — for Sound/Video, shows youtube iframe when available
function MediaCard({ project, delay }: { project: Project; delay: number }) {
  return (
    <motion.div
      onMouseEnter={emitFieldPulse}
      className="border border-[#1e1e1e] flex flex-col"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {project.youtube && (
        <iframe
          className="aspect-video w-full border-b border-[#1e1e1e]"
          src={project.youtube}
          title={project.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      <div className="flex flex-col gap-4 p-6 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[13px] font-light text-[#c8c8c8] leading-tight">{project.title}</h3>
          <div className="flex items-center gap-3 shrink-0">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono tracking-[0.22em] text-[#e0e0e0] underline underline-offset-2 decoration-[#383838] hover:decoration-[#888] transition-colors duration-300"
                aria-label={`${project.title} demo`}
              >
                DEMO
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#555] hover:text-[#888] transition-colors duration-300 mt-0.5"
              aria-label={`${project.title} on GitHub`}
            >
              <Arrow />
            </a>
          </div>
        </div>
        <p className="text-[12px] text-[#606060] font-light leading-relaxed flex-1">
          {project.description}
        </p>
        <Tags tags={project.tags} />
      </div>
    </motion.div>
  );
}

// Compact card — for Security / AR / 3D / Browser tools
function CompactCard({ project, delay }: { project: Project; delay: number }) {
  return (
    <motion.div
      onMouseEnter={emitFieldPulse}
      className="border-b border-[#1a1a1a] py-5 flex flex-col gap-3"
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between gap-6">
        <h3 className="text-[13px] font-light text-[#c8c8c8]">{project.title}</h3>
        <div className="flex items-center gap-4 shrink-0">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono tracking-[0.18em] text-[#c8c8c8] border border-[#2c2c2c] px-1.5 py-0.5 hover:border-[#666] transition-colors duration-300"
              style={{ animation: "glitch-demo 2.2s infinite" }}
              aria-label={`${project.title} demo`}
            >
              DEMO
            </a>
          )}
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] hover:text-[#888] transition-colors duration-300"
            aria-label={`${project.title} on GitHub`}
          >
            <Arrow />
          </a>
        </div>
      </div>
      <p className="text-[12px] text-[#606060] font-light leading-relaxed">
        {project.description}
      </p>
      <Tags tags={project.tags} />
    </motion.div>
  );
}

// Section header with extending rule
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5 mb-8">
      <span className="text-[10px] tracking-[0.38em] uppercase text-[#606060] shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#1c1c1c]" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="work"
      className="py-28 md:py-36 px-8 md:px-16 lg:px-24 border-t border-[#1c1c1c]"
    >
      <motion.p
        ref={ref}
        className="text-[11px] tracking-[0.35em] uppercase text-[#888] mb-16"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        Work
      </motion.p>

      {/* ── Audio ── */}
      <div id="audio" className="mb-16 scroll-mt-24">
        <SectionHeader label="Audio" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {AUDIO.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={i * 0.07} />
          ))}
        </div>
      </div>

      {/* ── Video ── */}
      <div id="video" className="mb-16 scroll-mt-24">
        <SectionHeader label="Video" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {VIDEO.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={i * 0.07} />
          ))}
        </div>
      </div>

      {/* ── Security ── */}
      <div id="security" className="mb-16 scroll-mt-24">
        <SectionHeader label="Security" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {SECURITY.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={i * 0.07} />
          ))}
        </div>
      </div>

      {/* ── AR / Mobile ── */}
      <div id="ar-mobile" className="mb-16 scroll-mt-24">
        <SectionHeader label="AR / Mobile" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {AR_MOBILE.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={i * 0.07} />
          ))}
        </div>
      </div>

      {/* ── 3D ── */}
      <div id="threed" className="scroll-mt-24">
        <SectionHeader label="3D" />
        <div className="max-w-xl">
          {THREED.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}
