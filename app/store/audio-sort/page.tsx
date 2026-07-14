import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { AudioSortLanding } from "@/components/store/pages/audio-sort";

export const metadata: Metadata = toolMetadata("audio-sort");

export default function AudioSortPage() {
  return (
    <>
      <Nav />
      <main>
        <AudioSortLanding />
      </main>
    </>
  );
}
