import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { AssayLanding } from "@/components/store/pages/assay";

export const metadata: Metadata = toolMetadata("assay");

export default function AssayPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <AssayLanding />
      </main>
    </>
  );
}
