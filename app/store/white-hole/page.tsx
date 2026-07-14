import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { WhiteHoleLanding } from "@/components/store/pages/white-hole";

export const metadata: Metadata = toolMetadata("white-hole");

export default function WhiteHolePage() {
  return (
    <>
      <Nav />
      <main>
        <WhiteHoleLanding />
      </main>
    </>
  );
}
