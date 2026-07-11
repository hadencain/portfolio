import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { PomodoroLanding } from "@/components/store/pages/pomodoro";

export const metadata: Metadata = toolMetadata("pomodoro");

export default function PomodoroPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <PomodoroLanding />
      </main>
    </>
  );
}
