export const entryRouteStatuses = ["draft", "active", "archive"] as const;
export type EntryRouteStatus = (typeof entryRouteStatuses)[number];

export const entryRouteItemTypes = ["editorial", "dossier", "memory", "archive", "collection", "hub", "series"] as const;
export type EntryRouteItemType = (typeof entryRouteItemTypes)[number];

export const entryRouteItemRoles = ["start", "context", "proof", "deepen", "follow"] as const;
export type EntryRouteItemRole = (typeof entryRouteItemRoles)[number];

export type EntryRoute = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  audience_label: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  status: EntryRouteStatus | string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type EntryRouteItem = {
  id: string;
  route_id: string;
  item_type: EntryRouteItemType | string;
  item_key: string;
  role: EntryRouteItemRole | string;
  sort_order: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type EntryRouteResolvedItem = EntryRouteItem & {
  title: string;
  excerpt: string | null;
  href: string;
  coverImageUrl: string | null;
  coverVariant: string | null;
  primaryLabel: string;
  secondaryLabel: string | null;
  roleLabel: string;
  orderLabel: string;
};

export const entryRouteStatusLabels: Record<EntryRouteStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  archive: "Arquivo",
};

export const entryRouteItemTypeLabels: Record<EntryRouteItemType, string> = {
  editorial: "Pauta",
  dossier: "Dossiê",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  hub: "Eixo",
  series: "Série",
};

export const entryRouteItemRoleLabels: Record<EntryRouteItemRole, string> = {
  start: "Comece por aqui",
  context: "Contexto",
  proof: "Prova",
  deepen: "Aprofunde",
  follow: "Acompanhe",
};
