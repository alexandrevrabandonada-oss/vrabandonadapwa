import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { getPublishedImpactBySlug } from "@/lib/impact/queries";
import { getImpactTypeLabel } from "@/lib/impact/navigation";

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
  const impact = await getPublishedImpactBySlug(slug);

  if (!impact) {
    return new ImageResponse(
      (
        <EditorialShareImage
          kicker="impacto público"
          title="VR Abandonada"
          description="Consequência pública, memória e investigação em Volta Redonda."
          label="Impacto"
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
        kicker={impact.territory_label || getImpactTypeLabel(impact.impact_type)}
        title={impact.title}
        description={impact.excerpt || impact.description || "Consequência pública do VR Abandonada."}
        label={impact.date_label || "impacto"}
        footer={impact.status}
        variant={impact.featured ? "ember" : "steel"}
      />
    ),
    size,
  );
}

