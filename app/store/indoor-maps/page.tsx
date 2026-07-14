import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { IndoorMapsLanding } from "@/components/store/pages/indoor-maps";

export const metadata: Metadata = toolMetadata("indoor-maps");

export default function IndoorMapsPage() {
  return (
    <>
      <Nav />
      <main>
        <IndoorMapsLanding />
      </main>
    </>
  );
}
