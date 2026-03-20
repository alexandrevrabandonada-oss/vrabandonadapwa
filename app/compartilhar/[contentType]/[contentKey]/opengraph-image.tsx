import { ImageResponse } from "next/og";

import { EditorialShareImage } from "@/components/editorial-share-image";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getSharePackContentTypeLabel, getSharePackCoverVariant } from "@/lib/share-packs/navigation";
import { getPublishedSharePacks } from "@/lib/share-packs/queries";
import { resolveSharePack } from "@/lib/share-packs/resolve";
import type { SharePack, SharePackContext } from "@/lib/share-packs/types";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function buildFallbackPack(contentType: string, contentKey: string): SharePack {
  return {
    id: `${contentType}:${contentKey}`,
    content_type: contentType,
    content_key: contentKey,
    title_override: null,
    short_summary: null,
    share_caption: null,
    share_status: "published",
    cover_variant: getSharePackCoverVariant(contentType),
    preferred_format: "both",
    featured: false,
    public_visibility: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
  };
}

export default async function SharePackOpenGraphImage({ params }: { params: { contentType: string; contentKey: string } }) {
  const { contentType, contentKey } = params;

  const [packs, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getPublishedSharePacks(),
    getPublishedEditorialEditions(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedPatternReads(),
  ]);

  const context: SharePackContext = {
    editions,
    campaigns,
    impacts,
    dossiers,
    pautas,
    patterns,
  };
  const pack = packs.find((item) => item.content_type === contentType && item.content_key === contentKey) ?? buildFallbackPack(contentType, contentKey);
  const resolved = resolveSharePack(pack, context);

  return new ImageResponse(
    <EditorialShareImage
      kicker={getSharePackContentTypeLabel(contentType)}
      title={resolved.title}
      description={resolved.summary}
      label="Pacote de circulação"
      footer="VR Abandonada"
      variant={resolved.coverVariantResolved}
    />,
    size,
  );
}
