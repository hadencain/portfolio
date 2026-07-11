import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { toolMetadata } from "@/lib/store-metadata";
import { ClaudeDispatchLanding } from "@/components/store/pages/claude-dispatch";

export const metadata: Metadata = toolMetadata("claude-dispatch");

export default function ClaudeDispatchPage() {
  return (
    <>
      <ContourField calm />
      <Nav />
      <main>
        <ClaudeDispatchLanding />
      </main>
    </>
  );
}
