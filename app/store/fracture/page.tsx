import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { FractureLanding } from "@/components/store/pages/fracture";

export const metadata: Metadata = toolMetadata("fracture");

export default function FracturePage() {
  return (
    <>
      <Nav />
      <main>
        <FractureLanding />
      </main>
    </>
  );
}
