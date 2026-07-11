import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { SmearLanding } from "@/components/store/pages/smear";

export const metadata: Metadata = toolMetadata("smear");

export default function SmearPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <SmearLanding />
      </main>
    </>
  );
}
