import { use } from "react";
import { Nav } from "@/components/nav";
import { ContourField } from "@/components/contour-field";
import { EntryView } from "@/components/research/entry-view";

export default function ResearchEntry({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <>
      <ContourField />
      <Nav />
      <main>
        <EntryView slug={slug} />
      </main>
    </>
  );
}
