import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { SampleViewerLanding } from "@/components/store/pages/sample-viewer";

export const metadata: Metadata = toolMetadata("sample-viewer");

export default function SampleViewerPage() {
  return (
    <>
      <ContourField />
      <Nav />
      <main>
        <SampleViewerLanding />
      </main>
    </>
  );
}
