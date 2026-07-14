import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { SmearLanding } from "@/components/store/pages/smear";

export const metadata: Metadata = toolMetadata("smear");

export default function SmearPage() {
  return (
    <>
      <Nav />
      <main>
        <SmearLanding />
      </main>
    </>
  );
}
