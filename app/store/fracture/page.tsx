import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { FractureLanding } from "@/components/store/pages/fracture";

export const metadata: Metadata = toolMetadata("fracture");

export default function FracturePage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <FractureLanding />
      </main>
    </>
  );
}
