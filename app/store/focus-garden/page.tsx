import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { FocusGardenLanding } from "@/components/store/pages/focus-garden";

export const metadata: Metadata = toolMetadata("focus-garden");

export default function FocusGardenPage() {
  return (
    <>
      <Nav />
      <main>
        <FocusGardenLanding />
      </main>
    </>
  );
}
