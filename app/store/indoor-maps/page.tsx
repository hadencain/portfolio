import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { IndoorMapsLanding } from "@/components/store/pages/indoor-maps";

export const metadata: Metadata = toolMetadata("indoor-maps");

export default function IndoorMapsPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <IndoorMapsLanding />
      </main>
    </>
  );
}
