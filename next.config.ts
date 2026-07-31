import type { NextConfig } from "next";
import { ARSENIC_ORIGIN, AUDIO_SLUGS } from "./lib/arsenic";
import { MOBILE_ORIGIN, MOBILE_SLUGS } from "./lib/mobile";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "worker-src blob:",
].join("; ");

const nextConfig: NextConfig = {
  // The audio line moved to Arsenic and the mobile line moved to the mobile
  // label; old store URLs follow them permanently.
  async redirects() {
    return [
      ...AUDIO_SLUGS.map((slug) => ({
        source: `/store/${slug}`,
        destination: `${ARSENIC_ORIGIN}/${slug}`,
        permanent: true,
      })),
      ...MOBILE_SLUGS.map((slug) => ({
        source: `/store/${slug}`,
        destination: `${MOBILE_ORIGIN}/${slug}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
