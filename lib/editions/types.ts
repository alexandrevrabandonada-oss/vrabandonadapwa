export const editorialEditionStatuses = ["draft", "published", "archived"] as const;
export type EditorialEditionStatus = (typeof editorialEditionStatuses)[number];

export const editorialEditionTypes = ["weekly", "thematic", "campaign", "dossier", "city_pulse", "archive", "special"] as const;
export type EditorialEditionType = (typeof editorialEditionTypes)[number];

export const editorialEditionLinkTypes = ["editorial", "memory", "archive", "collection", "dossier", "campaign", "impact", "hub", "territory", "actor", "pattern", "radar", "page", "external"] as const;
export type EditorialEditionLinkType = (typeof editorialEditionLinkTypes)[number];

export const editorialEditionLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type EditorialEditionLinkRole = (typeof editorialEditionLinkRoles)[number];

export const editorialEditionStatusLabels: Record<EditorialEditionStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivo",
};

export const editorialEditionTypeLabels: Record<EditorialEditionType, string> = {
  weekly: "Semanal",
  thematic: "Temática",
  campaign: "Campanha",
  dossier: "Dossiê",
  city_pulse: "Pulso da cidade",
  archive: "Arquivo",
  special: "Especial",
};

export const editorialEditionLinkTypeLabels: Record<EditorialEditionLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  campaign: "Campanha",
  impact: "Impacto",
  hub: "Eixo",
  territory: "Território",
  actor: "Ator",
  pattern: "Padrão",
  radar: "Radar",
  page: "Página",
  external: "Externo",
};

export const editorialEditionLinkRoleLabels: Record<EditorialEditionLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};

export type EditorialEdition = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  edition_type: EditorialEditionType | string;
  period_label: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  status: EditorialEditionStatus | string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type EditorialEditionLink = {
  id: string;
  edition_id: string;
  link_type: EditorialEditionLinkType | string;
  link_key: string;
  link_role: EditorialEditionLinkRole | string;
  note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type EditorialEditionResolvedLink = EditorialEditionLink & {
  href: string;
  title: string;
  excerpt: string | null;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};

export type EditorialEditionLinkOption = {
  value: string;
  label: string;
};
