import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { VoxAndroidLanding } from "@/components/store/pages/vox-android";

export const metadata: Metadata = toolMetadata("vox-android");

export default function VoxAndroidPage() {
  return (
    <>
      <Nav />
      <main>
        <VoxAndroidLanding />
      </main>
    </>
  );
}
