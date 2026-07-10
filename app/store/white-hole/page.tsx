import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { WhiteHoleLanding } from "@/components/store/pages/white-hole";

export const metadata: Metadata = toolMetadata("white-hole");

export default function WhiteHolePage() {
  return (
    <>
      <ContourField />
      <Nav />
      <main>
        <WhiteHoleLanding />
      </main>
    </>
  );
}
