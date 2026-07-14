import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { StoreHub } from "@/components/store/store-hub";

export const metadata: Metadata = {
  title: "Tools — Haden Cain",
  description:
    "Small software for specific people — audio, local-first AI, data, spatial, training, desktop tools.",
  openGraph: {
    title: "Tools — Haden Cain",
    description:
      "Small software for specific people — audio, local-first AI, data, spatial, training, desktop tools.",
    type: "website",
  },
};

export default function Store() {
  return (
    <>
      <Nav />
      <main>
        <StoreHub />
      </main>
    </>
  );
}
