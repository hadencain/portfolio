import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { SampleViewerLanding } from "@/components/store/pages/sample-viewer";

export const metadata: Metadata = toolMetadata("sample-viewer");

export default function SampleViewerPage() {
  return (
    <>
      <Nav />
      <main>
        <SampleViewerLanding />
      </main>
    </>
  );
}
