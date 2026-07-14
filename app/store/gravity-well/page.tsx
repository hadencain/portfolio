import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { GravityWellLanding } from "@/components/store/pages/gravity-well";

export const metadata: Metadata = toolMetadata("gravity-well");

export default function GravityWellPage() {
  return (
    <>
      <Nav />
      <main>
        <GravityWellLanding />
      </main>
    </>
  );
}
