import type { EditorialEdition } from "@/lib/editions/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { EditorialItem } from "@/lib/editorial/types";
import type { PatternRead } from "@/lib/patterns/types";

export const sharePackContentTypes = ["edicao", "campanha", "dossie", "impacto", "padrao", "pauta"] as const;
export type SharePackContentType = (typeof sharePackContentTypes)[number];

export const sharePackStatuses = ["draft", "published", "archived"] as const;
export type SharePackStatus = (typeof sharePackStatuses)[number];

export const sharePackCoverVariants = ["steel", "ember", "concrete", "night"] as const;
export type SharePackCoverVariant = (typeof sharePackCoverVariants)[number];

export const sharePackFormats = ["square", "vertical", "both"] as const;
export type SharePackFormat = (typeof sharePackFormats)[number];

export type SharePack = {
  id: string;
  content_type: SharePackContentType | string;
  content_key: string;
  title_override: string | null;
  short_summary: string | null;
  share_caption: string | null;
  share_status: SharePackStatus | string;
  cover_variant: SharePackCoverVariant | string | null;
  preferred_format: SharePackFormat | string;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type SharePackContext = {
  editions: EditorialEdition[];
  campaigns: PublicCampaign[];
  impacts: PublicImpact[];
  dossiers: InvestigationDossier[];
  pautas: EditorialItem[];
  patterns: PatternRead[];
};

export type SharePackResolved = SharePack & {
  href: string;
  contentHref: string;
  title: string;
  summary: string;
  caption: string;
  typeLabel: string;
  statusLabel: string;
  formatLabel: string;
  coverVariantResolved: SharePackCoverVariant;
};

export type SharePackLinkOption = {
  value: string;
  label: string;
};
