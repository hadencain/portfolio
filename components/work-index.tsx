"use client";

import { ArsenicFeature } from "./arsenic-feature";
import { LabelFeature } from "./label-feature";
import { MOBILE_ORIGIN } from "@/lib/mobile";

// The homepage work section: one feature block per line, equal weight —
// two catalog pages on this site, two satellite sites. The full catalogs
// live on their pages; this is the index. -mt-px overlaps adjoining
// hairlines so the stack reads as one ruled block.
export function WorkIndex() {
  return (
    <section
      id="work"
      className="relative border-t border-paper/10 px-8 md:px-16 lg:px-24 py-20 md:py-24"
    >
      <p className="smallcaps text-[13px] tracking-[0.3em] text-paper-mute mb-14">
        Work
      </p>
      <div className="max-w-3xl">
        <LabelFeature
          eyebrow="Tooling & OSINT"
          name="Security"
          blurb="OSINT pivot mapping, install-time sandboxing, DNS and port monitoring, pre-publish gates — ten Windows-first tools."
          href="/security"
          cta="BROWSE SECURITY →"
        />
        <LabelFeature
          className="-mt-px"
          eyebrow="Instruments & experiments"
          name="Video"
          blurb="Datamosh sonification, browser glitch instruments, and an AR camera app — eight pieces, six playable live."
          href="/video"
          cta="BROWSE VIDEO →"
        />
        <ArsenicFeature className="-mt-px" />
        <LabelFeature
          className="-mt-px"
          eyebrow="Android apps"
          name="mobile"
          blurb="AR instruments, flashcards, on-device dictation, and a voice assistant — all local-first."
          href={MOBILE_ORIGIN}
          cta="VISIT MOBILE ↗"
        />
      </div>
    </section>
  );
}
