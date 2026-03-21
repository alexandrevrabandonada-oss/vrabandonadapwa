import type { SearchContentType } from "@/lib/search/types";

export const timelineHighlightStatuses = ["draft", "active", "monitoring", "archive"] as const;
export type TimelineHighlightStatus = (typeof timelineHighlightStatuses)[number];

export const timelineHighlightTypes = [
  "origin",
  "rupture",
  "recurrence",
  "consequence",
  "turning_point",
  "archive_marker",
  "investigation_marker",
] as const;
export type TimelineHighlightType = (typeof timelineHighlightTypes)[number];

export const timelineHighlightLinkTypes = [
  "editorial",
  "memory",
  "archive",
  "collection",
  "dossier",
  "dossier_update",
  "campaign",
  "impact",
  "hub",
  "territory",
  "actor",
  "pattern",
  "edition",
  "page",
  "external",
] as const;
export type TimelineHighlightLinkType = (typeof timelineHighlightLinkTypes)[number];

export const timelineHighlightLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type TimelineHighlightLinkRole = (typeof timelineHighlightLinkRoles)[number];

export const timelineHighlightStatusLabels: Record<TimelineHighlightStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  monitoring: "Monitoramento",
  archive: "Arquivo",
};

export const timelineHighlightTypeLabels: Record<TimelineHighlightType, string> = {
  origin: "Origem",
  rupture: "Ruptura",
  recurrence: "Reaparição",
  consequence: "Consequência",
  turning_point: "Ponto de virada",
  archive_marker: "Marco de arquivo",
  investigation_marker: "Marco de investigação",
};

export const timelineHighlightLinkTypeLabels: Record<TimelineHighlightLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  dossier_update: "Atualização",
  campaign: "Campanha",
  impact: "Impacto",
  hub: "Eixo",
  territory: "Território",
  actor: "Ator",
  pattern: "Padrão",
  edition: "Edição",
  page: "Página",
  external: "Externo",
};

export const timelineHighlightLinkRoleLabels: Record<TimelineHighlightLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};

export type TimelineHighlight = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  highlight_type: TimelineHighlightType | string;
  date_label: string | null;
  year_start: number | null;
  year_end: number | null;
  period_label: string | null;
  lead_question: string | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  status: TimelineHighlightStatus | string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type TimelineHighlightLink = {
  id: string;
  timeline_highlight_id: string;
  link_type: TimelineHighlightLinkType | string;
  link_key: string;
  link_role: TimelineHighlightLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TimelineHighlightResolvedLink = TimelineHighlightLink & {
  href: string;
  title: string;
  excerpt: string | null;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};

export type TimelineHighlightTimelineEntry = TimelineHighlightResolvedLink & {
  yearLabel: string;
};

export type TimelineHighlightLinkOption = {
  value: string;
  label: string;
};

export function getTimelineHighlightStatusLabel(status: string) {
  return timelineHighlightStatusLabels[status as TimelineHighlightStatus] ?? status;
}

export function getTimelineHighlightStatusSortOrder(status: string) {
  const order: TimelineHighlightStatus[] = ["active", "monitoring", "archive", "draft"];
  const index = order.indexOf(status as TimelineHighlightStatus);
  return index >= 0 ? index : order.length;
}

export function getTimelineHighlightTypeLabel(type: string) {
  return timelineHighlightTypeLabels[type as TimelineHighlightType] ?? type;
}

export function getTimelineHighlightLinkTypeLabel(type: string) {
  return timelineHighlightLinkTypeLabels[type as TimelineHighlightLinkType] ?? type;
}

export function getTimelineHighlightLinkRoleLabel(role: string) {
  return timelineHighlightLinkRoleLabels[role as TimelineHighlightLinkRole] ?? role;
}

export function getTimelineHighlightHref(slug: string) {
  return `/linha-do-tempo/marcos/${slug}`;
}

export function getTimelineHighlightSaveKind() {
  return "marco";
}

export function getTimelineHighlightFollowKind() {
  return "marco";
}

export function getTimelineHighlightContentType(): SearchContentType {
  return "marco";
}
