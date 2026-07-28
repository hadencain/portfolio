import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { JuniperLanding } from "@/components/store/pages/juniper";

export const metadata: Metadata = toolMetadata("juniper");

export default function JuniperPage() {
  return (
    <>
      <Nav />
      <main>
        <JuniperLanding />
      </main>
    </>
  );
}
