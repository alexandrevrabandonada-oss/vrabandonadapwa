export const dossierStatuses = ["draft", "in_progress", "published", "archived"] as const;
export type DossierStatus = (typeof dossierStatuses)[number];

export const dossierLinkTypes = ["editorial", "memory", "archive", "collection", "series"] as const;
export type DossierLinkType = (typeof dossierLinkTypes)[number];

export type InvestigationDossier = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  status: DossierStatus | string;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  lead_question: string | null;
  period_label: string | null;
  territory_label: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type InvestigationDossierLink = {
  id: string;
  dossier_id: string;
  link_type: DossierLinkType | string;
  link_key: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DossierResolvedLink = {
  id: string;
  link_type: DossierLinkType | string;
  link_key: string;
  title: string;
  excerpt: string | null;
  href: string;
  featured: boolean;
  sort_order: number;
};

export const dossierStatusLabels: Record<DossierStatus, string> = {
  draft: "Rascunho",
  in_progress: "Em curso",
  published: "Publicado",
  archived: "Arquivado",
};

export const dossierLinkTypeLabels: Record<DossierLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  series: "Série",
};
