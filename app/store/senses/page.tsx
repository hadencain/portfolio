import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { SensesLanding } from "@/components/store/pages/senses";

export const metadata: Metadata = toolMetadata("senses");

export default function SensesPage() {
  return (
    <>
      <Nav />
      <main>
        <SensesLanding />
      </main>
    </>
  );
}
