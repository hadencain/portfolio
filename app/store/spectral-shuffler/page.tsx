import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { SpectralShufflerLanding } from "@/components/store/pages/spectral-shuffler";

export const metadata: Metadata = toolMetadata("spectral-shuffler");

export default function SpectralShufflerPage() {
  return (
    <>
      <Nav />
      <main>
        <SpectralShufflerLanding />
      </main>
    </>
  );
}
