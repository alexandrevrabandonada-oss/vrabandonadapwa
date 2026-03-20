export const placeHubStatuses = ["active", "monitoring", "archive", "draft"] as const;
export type PlaceHubStatus = (typeof placeHubStatuses)[number];

export const placeHubPlaceTypes = [
  "bairro",
  "escola",
  "hospital",
  "usina",
  "rua",
  "praca",
  "predio",
  "unidade_publica",
  "ponto_critico",
  "memorial",
  "outro",
] as const;
export type PlaceHubPlaceType = (typeof placeHubPlaceTypes)[number];

export const placeHubLinkTypes = ["editorial", "memory", "archive", "collection", "dossier", "campaign", "impact", "hub", "page", "external"] as const;
export type PlaceHubLinkType = (typeof placeHubLinkTypes)[number];

export const placeHubLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type PlaceHubLinkRole = (typeof placeHubLinkRoles)[number];

export type PlaceHub = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  lead_question: string | null;
  place_type: PlaceHubPlaceType;
  parent_place_slug: string | null;
  territory_label: string | null;
  address_label: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  status: PlaceHubStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type PlaceHubLink = {
  id: string;
  place_hub_id: string;
  link_type: PlaceHubLinkType;
  link_key: string;
  link_role: PlaceHubLinkRole;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PlaceHubResolvedLink = PlaceHubLink & {
  href: string;
  title: string;
  excerpt: string | null;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};

export type PlaceHubTimelineEntry = PlaceHubResolvedLink & {
  yearLabel: string;
};
