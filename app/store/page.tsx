import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { StoreSection } from "@/components/store/store-section";

export const metadata: Metadata = {
  title: "Store — Haden Cain",
  description:
    "Experimental audio tools. Pay what you want. Source on GitHub.",
};

export default function Store() {
  return (
    <>
      <ContourField />
      <Nav />
      <main>
        <StoreSection />
      </main>
    </>
  );
}
