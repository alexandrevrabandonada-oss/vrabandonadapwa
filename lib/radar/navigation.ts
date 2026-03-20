import type { RadarSection, RadarSourceType } from "@/lib/radar/types";

export const radarSectionLabels: Record<RadarSection, string> = {
  what_changed: "O que mudou",
  impact: "O que já mudou",
  in_course: "Em curso agora",
  hot_fronts: "Frentes quentes",
  archive_present: "Do arquivo ao presente",
  calls: "Chamadas públicas",
};

export const radarSourceLabels: Record<RadarSourceType, string> = {
  "dossier-update": "Update de dossiê",
  dossier: "Dossiê",
  "theme-hub": "Eixo",
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  campaign: "Campanha",
  impact: "Impacto",
};

export function getRadarSectionLabel(section: string) {
  return radarSectionLabels[section as RadarSection] ?? section;
}

export function getRadarSectionTone(section: string) {
  switch (section) {
    case "what_changed":
      return "status-tone--hot";
    case "impact":
      return "status-tone--calm";
    case "in_course":
      return "status-tone--watch";
    case "hot_fronts":
      return "status-tone--hot";
    case "archive_present":
      return "status-tone--calm";
    case "calls":
      return "status-tone--alert";
    default:
      return "status-tone--muted";
  }
}

export function getRadarSourceLabel(sourceType: string) {
  return radarSourceLabels[sourceType as RadarSourceType] ?? sourceType;
}

export function getRadarSectionIntro(section: RadarSection) {
  switch (section) {
    case "what_changed":
      return "Atualizações de dossiê e pautas recentes entram primeiro aqui.";
    case "impact":
      return "Efeitos públicos já observados ou em consolidação entram aqui.";
    case "in_course":
      return "Casos em andamento com a última movimentação visível.";
    case "hot_fronts":
      return "Eixos temáticos com movimento recente atravessando o site.";
    case "archive_present":
      return "Memória e acervo quando o documento ajuda a ler o presente.";
    case "calls":
      return "Convocações públicas, pistas e retornos responsáveis.";
    default:
      return "";
  }
}
