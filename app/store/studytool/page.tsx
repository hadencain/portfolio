import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { StudytoolLanding } from "@/components/store/pages/studytool";

export const metadata: Metadata = toolMetadata("studytool");

export default function StudytoolPage() {
  return (
    <>
      <Nav />
      <main>
        <StudytoolLanding />
      </main>
    </>
  );
}
