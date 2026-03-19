import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #181818 0%, #0d0d0d 100%)",
          color: "#f3b21a",
          border: "24px solid rgba(243, 178, 26, 0.18)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            width: "100%",
            height: "100%",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 280,
              height: 280,
              borderRadius: 48,
              background: "linear-gradient(180deg, rgba(243, 178, 26, 0.14), rgba(182, 63, 35, 0.12))",
              border: "1px solid rgba(243, 178, 26, 0.36)",
            }}
          >
            <span style={{ fontSize: 138, fontWeight: 900, letterSpacing: "-0.08em" }}>VR</span>
          </div>
          <span style={{ fontSize: 28, letterSpacing: "0.28em", fontWeight: 800 }}>ABANDONADA</span>
        </div>
      </div>
    ),
    size,
  );
}
