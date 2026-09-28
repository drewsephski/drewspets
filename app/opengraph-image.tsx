import { ImageResponse } from "next/og"
export const alt =
  "Drew’s Pet Care — Your local pet person in Fox River Grove, Illinois"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#f5f4ec",
        padding: 80,
        color: "#344b35",
      }}
    >
      <div style={{ fontSize: 27, marginBottom: 45 }}>
        Drew’s Pet Care · Fox River Grove, Illinois
      </div>
      <div style={{ fontSize: 78, letterSpacing: -4, lineHeight: 1.1 }}>
        Happy pets. Familiar routines.
      </div>
      <div style={{ fontSize: 78, letterSpacing: -4, lineHeight: 1.2 }}>
        Peace of mind.
      </div>
      <div style={{ fontSize: 25, marginTop: 45 }}>
        Your local pet person. · drewspets.com
      </div>
    </div>,
    size
  )
}
