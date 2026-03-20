export const patternReadStatuses = ["active", "monitoring", "archive", "draft"] as const;
export type PatternReadStatus = (typeof patternReadStatuses)[number];

export const patternReadTypes = [
  "actor_recurrence",
  "territory_recurrence",
  "impact_pattern",
  "thematic_pattern",
  "institution_pattern",
  "archive_pattern",
  "continuity",
  "dispute",
] as const;
export type PatternReadType = (typeof patternReadTypes)[number];

export const patternReadLinkTypes = [
  "editorial",
  "memory",
  "archive",
  "collection",
  "dossier",
  "campaign",
  "impact",
  "hub",
  "territory",
  "actor",
  "page",
  "external",
] as const;
export type PatternReadLinkType = (typeof patternReadLinkTypes)[number];

export const patternReadLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type PatternReadLinkRole = (typeof patternReadLinkRoles)[number];

export const patternReadStatusLabels: Record<PatternReadStatus, string> = {
  active: "Ativo",
  monitoring: "Monitoramento",
  archive: "Arquivo",
  draft: "Rascunho",
};

export const patternReadTypeLabels: Record<PatternReadType, string> = {
  actor_recurrence: "Recorrência de ator",
  territory_recurrence: "Recorrência territorial",
  impact_pattern: "Padrão de impacto",
  thematic_pattern: "Padrão temático",
  institution_pattern: "Padrão institucional",
  archive_pattern: "Padrão de arquivo",
  continuity: "Continuidade",
  dispute: "Disputa recorrente",
};

export const patternReadLinkTypeLabels: Record<PatternReadLinkType, string> = {
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
  page: "Página",
  external: "Externo",
};

export const patternReadLinkRoleLabels: Record<PatternReadLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};

export type PatternRead = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  pattern_type: PatternReadType | string;
  lead_question: string | null;
  status: PatternReadStatus | string;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type PatternReadLink = {
  id: string;
  pattern_read_id: string;
  link_type: PatternReadLinkType | string;
  link_key: string;
  link_role: PatternReadLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PatternReadResolvedLink = PatternReadLink & {
  href: string;
  title: string;
  excerpt: string | null;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};

export type PatternReadTimelineEntry = PatternReadResolvedLink & {
  yearLabel: string;
};

export type PatternReadLinkOption = {
  value: string;
  label: string;
};
