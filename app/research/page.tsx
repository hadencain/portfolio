import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ResearchSection } from "@/components/research/research-section";

export const metadata: Metadata = {
  title: "Research — Haden Cain",
  description:
    "Statistical investigations of public datasets. Independently verified findings, false-discovery corrected.",
  openGraph: {
    title: "Research — Haden Cain",
    description:
      "Statistical investigations of public datasets. Independently verified findings, false-discovery corrected.",
    type: "website",
  },
};

export default function Research() {
  return (
    <>
      <Nav />
      <main>
        <ResearchSection />
      </main>
    </>
  );
}
