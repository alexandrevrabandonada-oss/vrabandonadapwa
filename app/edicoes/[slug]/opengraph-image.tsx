import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { getPublishedEditorialEditionBySlug } from "@/lib/editions/queries";
import { getEditionTypeLabel } from "@/lib/editions/navigation";

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
  const edition = await getPublishedEditorialEditionBySlug(slug);

  if (!edition) {
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

  return new ImageResponse(
    (
      <EditorialShareImage
        kicker={getEditionTypeLabel(edition.edition_type)}
        title={edition.title}
        description={edition.excerpt || edition.description || "Síntese editorial do momento."}
        label={edition.period_label || edition.status}
        footer={edition.featured ? "destaque" : edition.status}
        variant={edition.edition_type === "city_pulse" ? "ember" : edition.edition_type === "special" || edition.edition_type === "dossier" ? "night" : "steel"}
      />
    ),
    size,
  );
}
