"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const projects = [
  {
    title: "granular-synthesizer",
    description:
      "Granular synthesis engine built as a VST3 plugin. Full grain control, LFO modulation matrix, and real-time waveform display.",
    tags: ["C++", "JUCE", "DSP", "VST3"],
    github: "https://github.com/hadencain/granular-synthesizer",
    youtube: null,
  },
  {
    title: "vessel",
    description:
      "Android AR instrument. Import a video, locate the artifact in your physical environment, and perform with it through space.",
    tags: ["Kotlin", "ARCore", "MediaPipe", "AAudio"],
    github: "https://github.com/hadencain/vessel",
    youtube: null,
  },
  {
    title: "glitch",
    description:
      "Browser-based video manipulation. Temporal corruption algorithms applied to uploaded video in real-time through Canvas.",
    tags: ["HTML5", "Canvas", "JavaScript"],
    github: "https://github.com/hadencain/glitch",
    youtube: null,
  },
  {
    title: "osmosis",
    description:
      "Pixel contamination between two videos. Bleed, bleed rate, and blend controls applied frame by frame in the browser.",
    tags: ["HTML5", "Canvas", "JavaScript"],
    github: "https://github.com/hadencain/osmosis",
    youtube: null,
  },
  {
    title: "TCBBP",
    description:
      "Terminal-controlled beat-based probability system. Stochastic sequencing driven entirely from the command line.",
    tags: ["ChucK", "Music", "Probability"],
    github: "https://github.com/hadencain/TCBBP",
    youtube: null,
  },
  {
    title: "RGBA_blending",
    description:
      "Alpha-blend two files to generate cover art or video output. Max for Live patch for generative visual composition.",
    tags: ["Max/MSP", "Generative", "Video"],
    github: "https://github.com/hadencain/RGBA_blending",
    youtube: null,
  },
  {
    title: "audioSort",
    description:
      "Audio sample organizer. Evolved from keyword filename matching into a weighted multi-signal classifier — path context, metadata, librosa spectral analysis, and an AST ML model via HuggingFace.",
    tags: ["Python", "ML", "Audio", "CLI"],
    github: "https://github.com/hadencain/audioSort",
    youtube: null,
  },
  {
    title: "tunedown-theory",
    description:
      "Interactive scale and theory practice tool for guitar and keyboard. Fretboard and keyboard visualization with selectable scales, modes, and chord highlighting.",
    tags: ["TypeScript", "React", "Music Theory"],
    github: "https://github.com/hadencain/tunedown-theory",
    youtube: null,
  },
  {
    title: "dependency-risk-scan",
    description:
      "CLI tool that audits Python dependencies for outdated packages, abandoned libraries, and known CVEs — from a local requirements.txt or any GitHub repo URL.",
    tags: ["Python", "Security", "CLI"],
    github: "https://github.com/hadencain/dependency-risk-scan",
    youtube: null,
  },
  {
    title: "secret-scanner",
    description:
      "Scans source files for accidentally committed secrets — API keys, private keys, AWS credentials, passwords, and connection strings. Named regex patterns plus optional entropy-based detection. Git pre-commit hook blocks commits before exposure.",
    tags: ["Python", "Security", "CLI", "Git"],
    github: "https://github.com/hadencain/secret-scanner",
    youtube: null,
  },
  {
    title: "capabilityaccessmanager-monitor",
    description:
      "Monitors and auto-remediates the Windows 11 camsvc WAL runaway write bug — a system process that silently fills drives. Electron tray app with alerting and one-click remediation.",
    tags: ["Electron", "JavaScript", "Windows", "Security"],
    github: "https://github.com/hadencain/capabilityaccessmanager_monitor",
    youtube: null,
  },
  {
    title: "mlb-ev-analysis",
    description:
      "Model-generated win probabilities compared against sportsbook lines. Baseball analytics with edge detection.",
    tags: ["Python", "Analytics", "Data"],
    github: "https://github.com/hadencain/mlb-ev-analysis",
    youtube: null,
  },
  {
    title: "harmonic-filter-sequencer",
    description:
      "Bandpass filter applied to the harmonics of incoming audio. Max for Live patch for spectral rhythm processing.",
    tags: ["Max/MSP", "DSP", "Music"],
    github: "https://github.com/hadencain/harmonic-filter-sequencer",
    youtube: null,
  },
];

export function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="work"
      className="py-28 md:py-36 px-8 md:px-16 lg:px-24 border-t border-[#1c1c1c]"
    >
      <div ref={ref}>
        <motion.p
          className="text-[11px] tracking-[0.35em] uppercase text-[#888888] mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          Work
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              className="border border-[#1c1c1c] flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.9,
                delay: i * 0.08 + 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {project.youtube ? (
                <iframe
                  className="aspect-video w-full border-b border-[#1c1c1c] mb-6"
                  src={project.youtube}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="aspect-video w-full bg-[#0e0e0e] border-b border-[#1c1c1c] mb-6" />
              )}

              <div className="flex items-start justify-between mb-5 px-6 pb-0 pt-0">
                <h3 className="text-sm font-light text-[#d0d0d0] leading-tight">
                  {project.title}
                </h3>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#444] hover:text-[#787878] transition-colors duration-300 ml-4 mt-0.5 shrink-0"
                  aria-label={`${project.title} on GitHub`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M1 11L11 1M11 1H2.5M11 1V9.5"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="square"
                    />
                  </svg>
                </a>
              </div>

              <p className="text-[13px] text-[#909090] font-light leading-relaxed flex-1 mb-6 px-6">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-3 px-6 pb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] tracking-[0.2em] text-[#484848] uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
