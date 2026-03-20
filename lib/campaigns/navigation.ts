import type { CampaignLinkRole, CampaignStatus, CampaignType, CampaignLinkType } from "@/lib/campaigns/types";

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  upcoming: "Em breve",
  active: "Ativa",
  monitoring: "Monitoramento",
  closed: "Encerrada",
  archived: "Arquivo",
};

export const campaignTypeLabels: Record<CampaignType, string> = {
  call: "Chamada",
  collection: "Coleta",
  pressure: "Pressão pública",
  memory: "Memória",
  support: "Apoio",
  investigation: "Investigação",
};

export const campaignLinkTypeLabels: Record<CampaignLinkType, string> = {
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

export const campaignLinkRoleLabels: Record<CampaignLinkRole, string> = {
  lead: "Entrada",
  evidence: "Prova",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo",
};

export function getCampaignStatusLabel(status: string) {
  return campaignStatusLabels[status as CampaignStatus] ?? status;
}

export function getCampaignStatusTone(status: string) {
  switch (status) {
    case "active":
      return "status-tone--hot";
    case "monitoring":
      return "status-tone--watch";
    case "upcoming":
      return "status-tone--muted";
    case "closed":
      return "status-tone--calm";
    case "archived":
      return "status-tone--muted";
    default:
      return "status-tone--muted";
  }
}

export function getCampaignTypeLabel(type: string) {
  return campaignTypeLabels[type as CampaignType] ?? type;
}

export function getCampaignLinkTypeLabel(type: string) {
  return campaignLinkTypeLabels[type as CampaignLinkType] ?? type;
}

export function getCampaignLinkRoleLabel(role: string) {
  return campaignLinkRoleLabels[role as CampaignLinkRole] ?? role;
}

export function getCampaignStatusSortOrder(status: string) {
  switch (status) {
    case "active":
      return 0;
    case "monitoring":
      return 1;
    case "upcoming":
      return 2;
    case "closed":
      return 3;
    case "archived":
      return 4;
    default:
      return 5;
  }
}


