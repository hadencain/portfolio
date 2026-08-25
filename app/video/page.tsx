import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";

const description =
  "Video instruments — datamosh sonification, browser glitch tools with live demos, and an AR camera app.";

export const metadata: Metadata = {
  title: "Video — Haden Cain",
  description,
  openGraph: {
    title: "Video — Haden Cain",
    description,
    type: "website",
  },
};

export default function VideoPage() {
  return (
    <>
      <Nav />
      <main>
        <Projects only="video" />
      </main>
    </>
  );
}
