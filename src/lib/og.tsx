import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// OG card drawn like a display slide: title bar, big text, blue rail with the
// church logo, brand progress bar.
export async function displaySlideImage(label: string, title: string) {
  const [logo, rail] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "advent-logo-white.png")),
    readFile(path.join(process.cwd(), "public", "og-rail.jpg")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const railSrc = `data:image/jpeg;base64,${rail.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          color: "#17364a",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 950, padding: "72px 48px 72px 64px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#17475a",
              borderBottom: "8px solid #204fef",
              paddingBottom: 12,
              alignSelf: "flex-start",
            }}
          >
            {label}
          </div>
          <div style={{ display: "flex", marginTop: 64, fontSize: 84, fontWeight: 800, lineHeight: 1.12, wordBreak: "break-word" }}>{title}</div>
        </div>
        <div
          style={{
            display: "flex",
            width: 250,
            flexShrink: 0,
            position: "relative",
            backgroundColor: "#25334d",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={railSrc} width={250} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} alt="" />
          <div style={{ position: "absolute", top: 0, left: 0, width: 250, height: 630, backgroundColor: "rgba(32,79,239,0.55)", display: "flex" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={180} height={162} style={{ marginBottom: 40 }} alt="" />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 700, height: 12, backgroundColor: "#204fef", display: "flex" }} />
      </div>
    ),
    OG_SIZE,
  );
}
