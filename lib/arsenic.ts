// Arsenic is no longer shown on the portfolio (removed 2026-11-09). This file
// only feeds the legacy /store/<audio-slug> redirects in next.config.ts, so
// old shared links still resolve.
export const ARSENIC_ORIGIN = "https://arsenic-pi.vercel.app";

export const AUDIO_SLUGS = [
  "smear",
  "gravity-well",
  "white-hole",
  "fracture",
  "spectral-shuffler",
  "tc-tools",
  "sample-viewer",
  "audio-sort",
] as const;
