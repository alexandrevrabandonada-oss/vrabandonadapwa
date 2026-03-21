import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14100A",
          color: "#F3B21A",
          borderRadius: 36,
          border: "8px solid rgba(243, 178, 26, 0.18)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 900,
          fontSize: 64,
          letterSpacing: "-0.08em",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            height: 6,
            borderRadius: 999,
            background: "#A6ECEC",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.2,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 999,
              background: "#F3B21A",
            }}
          />
        </div>
        <span style={{ position: "relative" }}>VR</span>
      </div>
    ),
    size,
  );
}
