import React from "react";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { ShareCardImage } from "@/components/share-card-image";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getSharePackContentTypeLabel, getSharePackCoverVariant, getSharePackFormatLabel, getSharePackStatusLabel } from "@/lib/share-packs/navigation";
import { getPublishedSharePacks } from "@/lib/share-packs/queries";
import { resolveSharePack } from "@/lib/share-packs/resolve";
import type { SharePack, SharePackContext } from "@/lib/share-packs/types";

export const runtime = "edge";

const sizeByFormat = {
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1350 },
} as const;

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

function isSupportedContentType(contentType: string) {
  return ["edicao", "campanha", "dossie", "impacto", "padrao", "pauta"].includes(contentType);
}

async function loadContext() {
  const [packs, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getPublishedSharePacks(),
    getPublishedEditorialEditions(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedPatternReads(),
  ]);

  return {
    packs,
    context: {
      editions,
      campaigns,
      impacts,
      dossiers,
      pautas,
      patterns,
    } satisfies SharePackContext,
  };
}

export async function GET(request: NextRequest) {
  const contentType = request.nextUrl.searchParams.get("contentType") || "";
  const contentKey = request.nextUrl.searchParams.get("contentKey") || "";
  const format = request.nextUrl.searchParams.get("format") === "vertical" ? "vertical" : "square";

  if (!isSupportedContentType(contentType) || !contentKey) {
    return new Response("Not found", { status: 404 });
  }

  const { packs, context } = await loadContext();
  const pack = packs.find((item) => item.content_type === contentType && item.content_key === contentKey) ?? buildFallbackPack(contentType, contentKey);
  const resolved = resolveSharePack(pack, context);
  const size = sizeByFormat[format];
  const label = `${getSharePackContentTypeLabel(contentType)} · ${getSharePackStatusLabel(resolved.share_status)} · ${getSharePackFormatLabel(format)}`;

  const response = new ImageResponse(
    React.createElement(ShareCardImage, {
      title: resolved.title,
      summary: resolved.summary,
      label,
      footer: resolved.caption,
      variant: resolved.coverVariantResolved,
      format,
    }),
    size,
  );

  if (request.nextUrl.searchParams.get("download") === "1") {
    response.headers.set("Content-Disposition", `attachment; filename="vr-abandonada-${contentType}-${contentKey}-${format}.png"`);
  }

  return response;
}
