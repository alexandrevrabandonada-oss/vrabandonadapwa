import { ImageResponse } from "next/og";
import { getMateria } from "@/lib/materias";

export const alt = "VR Abandonada — capa de matéria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };
export default async function Image({ params }: Props) {
  const { slug } = await params;
  const story = await getMateria(slug);
  const title = story?.title || "VR Abandonada";
  return new ImageResponse(
    <div style={{ background: "#111111", color: "#f5f2ea", width: "100%", height: "100%",
      display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ background: "#efc52d", color: "#111", padding: "12px 20px", fontWeight: 900, fontSize: 34 }}>VR</div>
        <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: 2 }}>ABANDONADA</div>
        <div style={{ marginLeft: "auto", borderBottom: "3px solid #efc52d", fontSize: 21, letterSpacing: 2, color: "#efc52d" }}>{story?.section || "PUBLICAÇÃO"}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, zIndex: 1 }}>
        <div style={{ width: 90, height: 8, background: "#efc52d" }} />
        <div style={{ fontSize: title.length > 90 ? 44 : title.length > 60 ? 56 : 70,
          fontWeight: 900, lineHeight: 1.03, letterSpacing: -1.5, maxWidth: 1040 }}>{title.slice(0, 145)}</div>
      </div>
      <div style={{ fontSize: 23, color: "#cccccc", borderTop: "1px solid #565656", paddingTop: 22 }}>
        PUBLICAÇÃO ORIGINAL · VOLTA REDONDA
      </div>
    </div>,
    size,
  );
}
