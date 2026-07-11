import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { PokerCoachLanding } from "@/components/store/pages/poker-coach";

export const metadata: Metadata = toolMetadata("poker-coach");

export default function PokerCoachPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <PokerCoachLanding />
      </main>
    </>
  );
}
