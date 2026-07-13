import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { SensesLanding } from "@/components/store/pages/senses";

export const metadata: Metadata = toolMetadata("senses");

export default function SensesPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <SensesLanding />
      </main>
    </>
  );
}
