export const participationStatuses = ["draft", "active", "archive"] as const;
export type ParticipationStatus = (typeof participationStatuses)[number];

export const participationItemTypes = ["page", "editorial", "dossier", "memory", "archive", "collection", "hub", "series", "external"] as const;
export type ParticipationItemType = (typeof participationItemTypes)[number];

export const participationItemRoles = ["start", "context", "proof", "deepen", "follow"] as const;
export type ParticipationItemRole = (typeof participationItemRoles)[number];

export type ParticipationPath = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  audience_label: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  status: ParticipationStatus | string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ParticipationPathItem = {
  id: string;
  path_id: string;
  item_type: ParticipationItemType | string;
  item_key: string;
  role: ParticipationItemRole | string;
  sort_order: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type ParticipationResolvedItem = ParticipationPathItem & {
  title: string;
  excerpt: string | null;
  href: string;
  primaryLabel: string;
  secondaryLabel: string | null;
  roleLabel: string;
  roleTone: string;
};

export const participationStatusLabels: Record<ParticipationStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  archive: "Arquivo",
};

export const participationItemTypeLabels: Record<ParticipationItemType, string> = {
  page: "Página",
  editorial: "Pauta",
  dossier: "Dossiê",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  hub: "Eixo",
  series: "Série",
  external: "Link externo",
};

export const participationItemRoleLabels: Record<ParticipationItemRole, string> = {
  start: "Comece por aqui",
  context: "Contexto",
  proof: "Prova",
  deepen: "Aprofunde",
  follow: "Acompanhe",
};