import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { LocalAiVoiceoverLanding } from "@/components/store/pages/local-ai-voiceover";

export const metadata: Metadata = toolMetadata("local-ai-voiceover");

export default function LocalAiVoiceoverPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <LocalAiVoiceoverLanding />
      </main>
    </>
  );
}
