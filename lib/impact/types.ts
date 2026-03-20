export const impactStatuses = ["observed", "partial", "ongoing", "consolidated", "disputed", "archived"] as const;
export type ImpactStatus = (typeof impactStatuses)[number];

export const impactTypes = [
  "correction",
  "response",
  "mobilization",
  "document",
  "archive_growth",
  "public_pressure",
  "media_echo",
  "institutional_move",
  "continuity",
] as const;
export type ImpactType = (typeof impactTypes)[number];

export const impactLinkTypes = ["editorial", "memory", "archive", "collection", "dossier", "series", "hub", "page", "external"] as const;
export type ImpactLinkType = (typeof impactLinkTypes)[number];

export const impactLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type ImpactLinkRole = (typeof impactLinkRoles)[number];

export type PublicImpact = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  lead_question: string | null;
  impact_type: ImpactType;
  status: ImpactStatus;
  date_label: string | null;
  happened_at: string | null;
  territory_label: string | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type PublicImpactLink = {
  id: string;
  impact_id: string;
  link_type: ImpactLinkType;
  link_key: string;
  link_role: ImpactLinkRole;
  note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ImpactLinkResolved = PublicImpactLink & {
  href: string;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};

