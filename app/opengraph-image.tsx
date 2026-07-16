import { ImageResponse } from "next/og";

// Default share card — every page without its own ogImage inherits this.
// The brand rides on the palette and layout (satori can't load the site's
// woff2 faces, so type is the bundled sans, set sparse and tracked).
// Satori rule: every div carries explicit display:flex.

export const alt = "Haden Cain — software engineer & audio toolmaker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#12100c",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", width: 14, height: 14, background: "#d8453a" }} />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.35em",
              color: "#8a8274",
            }}
          >
            HADENCAIN.COM
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              height: 1,
              background: "rgba(227,221,208,0.18)",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              color: "#e3ddd0",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Haden Cain
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontSize: 28,
              letterSpacing: "0.28em",
              color: "#8a8274",
            }}
          >
            AUDIO · VIDEO · SECURITY TOOLING
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.3em",
              color: "#5c564a",
            }}
          >
            SOFTWARE ENGINEER & AUDIO TOOLMAKER
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.3em",
              color: "#5c564a",
            }}
          >
            {new Date().getFullYear()}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
