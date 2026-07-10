import type { Metadata } from "next";
import { toolBySlug } from "@/components/store/registry";

// Page <head> truth comes from the registry so it can't drift from the hub.
// Missing ogImage → the field is omitted and the site default OG inherits.
export function toolMetadata(slug: string): Metadata {
  const t = toolBySlug(slug);
  if (!t) return {};
  const title = `${t.title} — Haden Cain`;
  return {
    title,
    description: t.pitch,
    openGraph: {
      title,
      description: t.pitch,
      type: "website",
      ...(t.ogImage ? { images: [t.ogImage] } : {}),
    },
    twitter: {
      card: t.ogImage ? "summary_large_image" : "summary",
      title,
      description: t.pitch,
    },
  };
}
