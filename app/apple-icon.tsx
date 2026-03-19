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
          background: "#0d0d0d",
          color: "#f3b21a",
          borderRadius: 36,
          border: "8px solid rgba(243, 178, 26, 0.18)",
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          fontSize: 68,
          letterSpacing: "-0.08em",
        }}
      >
        VR
      </div>
    ),
    size,
  );
}
