import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { TcToolsLanding } from "@/components/store/pages/tc-tools";

export const metadata: Metadata = toolMetadata("tc-tools");

export default function TcToolsPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <TcToolsLanding />
      </main>
    </>
  );
}
