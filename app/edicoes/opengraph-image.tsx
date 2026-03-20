import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function EditionsOpenGraphImage() {
  return new ImageResponse(
    (
      <EditorialShareImage
        kicker="edições públicas"
        title="VR Abandonada"
        description="Sínteses editoriais recorrentes do projeto, do radar ao arquivo vivo."
        label="Caderno público"
        footer="circulação editorial"
        variant="steel"
      />
    ),
    size,
  );
}
