export const themeHubStatuses = ["active", "monitoring", "archive", "draft"] as const;
export type ThemeHubStatus = (typeof themeHubStatuses)[number];

export const themeHubLinkTypes = ["editorial", "memory", "archive", "collection", "dossier", "series"] as const;
export type ThemeHubLinkType = (typeof themeHubLinkTypes)[number];

export const themeHubLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type ThemeHubLinkRole = (typeof themeHubLinkRoles)[number];

export type ThemeHub = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  lead_question: string | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  status: ThemeHubStatus | string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ThemeHubLink = {
  id: string;
  theme_hub_id: string;
  link_type: ThemeHubLinkType | string;
  link_key: string;
  link_role: ThemeHubLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ThemeHubResolvedLink = {
  id: string;
  link_type: ThemeHubLinkType | string;
  link_key: string;
  link_role: ThemeHubLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  title: string;
  excerpt: string | null;
  href: string;
  featured: boolean;
  sort_order: number;
};

export type ThemeHubTimelineEntry = ThemeHubResolvedLink & {
  yearLabel: string;
  roleLabel: string;
};

export const themeHubStatusLabels: Record<ThemeHubStatus, string> = {
  active: "Ativo",
  monitoring: "Monitoramento",
  archive: "Arquivo",
  draft: "Rascunho",
};

export const themeHubLinkTypeLabels: Record<ThemeHubLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  series: "Série",
};

export const themeHubLinkRoleLabels: Record<ThemeHubLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};
