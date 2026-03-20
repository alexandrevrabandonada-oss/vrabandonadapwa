import type { ImpactLinkRole, ImpactStatus, ImpactType, ImpactLinkType } from "@/lib/impact/types";

export const impactStatusLabels: Record<ImpactStatus, string> = {
  observed: "Observado",
  partial: "Parcial",
  ongoing: "Em andamento",
  consolidated: "Consolidado",
  disputed: "Em disputa",
  archived: "Arquivo",
};

export const impactTypeLabels: Record<ImpactType, string> = {
  correction: "Correção",
  response: "Resposta",
  mobilization: "Mobilização",
  document: "Documento",
  archive_growth: "Crescimento de arquivo",
  public_pressure: "Pressão pública",
  media_echo: "Eco na mídia",
  institutional_move: "Movimento institucional",
  continuity: "Continuidade",
};

export const impactLinkTypeLabels: Record<ImpactLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  series: "Série",
  hub: "Eixo",
  page: "Página",
  external: "Externo",
};

export const impactLinkRoleLabels: Record<ImpactLinkRole, string> = {
  lead: "Entrada",
  evidence: "Prova",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo",
};

export function getImpactStatusLabel(status: string) {
  return impactStatusLabels[status as ImpactStatus] ?? status;
}

export function getImpactStatusTone(status: string) {
  switch (status) {
    case "ongoing":
      return "status-tone--hot";
    case "partial":
      return "status-tone--watch";
    case "observed":
      return "status-tone--calm";
    case "consolidated":
      return "status-tone--calm";
    case "disputed":
      return "status-tone--alert";
    case "archived":
      return "status-tone--muted";
    default:
      return "status-tone--muted";
  }
}

export function getImpactTypeLabel(type: string) {
  return impactTypeLabels[type as ImpactType] ?? type;
}

export function getImpactLinkTypeLabel(type: string) {
  return impactLinkTypeLabels[type as ImpactLinkType] ?? type;
}

export function getImpactLinkRoleLabel(role: string) {
  return impactLinkRoleLabels[role as ImpactLinkRole] ?? role;
}

export function getImpactStatusSortOrder(status: string) {
  switch (status) {
    case "ongoing":
      return 0;
    case "partial":
      return 1;
    case "observed":
      return 2;
    case "consolidated":
      return 3;
    case "disputed":
      return 4;
    case "archived":
      return 5;
    default:
      return 6;
  }
}
