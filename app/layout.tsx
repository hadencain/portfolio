import type { Metadata } from "next";
import { Geist, Geist_Mono, Bodoni_Moda } from "next/font/google";
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

// The display plate — a didone set huge and tight, poster register.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${bodoni.variable}`}
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
