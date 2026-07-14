import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { toolMetadata } from "@/lib/store-metadata";
import { ClaudeDispatchLanding } from "@/components/store/pages/claude-dispatch";

export const metadata: Metadata = toolMetadata("claude-dispatch");

export default function ClaudeDispatchPage() {
  return (
    <>
      <Nav />
      <main>
        <ClaudeDispatchLanding />
      </main>
    </>
  );
}
