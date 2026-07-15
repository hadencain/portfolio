import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { VideoLabLanding } from "@/components/store/pages/video-lab";

export const metadata: Metadata = toolMetadata("video-lab");

export default function VideoLabPage() {
  return (
    <>
      <Nav />
      <main>
        <VideoLabLanding />
      </main>
    </>
  );
}
