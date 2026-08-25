import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";

const description =
  "Security tooling and OSINT — pivot mapping, install-time sandboxing, DNS and port monitoring, pre-publish gates.";

export const metadata: Metadata = {
  title: "Security — Haden Cain",
  description,
  openGraph: {
    title: "Security — Haden Cain",
    description,
    type: "website",
  },
};

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main>
        <Projects only="security" />
      </main>
    </>
  );
}
