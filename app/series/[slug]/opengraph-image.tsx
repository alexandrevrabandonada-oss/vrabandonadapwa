import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { editorialSeriesCatalog, getEditorialSeriesBySlug } from "@/lib/editorial/taxonomy";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return editorialSeriesCatalog.map((series) => ({ slug: series.slug }));
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const series = getEditorialSeriesBySlug(slug);

  if (!series) {
    return new ImageResponse(
      (
        <EditorialShareImage
          kicker="série editorial"
          title="VR Abandonada"
          description="Arquivo editorial da cidade operária."
          label="Séries"
          footer="memória viva"
          variant="concrete"
        />
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <EditorialShareImage
        kicker={series.axis}
        title={series.title}
        description={series.description}
        label="Série"
        footer="VR Abandonada"
        variant={series.coverVariant}
      />
    ),
    size,
  );
}
