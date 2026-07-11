import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { DailyPrayerLanding } from "@/components/store/pages/daily-prayer";

export const metadata: Metadata = toolMetadata("daily-prayer");

export default function DailyPrayerPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <DailyPrayerLanding />
      </main>
    </>
  );
}
