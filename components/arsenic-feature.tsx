"use client";

import { ARSENIC_ORIGIN } from "@/lib/arsenic";
import { LabelFeature } from "./label-feature";

export function ArsenicFeature({ className }: { className?: string }) {
  return (
    <LabelFeature
      className={className}
      eyebrow="Audio tools"
      name="Arsenic"
      blurb="Spectral processors, terminal instruments, and sample tools."
      href={ARSENIC_ORIGIN}
      cta="VISIT ARSENIC ↗"
    />
  );
}
