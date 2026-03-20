import type { CSSProperties } from "react";

type Props = {
  title: string;
  summary: string;
  label: string;
  footer: string;
  variant?: "steel" | "ember" | "concrete" | "night";
  format?: "square" | "vertical";
};

const sizeByFormat: Record<NonNullable<Props["format"]>, { width: number; height: number; titleSize: number; summarySize: number }> = {
  square: { width: 1080, height: 1080, titleSize: 74, summarySize: 30 },
  vertical: { width: 1080, height: 1350, titleSize: 80, summarySize: 34 },
};

const variantGradients: Record<NonNullable<Props["variant"]>, string> = {
  steel:
    "radial-gradient(circle at 20% 20%, rgba(116, 112, 107, 0.4), transparent 28%), radial-gradient(circle at 80% 80%, rgba(243, 178, 26, 0.14), transparent 24%)",
  ember:
    "radial-gradient(circle at 22% 22%, rgba(182, 63, 35, 0.42), transparent 28%), radial-gradient(circle at 82% 78%, rgba(243, 178, 26, 0.18), transparent 24%)",
  concrete:
    "radial-gradient(circle at 18% 20%, rgba(116, 112, 107, 0.34), transparent 28%), radial-gradient(circle at 78% 74%, rgba(243, 178, 26, 0.12), transparent 24%)",
  night:
    "radial-gradient(circle at 20% 20%, rgba(13, 13, 13, 0.7), transparent 28%), radial-gradient(circle at 82% 76%, rgba(182, 63, 35, 0.2), transparent 24%)",
};

export function ShareCardImage({ title, summary, label, footer, variant = "concrete", format = "square" }: Props) {
  const size = sizeByFormat[format];
  const isVertical = format === "vertical";

  const baseStyle: CSSProperties = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: isVertical ? "64px" : "56px",
    color: "#F3EFE7",
    background: "linear-gradient(135deg, #111111 0%, #070707 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  };

  return (
    <div style={{ ...baseStyle, background: `${variantGradients[variant]}, linear-gradient(135deg, #111111 0%, #070707 100%)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", flexDirection: isVertical ? "column" : "row" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: isVertical ? 900 : 680 }}>
          <div style={{ color: "#F3B21A", fontSize: isVertical ? 24 : 22, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700 }}>
            VR Abandonada
          </div>
          <div style={{ color: "rgba(243,239,231,0.72)", fontSize: isVertical ? 20 : 18, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {label}
          </div>
          <div style={{ fontSize: size.titleSize, lineHeight: 0.94, fontWeight: 800, letterSpacing: "-0.06em", textTransform: "uppercase" }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, fontSize: isVertical ? 18 : 16, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F3EFE7" }}>
          <div style={{ border: "1px solid rgba(243,178,26,0.45)", padding: "10px 14px", borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
            {footer}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ flex: 1, fontSize: size.summarySize, lineHeight: 1.34, maxWidth: isVertical ? 900 : 760, color: "rgba(243,239,231,0.86)" }}>
          {summary}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: isVertical ? "flex-start" : "flex-end" }}>
          <div style={{ width: isVertical ? 360 : 280, height: 12, background: "#F3B21A" }} />
          <div style={{ width: isVertical ? 540 : 380, height: 12, background: "rgba(243,239,231,0.5)" }} />
          <div style={{ width: isVertical ? 300 : 220, height: 12, background: "#B63F23" }} />
        </div>
      </div>
    </div>
  );
}
