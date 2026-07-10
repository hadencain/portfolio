// Single source of truth for /store. Data lives in registry-data.json so the
// prebuild drift check (scripts/check-store-registry.mjs) can read it without
// a TS loader. This module is data-only: it must never import components.

import data from "./registry-data.json";

export type NicheId =
  | "audio"
  | "local-ai"
  | "data"
  | "spatial"
  | "training"
  | "desktop";

// "retired" is reserved (spec: declined for v1) — the type admits it so the
// day it matters is a data change, not a type change.
export type ToolStatus = "page" | "listed" | "retired";

export interface Niche {
  id: NicheId;
  label: string;
}

export interface Tool {
  slug: string;
  title: string;
  niche: NicheId;
  pitch: string;      // one sentence; hub row + OG description
  audience: string;   // "who it's for" line, in the audience's vocabulary
  tag: string;        // Buttondown tag; always === slug (survives slug renames)
  status: ToolStatus;
  screenshot?: string; // /public path for the landing page media slot
  ogImage?: string;    // /public path; absent → site default OG
  capturePrompt: string;
  captureCta: string;
}

// Buttondown username. Empty string = every capture form renders disabled
// with a "soon" hint; the site deploys before the account exists.
export const BUTTONDOWN_USERNAME = "";

export const NICHES = data.niches as Niche[];
export const TOOLS = data.tools as unknown as Tool[];

export function toolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
