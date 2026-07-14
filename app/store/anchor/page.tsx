import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { AnchorLanding } from "@/components/store/pages/anchor";

export const metadata: Metadata = toolMetadata("anchor");

export default function AnchorPage() {
  return (
    <>
      <Nav />
      <main>
        <AnchorLanding />
      </main>
    </>
  );
}
