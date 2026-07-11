"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { emitFieldPulse } from "./field-pulse";

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
    title: "TCDM",
    description:
      "Terminal-controlled drum machine. Sample-accurate step transport, per-step Elektron-style param locks, an 8-slot pattern bank with chaining, a full master FX chain (waveshaper/EQ/chorus/delay/reverb/limiter), and a live Textual TUI with a sweeping step-grid.",
    tags: ["Python", "numpy", "scipy", "Textual"],
    github: "https://github.com/hadencain/TCDM",
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
      "Granular reverb VST3. A feedback delay network tail feeds a live ring buffer; a grain engine re-scatters it across the stereo field for disintegrating, crystalline decays. Live visualization in three switchable modes — tail field, decay scope, glass shards — driven by a lock-free telemetry bus from the audio thread.",
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
  {
    title: "phaseMangler",
    description:
      "Spectral phase scrambler VST3. Three independent frequency bands each apply stochastic per-bin phase offsets via overlap-add FFT — magnitudes are preserved, waveforms are destroyed. From transparent bypass to full dissolution.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/phaseMangler",
  },
  {
    title: "smear",
    description:
      "Spectral blur VST3. Per-bin magnitudes smear through a leaky integrator while a single phase-coherence axis sweeps from intact pitch to a Paulstretch-style wash — freeze latches the spectrum and holds it indefinitely. A two-layer radial display draws the live input as a ghost under the processed spectrum, so every control reads as visible cause and effect.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/smear",
  },
  {
    title: "whiteHole",
    description:
      "Anti-mass spectral leveler VST3 — the black hole's phase-preserving opposite. A repulsion field hinged at a floor level lifts buried content into audibility and flattens peaks down toward it, per bin, each bin's gain smoothed by its own follower. At full repulsion and thin the spectrum flattens into the floor band; the radial display draws the dead zone as an annulus that spoke tips converge onto.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/whiteHole",
  },
  {
    title: "corrode",
    description:
      "Seven-stage noise mangler VST3. Audio runs in series through granular, spectral, glitch, bitcrush, distortion, convolution, and pitch-smear stages — each with its own bypass, wet/dry, and feedback — all wrapped in a filtered global feedback loop so the chain feeds on its own artifacts. Three LFOs and a signal-following chaos engine (RMS + spectral centroid, with periodic bursts) route to almost any parameter through a runtime mod matrix. Amber-on-black monospace UI. Built to find the sound past the sound.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/corrode",
  },
];

const VIDEO: Project[] = [
  {
    title: "bleed",
    description:
      "Datamoshes broadcast video and reads the decoded melt back as sound — a channel-surfing noise-music generator. Two sonification lanes (scanline wavetable + spectral resynthesis) driven by the picture's own corruption, rendered to DAW stems through a CLI and a local queue-based web UI.",
    tags: ["Python", "FastAPI", "ffmpeg"],
    github: "https://github.com/hadencain/bleed",
  },
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
      "Scans source files for accidentally committed secrets — API keys, private keys, AWS credentials, passwords, and connection strings. Named regex patterns plus optional entropy-based detection. Git pre-commit hook blocks commits before exposure. git-history.py scans the full commit history for secrets introduced and later removed — splits output into still-in-HEAD (rotate now) vs removed-from-HEAD (treat as exposed if repo is public).",
    tags: ["Python"],
    github: "https://github.com/hadencain/secret-scanner",
  },
  {
    title: "dependency-risk-scan",
    description:
      "CLI tool that audits Python dependencies for outdated packages, abandoned libraries, and known CVEs — from a local requirements.txt or any GitHub repo URL. --graph exports a self-contained D3 force graph of the full transitive dependency tree, risk-colored per node (red=CVE, yellow=outdated, gray=abandoned).",
    tags: ["Python"],
    github: "https://github.com/hadencain/dependency-risk-scan",
  },
  {
    title: "dns-request-logger",
    description:
      "Live TUI that monitors DNS lookups on Windows, grouped by domain with frequency counts. Flags high-entropy hostnames (DGA detection), uncommon or abused TLDs, deep subdomain chains, and first-seen domains.",
    tags: ["Python"],
    github: "https://github.com/hadencain/dns-request-logger",
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
    title: "cairn",
    description:
      "OSINT infrastructure pivot tool. Given a domain or IP, correlates across WHOIS, DNS, certificate transparency, passive DNS, ASN ownership, reverse IP, and HTTP fingerprint to map infrastructure relationships. Flags new domains, bulletproof hosting, and CDN-diluted edges. Exports JSON and a self-contained D3 force graph.",
    tags: ["Python"],
    github: "https://github.com/hadencain/cairn",
  },
  {
    title: "magpie",
    description:
      "Seller-centric OSINT for organized retail crime. Pulls listings from the eBay Browse API and Craigslist RSS, scores each on a confluence of fencing signals — sealed and bulk inventory, below-market pricing, new-account sellers, liquidation language — then rolls listings up into ranked sellers and maps where the goods move from. ToS-clean sources only, no scraping.",
    tags: ["Python", "Flask"],
    github: "https://github.com/hadencain/magpie",
  },
  {
    title: "installSandbox",
    description:
      "Behavioral install-time sandbox for pip and npm. Detonates a package install inside a disposable WSL2 guest, watches what it actually does — DNS, network egress, file writes, shell spawns — and returns an allow/block verdict plus a diff of everything that changed. The dynamic complement to dependency-risk-scan's static pre-check: catches clean-looking packages whose setup.py or postinstall phones home, drops persistence, or opens a port the moment you install.",
    tags: ["Python", "WSL2", "strace"],
    github: "https://github.com/hadencain/installSandbox",
  },
  {
    title: "repoAuditor",
    description:
      "Pre-publish gate. Point it at a local git repo and it emits a single SAFE/UNSAFE verdict (exit 0/1) plus a report before you flip a repo public. Scans full git history for secrets — not just HEAD — plus committed credential files, high-entropy strings, PII (Windows user paths, author emails), oversized binaries, and a missing LICENSE. Stdlib only, no runtime deps.",
    tags: ["Python"],
    github: "https://github.com/hadencain/repoAuditor",
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
    title: "3d-print-asset-manager",
    description:
      "Desktop catalog for 3D-print files. Indexes a folder of STL/OBJ/3MF and G-code in place — never moving them — extracting dimensions, volume, and version/assembly relationships, rendering a real isometric 3D thumbnail of each mesh into a searchable, filterable grid. G-code shows measured print time and filament weight from the slicer header; STLs show an estimate, badged distinctly. Geometry-hash duplicate detection, recoverable delete to the recycle bin, and persistent failure-history tags. Layered parser → store → UI so the file logic runs headless.",
    tags: ["Python", "PyQt6", "trimesh", "SQLite"],
    github: "https://github.com/hadencain/3d-print-asset-manager",
  },
  {
    title: "openlock-terrain-gen",
    description:
      "Browser-based OpenLOCK dungeon tile generator. Configurable piece types (straight, corner, T, cross, doorway, window, curved, column, staircase), six surface themes with parametric detail, and batch STL export — powered by manifold-3d WASM CSG for watertight boolean geometry.",
    tags: ["TypeScript", "React", "WebGL", "WASM"],
    github: "https://github.com/hadencain/openlock-terrain-gen",
  },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

// Entrance stagger reads for the first visible batch; past that a card should
// answer the scroll promptly, not serve out a queue position it inherited.
const stagger = (i: number) => Math.min(i * 0.07, 0.28);

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
          className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#787878] border border-[#2c2c2c] px-2 py-[3px]"
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
      onFocus={emitFieldPulse}
      className="border border-[#1e1e1e] hover:border-[#2c2c2c] transition-colors duration-500 flex flex-col"
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
          loading="lazy"
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
                className="text-[10px] font-mono tracking-[0.22em] text-[#e0e0e0] underline underline-offset-2 decoration-[#383838] hover:decoration-[#888] transition-colors duration-300 py-2 -my-2"
                aria-label={`${project.title} demo`}
              >
                DEMO
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#555] hover:text-[#888] transition-colors duration-300 p-2 -m-2 -mt-1.5"
              aria-label={`${project.title} on GitHub`}
            >
              <Arrow />
            </a>
          </div>
        </div>
        <p className="text-[12px] text-[#787878] font-light leading-relaxed flex-1 max-w-[78ch]">
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
      onFocus={emitFieldPulse}
      className="border-b border-[#1a1a1a] hover:border-[#2c2c2c] transition-colors duration-500 py-5 flex flex-col gap-3"
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
              className="relative text-[10px] font-mono tracking-[0.22em] text-[#c8c8c8] border border-[#343434] px-1.5 py-0.5 hover:border-[#666] transition-colors duration-300 before:absolute before:-inset-2 before:content-['']"
              aria-label={`${project.title} demo`}
            >
              DEMO
            </a>
          )}
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] hover:text-[#888] transition-colors duration-300 p-2 -m-2"
            aria-label={`${project.title} on GitHub`}
          >
            <Arrow />
          </a>
        </div>
      </div>
      <p className="text-[12px] text-[#787878] font-light leading-relaxed max-w-[78ch]">
        {project.description}
      </p>
      <Tags tags={project.tags} />
    </motion.div>
  );
}

// Section header with extending rule — the rule plots itself out from the
// label on first view; reduced-motion renders it settled.
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5 mb-8">
      <span className="text-[10px] tracking-[0.35em] uppercase text-[#606060] shrink-0">
        {label}
      </span>
      <motion.div
        className="flex-1 h-px bg-[#1c1c1c] origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
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
            <CompactCard key={p.title} project={p} delay={stagger(i)} />
          ))}
        </div>
      </div>

      {/* ── Video ── */}
      <div id="video" className="mb-16 scroll-mt-24">
        <SectionHeader label="Video" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {VIDEO.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={stagger(i)} />
          ))}
        </div>
      </div>

      {/* ── Security ── */}
      <div id="security" className="mb-16 scroll-mt-24">
        <SectionHeader label="Security" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {SECURITY.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={stagger(i)} />
          ))}
        </div>
      </div>

      {/* ── AR / Mobile ── */}
      <div id="ar-mobile" className="mb-16 scroll-mt-24">
        <SectionHeader label="AR / Mobile" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {AR_MOBILE.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={stagger(i)} />
          ))}
        </div>
      </div>

      {/* ── 3D ── */}
      <div id="threed" className="scroll-mt-24">
        <SectionHeader label="3D" />
        <div className="max-w-xl">
          {THREED.map((p, i) => (
            <CompactCard key={p.title} project={p} delay={stagger(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
