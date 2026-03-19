import type { CSSProperties } from "react";

const baseStyle: CSSProperties = {
  width: "1200px",
  height: "630px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "56px",
  color: "#F3EFE7",
  background: "linear-gradient(135deg, #111111 0%, #070707 100%)",
  position: "relative",
  overflow: "hidden",
  fontFamily: "Arial, sans-serif",
};

type Props = {
  kicker: string;
  title: string;
  description: string;
  label?: string;
  footer?: string;
  variant?: "steel" | "ember" | "concrete" | "night";
};

const variantGradients: Record<NonNullable<Props["variant"]>, string> = {
  steel: "radial-gradient(circle at 20% 20%, rgba(116, 112, 107, 0.38), transparent 28%), radial-gradient(circle at 80% 80%, rgba(243, 178, 26, 0.12), transparent 24%)",
  ember: "radial-gradient(circle at 22% 22%, rgba(182, 63, 35, 0.4), transparent 28%), radial-gradient(circle at 82% 78%, rgba(243, 178, 26, 0.18), transparent 24%)",
  concrete: "radial-gradient(circle at 18% 20%, rgba(116, 112, 107, 0.32), transparent 28%), radial-gradient(circle at 78% 74%, rgba(243, 178, 26, 0.12), transparent 24%)",
  night: "radial-gradient(circle at 20% 20%, rgba(13, 13, 13, 0.68), transparent 28%), radial-gradient(circle at 82% 76%, rgba(182, 63, 35, 0.18), transparent 24%)",
};

export function EditorialShareImage({ kicker, title, description, label = "VR Abandonada", footer = "arquivo vivo da cidade", variant = "concrete" }: Props) {
  return (
    <div style={{ ...baseStyle, background: `${variantGradients[variant]}, linear-gradient(135deg, #111111 0%, #070707 100%)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 740 }}>
          <div style={{ color: "#F3B21A", fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700 }}>
            {kicker}
          </div>
          <div style={{ fontSize: 72, lineHeight: 0.94, fontWeight: 800, letterSpacing: "-0.06em", textTransform: "uppercase" }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F3EFE7" }}>
          <div style={{ border: "1px solid rgba(243,178,26,0.45)", padding: "10px 14px", borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
            {label}
          </div>
          <div style={{ color: "#F3B21A" }}>{footer}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-end" }}>
        <div style={{ flex: 1, fontSize: 28, lineHeight: 1.35, maxWidth: 760, color: "rgba(243,239,231,0.86)" }}>
          {description}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <div style={{ width: 280, height: 12, background: "#F3B21A" }} />
          <div style={{ width: 380, height: 12, background: "rgba(243,239,231,0.5)" }} />
          <div style={{ width: 220, height: 12, background: "#B63F23" }} />
        </div>
      </div>
    </div>
  );
}
