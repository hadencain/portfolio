"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { emitFieldPulse } from "./field-pulse";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Project {
  title: string;
  description: string;
  tags: string[];
  github: string;
  youtube?: string;
  demo?: string;
  // Destination override for the card's arrow. Public repos omit it and link
  // straight to GitHub. Private repos set it to an internal landing page (or
  // the GitHub profile) so nothing on the page links to a repo a visitor
  // can't open.
  href?: string;
  // Live sub-demos (suite entries like video-lab). Rendered as a LIVE-link
  // strip in the plate's readout bar when this entry is selected.
  demos?: { name: string; href: string }[];
  // Marked entries carry a blood tick in the row and become the plate's
  // default readout — the copy a scanning visitor reads without hovering.
  flagship?: boolean;
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
    href: "/store/tc-tools",
  },
  {
    title: "TCGS",
    description:
      "Terminal-controlled granular synthesizer. Full grain engine with playhead, FX chain, 4-LFO modulation matrix, polyphonic voices, and a live Textual TUI with waveform display and grain-field visualizer.",
    tags: ["Python", "numpy", "Textual"],
    github: "https://github.com/hadencain/TCGS",
    href: "/store/tc-tools",
  },
  {
    title: "TCDM",
    description:
      "Terminal-controlled drum machine. Sample-accurate step transport, per-step Elektron-style param locks, an 8-slot pattern bank with chaining, a full master FX chain (waveshaper/EQ/chorus/delay/reverb/limiter), and a live Textual TUI with a sweeping step-grid.",
    tags: ["Python", "numpy", "scipy", "Textual"],
    github: "https://github.com/hadencain/TCDM",
    href: "/store/tc-tools",
  },
  {
    title: "TCWS",
    description:
      "Terminal-controlled wavetable synthesizer. Morphing mipped wavetable engine with click-free position scanning, spectral morph mode, phase-warp stage, 64-slot mod matrix, unison stacking, and a live Textual TUI whose centerpiece is the frame waveform morphing under a position-scan cursor.",
    tags: ["Python", "numpy", "scipy", "Textual"],
    github: "https://github.com/hadencain/TCWS",
    href: "/store/tc-tools",
  },
  {
    title: "audioSort",
    description:
      "Audio sample organizer evolved from keyword matching into a weighted multi-signal classifier — path context, metadata, librosa spectral analysis, and an AST ML model.",
    tags: ["Python", "librosa", "HuggingFace"],
    github: "https://github.com/hadencain/audioSort",
    href: "/store/audio-sort",
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
    href: "/store/fracture",
  },
  {
    title: "spectralShuffler",
    description:
      "Spectral shuffler VST3. Captures FFT frames from a user-defined frequency band and randomly replays them — freeze, scatter, or smear specific frequency ranges in real time while the rest of the signal passes through unmodified.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/spectralShuffler",
    href: "/store/spectral-shuffler",
  },
  {
    title: "gravityWell",
    description:
      "Spectral black-hole VST3. Audio falls into a gravitational well below a configurable floor frequency — bins redshift (pitch lowers), energy pools into the sub-bass, and time dilates as mass accumulates. Decoherence thermalizes structured partials into rumble at full mass. Phase vocoder core with lock-free audio-to-UI spectrum bridge.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/gravityWell",
    href: "/store/gravity-well",
    flagship: true,
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
    href: "/store/white-hole",
  },
  {
    title: "corrode",
    description:
      "Seven-stage noise mangler VST3. Audio runs in series through granular, spectral, glitch, bitcrush, distortion, convolution, and pitch-smear stages — each with its own bypass, wet/dry, and feedback — all wrapped in a filtered global feedback loop so the chain feeds on its own artifacts. Three LFOs and a signal-following chaos engine (RMS + spectral centroid, with periodic bursts) route to almost any parameter through a runtime mod matrix. Amber-on-black monospace UI. Built to find the sound past the sound.",
    tags: ["C++", "JUCE"],
    github: "https://github.com/hadencain/corrode",
    flagship: true,
  },
  {
    title: "senses",
    description:
      "Modular AR audio-visual instruments for Android. Camera, motion, and generative audio as playable pieces.",
    tags: ["React Native", "Skia", "Web Audio"],
    github: "https://github.com/hadencain/senses",
    href: "/store/senses",
  },
  {
    title: "bleed",
    description:
      "Datamoshes broadcast video and reads the decoded melt back as sound — a channel-surfing noise-music generator. Two sonification lanes (scanline wavetable + spectral resynthesis) driven by the picture's own corruption, rendered to DAW stems through a CLI and a local queue-based web UI.",
    tags: ["Python", "FastAPI", "ffmpeg"],
    github: "https://github.com/hadencain/bleed",
    flagship: true,
  },
  {
    title: "video-lab",
    description:
      "Six browser instruments for taking video apart — temporal corruption (glitch), pixel contamination between two clips (osmosis), audio-reactive displacement (spectral), layered spectral compositing (palimpsest), Markov-chain resequencing (markov), and audio-driven melt (smear). All Canvas, all real-time, every one runs live in the browser.",
    tags: ["HTML5", "Canvas", "Web Audio"],
    github: "https://github.com/hadencain",
    flagship: true,
    demos: [
      { name: "glitch", href: "/tools/glitch/" },
      { name: "osmosis", href: "/tools/osmosis/" },
      { name: "spectral", href: "/tools/spectral/" },
      { name: "palimpsest", href: "/tools/palimpsest/" },
      { name: "markov", href: "/tools/markov/" },
      { name: "smear", href: "/tools/smear/" },
    ],
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
    flagship: true,
  },
  {
    title: "magpie",
    description:
      "Seller-centric OSINT for organized retail crime. Pulls listings from the eBay Browse API and Craigslist RSS, scores each on a confluence of fencing signals — sealed and bulk inventory, below-market pricing, new-account sellers, liquidation language — then rolls listings up into ranked sellers and maps where the goods move from. ToS-clean sources only, no scraping.",
    tags: ["Python", "Flask"],
    github: "https://github.com/hadencain/magpie",
    href: "https://github.com/hadencain",
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
    href: "https://github.com/hadencain",
  },
  {
    title: "indoorMaps",
    description:
      "Indoor mapping authoring and operator console. Draw venues on an IMDF data model, route with A* across floors and elevators, place cameras with occlusion-aware coverage and PTZ, and run incidents, patrols, and fixtures from the same map. Seven demo venues included.",
    tags: ["TypeScript", "React"],
    github: "https://github.com/hadencain/indoorMaps",
    flagship: true,
  },
];

// ─── Plates ───────────────────────────────────────────────────────────────────

const PLATES = [
  { id: "audio", plate: "01", label: "Audio/Video", projects: AUDIO },
  { id: "security", plate: "02", label: "Security", projects: SECURITY },
];

// Continuous catalog numbering — entry 001 through 035 across all plates.
const PLATE_OFFSETS = PLATES.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + PLATES[i - 1].projects.length);
  return acc;
}, []);

// ─── Shared UI ────────────────────────────────────────────────────────────────

// Entrance stagger reads for the first visible batch; past that a row should
// answer the scroll promptly, not serve out a queue position it inherited.
const stagger = (i: number) => Math.min(i * 0.05, 0.2);

// Touch devices have no cursor to sweep the list with, so the hover reveal
// would hide every description behind an unsignposted tap. There, the catalog
// renders open and static instead.
function useNoHover() {
  const [noHover, setNoHover] = useState(false);
  useEffect(() => {
    setNoHover(window.matchMedia("(hover: none)").matches);
  }, []);
  return noHover;
}

const Arrow = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path
      d="M1 11L11 1M11 1H2.5M11 1V9.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
    />
  </svg>
);

// The row's arrow link. External (GitHub) opens in a new tab; internal
// landing pages navigate in place via next/link.
function ProjectLink({
  project,
  className,
}: {
  project: Project;
  className: string;
}) {
  const href = project.href ?? project.github;
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${project.title} on GitHub`}
      >
        <Arrow />
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      aria-label={`${project.title} — details`}
    >
      <Arrow />
    </Link>
  );
}

// Catalog row — a bare index line: number, title, arrow. Hover or focus
// prints the entry into the plate's readout bar; the row itself never grows.
// On touch devices the description renders statically below the title.
function SpecimenRow({
  project,
  no,
  delay,
  noHover,
  onSelect,
}: {
  project: Project;
  no: number;
  delay: number;
  noHover: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      tabIndex={0}
      onMouseEnter={(e) => {
        onSelect();
        emitFieldPulse(e);
      }}
      onFocus={(e) => {
        onSelect();
        emitFieldPulse(e);
      }}
      className="group relative border-b border-paper/10 hover:border-paper/30 focus-within:border-paper/30 py-2.5 flex flex-col transition-colors duration-200"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-baseline gap-3.5">
        <span className="font-mono text-[9px] tracking-[0.2em] text-paper-mute group-hover:text-blood-bright group-focus-within:text-blood-bright transition-colors duration-200 shrink-0">
          {String(no).padStart(3, "0")}
        </span>
        <h3 className="font-mono text-[12px] tracking-[0.02em] text-paper-dim group-hover:text-paper group-focus-within:text-paper transition-colors duration-200">
          {project.title}
        </h3>
        {project.flagship && (
          <span
            className="text-blood-bright text-[8px] leading-none select-none"
            title="marked entry"
            aria-label="marked entry"
          >
            ▪
          </span>
        )}
        {/* Screen readers get the entry on the row itself; sighted desktop
            users read it in the readout bar. */}
        {!noHover && <span className="sr-only">{project.description}</span>}
        <div className="ml-auto flex items-center gap-3.5 shrink-0">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="relative font-mono text-[8.5px] tracking-[0.25em] text-blood-bright border border-blood-bright/50 px-1.5 py-0.5 hover:bg-blood hover:text-paper transition-colors duration-200 before:absolute before:-inset-2 before:content-['']"
              aria-label={`${project.title} demo`}
            >
              LIVE
            </a>
          )}
          <ProjectLink
            project={project}
            className="text-paper-mute hover:text-paper transition-colors duration-200 p-2 -m-2"
          />
        </div>
      </div>
      {noHover && (
        <>
          <p className="pt-1.5 text-[11.5px] leading-snug text-paper-mute max-w-[72ch]">
            {project.description}
          </p>
          <p className="pt-1 font-mono text-[8.5px] tracking-[0.22em] uppercase text-paper-mute/70">
            {project.tags.join(" · ")}
          </p>
          {project.demos && (
            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-1.5">
              {project.demos.map((d) => (
                <a
                  key={d.name}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/demo flex items-baseline gap-2.5 py-1 -my-1"
                >
                  <span className="font-mono text-[8px] tracking-[0.25em] text-blood-bright border border-blood-bright/50 px-1 py-px">
                    LIVE
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.02em] text-paper-mute">
                    {d.name}
                  </span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

// Readout bar — one fixed-height caption line per plate. Hovering any row in
// the plate types its entry out here; the reserved height means the print
// draws the eye without moving the grid below. Character count derives from
// elapsed time so it always finishes in TYPE_MS, even on dropped frames.
const TYPE_MS = 600;

function Readout({
  sel,
  tall,
}: {
  sel: { project: Project; no: number } | null;
  // Plates holding a demo suite reserve extra height for the LIVE-link strip,
  // so switching onto that entry never moves the grid.
  tall?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const [chars, setChars] = useState(0);
  const raf = useRef(0);
  const full = sel?.project.description ?? "";
  const title = sel?.project.title;
  const done = chars >= full.length;

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (!title) {
      setChars(0);
      return;
    }
    if (reduced) {
      setChars(full.length);
      return;
    }
    setChars(0);
    const t0 = performance.now();
    const tick = (now: number) => {
      const n = Math.min(
        full.length,
        Math.ceil(((now - t0) / TYPE_MS) * full.length)
      );
      setChars(n);
      if (n < full.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    // Backstop: if animation frames are suspended (occluded window, aggressive
    // battery throttling), land on the full text anyway.
    const settle = setTimeout(() => setChars(full.length), TYPE_MS + 200);
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(settle);
    };
    // Keyed on the tool, not the object — re-hovering the same row doesn't retype.
  }, [title, reduced, full.length]);

  return (
    <div className={`mb-5 min-h-[88px] ${tall ? "xl:min-h-[88px]" : "xl:min-h-[64px]"}`}>
      {sel ? (
        <>
          <p className="text-[11.5px] leading-snug text-paper-mute">
            <span className="font-mono text-[9px] tracking-[0.2em] text-blood-bright mr-3">
              {String(sel.no).padStart(3, "0")}
            </span>
            {full.slice(0, chars)}
            {!done && (
              <span className="text-blood-bright" aria-hidden>
                ▌
              </span>
            )}
            <span
              className={`font-mono text-[8.5px] tracking-[0.22em] uppercase text-paper-mute/60 ml-3 whitespace-nowrap transition-opacity duration-300 ${
                done ? "opacity-100" : "opacity-0"
              }`}
            >
              {sel.project.tags.join(" · ")}
            </span>
          </p>
          {/* Suite entries surface their live demos here, immediately — the
              bar holds its selection after the pointer leaves, so these stay
              clickable while the cursor travels up to them. */}
          {sel.project.demos && (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
              {sel.project.demos.map((d) => (
                <a
                  key={d.name}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/demo flex items-baseline gap-2.5 py-1 -my-1"
                >
                  <span className="font-mono text-[8px] tracking-[0.25em] text-blood-bright border border-blood-bright/50 px-1 py-px group-hover/demo:bg-blood group-hover/demo:text-paper transition-colors duration-200">
                    LIVE
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.02em] text-paper-mute group-hover/demo:text-paper transition-colors duration-200">
                    {d.name}
                  </span>
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-[11.5px] leading-snug text-paper-mute/35 select-none">
          —
        </p>
      )}
    </div>
  );
}

// Plate header — small display label, hairline, count. Nothing extra.
function PlateHeader({
  plate,
  label,
  count,
}: {
  plate: string;
  label: string;
  count: number;
}) {
  return (
    <div className="mb-6 flex items-baseline gap-5">
      <span className="font-mono text-[9px] tracking-[0.2em] text-paper-mute shrink-0">
        {plate}
      </span>
      <h2 className="doto text-paper text-[clamp(1.3rem,2.6vw,2rem)] leading-none select-none shrink-0">
        {label}
      </h2>
      <motion.div
        className="flex-1 h-px bg-paper/15 origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="font-mono text-[9px] tracking-[0.25em] text-paper-mute shrink-0">
        ×{String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Projects() {
  const noHover = useNoHover();
  // Last-touched row per plate — each readout keeps holding its entry after
  // the pointer moves on, so the bars never flicker back to empty. Each bar
  // opens on its plate's marked entry, so a visitor who never hovers still
  // reads real copy instead of an em dash.
  const [selByPlate, setSelByPlate] = useState<
    Record<string, { project: Project; no: number }>
  >(() => {
    const init: Record<string, { project: Project; no: number }> = {};
    PLATES.forEach((plate, pi) => {
      const fi = plate.projects.findIndex((p) => p.flagship);
      const i = fi >= 0 ? fi : 0;
      init[plate.id] = {
        project: plate.projects[i],
        no: PLATE_OFFSETS[pi] + i + 1,
      };
    });
    return init;
  });

  return (
    <section
      id="work"
      className="relative border-t border-paper/10 px-8 md:px-16 lg:px-24 py-20 md:py-24"
    >
      <p className="smallcaps text-[13px] tracking-[0.3em] text-paper-mute mb-14">
        Work
      </p>

      {PLATES.map((plate, pi) => (
        <div
          key={plate.id}
          id={plate.id}
          className={`scroll-mt-24 ${pi < PLATES.length - 1 ? "mb-16" : ""}`}
        >
          <PlateHeader
            plate={plate.plate}
            label={plate.label}
            count={plate.projects.length}
          />
          {!noHover && (
            <Readout
              sel={selByPlate[plate.id] ?? null}
              tall={plate.projects.some((p) => p.demos)}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12">
            {plate.projects.map((p, i) => (
              <SpecimenRow
                key={p.title}
                project={p}
                no={PLATE_OFFSETS[pi] + i + 1}
                delay={stagger(i)}
                noHover={noHover}
                onSelect={() =>
                  setSelByPlate((s) => ({
                    ...s,
                    [plate.id]: {
                      project: p,
                      no: PLATE_OFFSETS[pi] + i + 1,
                    },
                  }))
                }
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
