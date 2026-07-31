"use client";

import { ARSENIC_ORIGIN } from "@/lib/arsenic";
import { LabelFeature } from "./label-feature";

// labelLine: the "runs as its own label" sentence — off in the store, where
// the label framing is already the page.
export function ArsenicFeature({ labelLine = true }: { labelLine?: boolean }) {
  return (
    <LabelFeature
      eyebrow="The audio line"
      name="Arsenic"
      blurb={`Spectral processors, terminal instruments, and sample tools.${
        labelLine ? " The audio work runs as its own label." : ""
      }`}
      href={ARSENIC_ORIGIN}
      cta="VISIT ARSENIC ↗"
    />
  );
}
