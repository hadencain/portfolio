import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { AudioSortLanding } from "@/components/store/pages/audio-sort";

export const metadata: Metadata = toolMetadata("audio-sort");

export default function AudioSortPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <AudioSortLanding />
      </main>
    </>
  );
}
