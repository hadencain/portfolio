import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
