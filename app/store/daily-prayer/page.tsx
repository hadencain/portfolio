import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { DailyPrayerLanding } from "@/components/store/pages/daily-prayer";

export const metadata: Metadata = toolMetadata("daily-prayer");

export default function DailyPrayerPage() {
  return (
    <>
      <Nav />
      <main>
        <DailyPrayerLanding />
      </main>
    </>
  );
}
