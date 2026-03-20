export const dossierStatuses = ["draft", "in_progress", "monitoring", "concluded", "archived"] as const;
export type DossierStatus = (typeof dossierStatuses)[number];

export const dossierLinkTypes = ["editorial", "memory", "archive", "collection", "series"] as const;
export type DossierLinkType = (typeof dossierLinkTypes)[number];

export const dossierLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type DossierLinkRole = (typeof dossierLinkRoles)[number];

export const dossierUpdateTypes = ["development", "evidence", "monitoring", "note", "call", "correction"] as const;
export type DossierUpdateType = (typeof dossierUpdateTypes)[number];

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
  link_role: DossierLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DossierResolvedLink = {
  id: string;
  link_type: DossierLinkType | string;
  link_key: string;
  link_role: DossierLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  title: string;
  excerpt: string | null;
  href: string;
  featured: boolean;
  sort_order: number;
};

export type DossierTimelineEntry = DossierResolvedLink & {
  yearLabel: string;
  roleLabel: string;
};

export type InvestigationDossierUpdate = {
  id: string;
  dossier_id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  body: string;
  update_type: DossierUpdateType | string;
  published: boolean;
  published_at: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export const dossierStatusLabels: Record<DossierStatus, string> = {
  draft: "Rascunho",
  in_progress: "Em curso",
  monitoring: "Monitoramento",
  concluded: "Concluído",
  archived: "Arquivado",
};

export const dossierLinkTypeLabels: Record<DossierLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  series: "Série",
};

export const dossierLinkRoleLabels: Record<DossierLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};

export const dossierUpdateTypeLabels: Record<DossierUpdateType, string> = {
  development: "Desenvolvimento",
  evidence: "Evidência",
  monitoring: "Monitoramento",
  note: "Nota",
  call: "Chamada pública",
  correction: "Correção",
};
