import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { SpectralShufflerLanding } from "@/components/store/pages/spectral-shuffler";

export const metadata: Metadata = toolMetadata("spectral-shuffler");

export default function SpectralShufflerPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <SpectralShufflerLanding />
      </main>
    </>
  );
}
