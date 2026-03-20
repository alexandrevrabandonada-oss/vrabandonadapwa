import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function ShareIndexOpenGraphImage() {
  return new ImageResponse(
    (
      <EditorialShareImage
        kicker="compartilhar"
        title="Pacotes editoriais"
        description="Links, resumos e legendas prontos para circular fora do site."
        label="Circulação pública"
        footer="VR Abandonada"
        variant="ember"
      />
    ),
    size,
  );
}
