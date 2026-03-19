import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { getPublishedMemoryBySlug } from "@/lib/memory/queries";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedMemoryBySlug(slug);

  if (!item) {
    return new ImageResponse(
      (
        <EditorialShareImage
          kicker="memória viva"
          title="VR Abandonada"
          description="Arquivo vivo da cidade operária."
          label="Memória"
          footer="arquivo vivo"
          variant="concrete"
        />
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <EditorialShareImage
        kicker={item.period_label}
        title={item.title}
        description={item.excerpt}
        label={item.memory_collection}
        footer={item.place_label || "Volta Redonda"}
        variant={item.highlight_in_memory ? "ember" : "concrete"}
      />
    ),
    size,
  );
}
