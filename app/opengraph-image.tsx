import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { site } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <EditorialShareImage
        kicker={site.hero.kicker}
        title={site.name}
        description={site.hero.lead}
        label="Casa digital"
        footer="memória, denúncia e organização popular"
        variant="night"
      />
    ),
    size,
  );
}
