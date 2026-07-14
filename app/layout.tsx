import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Jacquard_12,
  Doto,
  Bodoni_Moda_SC,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MotionProvider } from "@/components/motion-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display voices, user-selected:
// Jacquard 12 — pixel blackletter, the name and big display moments.
// Doto — dot matrix, section headers and the cycling label.
// Bodoni Moda SC — small caps, nav and micro-labels.
const jacquard = Jacquard_12({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: "400",
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
});

const bodoniSC = Bodoni_Moda_SC({
  variable: "--font-smallcaps",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Canonical origin for resolving relative OG/Twitter images. Unset by
  // default: on Vercel the production-URL fallback already yields working
  // absolute URLs, and the canonical domain (hadencain.com) has no DNS yet.
  // When it does, set NEXT_PUBLIC_SITE_URL and this takes over.
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: "Haden Cain",
  description:
    "Software Engineer & Audio Toolmaker. I build things that make noise and things that make sense.",
  openGraph: {
    title: "Haden Cain",
    description:
      "Software Engineer & Audio Toolmaker. I build things that make noise and things that make sense.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Haden Cain",
    description:
      "Software Engineer & Audio Toolmaker. I build things that make noise and things that make sense.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jacquard.variable} ${doto.variable} ${bodoniSC.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="antialiased">
        <MotionProvider>{children}</MotionProvider>
        <div className="grain" aria-hidden />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
