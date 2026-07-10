import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { GravityWellLanding } from "@/components/store/pages/gravity-well";

export const metadata: Metadata = toolMetadata("gravity-well");

export default function GravityWellPage() {
  return (
    <>
      <ContourField />
      <Nav />
      <main>
        <GravityWellLanding />
      </main>
    </>
  );
}
