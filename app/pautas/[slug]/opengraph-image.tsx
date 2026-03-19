import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { getPublishedEditorialBySlug } from "@/lib/editorial/queries";
import { getEditorialSeriesByItem } from "@/lib/editorial/taxonomy";

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
  const item = await getPublishedEditorialBySlug(slug);

  if (!item) {
    return new ImageResponse(
      (
        <EditorialShareImage
          kicker="pauta publicada"
          title="VR Abandonada"
          description="Arquivo editorial da cidade operária."
          label="Pautas"
          footer="memória viva"
          variant="concrete"
        />
      ),
      size,
    );
  }

  const series = getEditorialSeriesByItem(item);

  return new ImageResponse(
    (
      <EditorialShareImage
        kicker={series?.title || item.category}
        title={item.title}
        description={item.excerpt}
        label={item.primary_tag || item.category}
        footer={series?.axis || "VR Abandonada"}
        variant={(item.cover_variant as "steel" | "ember" | "concrete" | "night") || "concrete"}
      />
    ),
    size,
  );
}
