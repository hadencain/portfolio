import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { VoxLanding } from "@/components/store/pages/vox";

export const metadata: Metadata = toolMetadata("vox");

export default function VoxPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <VoxLanding />
      </main>
    </>
  );
}
