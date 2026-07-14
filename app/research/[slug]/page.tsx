import { use } from "react";
import { Nav } from "@/components/nav";
import { EntryView } from "@/components/research/entry-view";

export default function ResearchEntry({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <>
      <Nav />
      <main>
        <EntryView slug={slug} />
      </main>
    </>
  );
}
