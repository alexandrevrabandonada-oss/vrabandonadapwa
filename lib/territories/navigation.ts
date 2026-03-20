import type { PlaceHubLinkRole, PlaceHubLinkType, PlaceHubPlaceType, PlaceHubStatus } from "@/lib/territories/types";

export const placeHubStatusOrder: Record<PlaceHubStatus, number> = {
  active: 1,
  monitoring: 2,
  archive: 3,
  draft: 4,
};

export const placeHubStatusLabels: Record<PlaceHubStatus, string> = {
  active: "Ativo",
  monitoring: "Monitoramento",
  archive: "Arquivo",
  draft: "Rascunho",
};

export const placeHubStatusTones: Record<PlaceHubStatus, string> = {
  active: "status-tone--hot",
  monitoring: "status-tone--watch",
  archive: "status-tone--calm",
  draft: "status-tone--draft",
};

export const placeHubPlaceTypeLabels: Record<PlaceHubPlaceType, string> = {
  bairro: "Bairro",
  escola: "Escola",
  hospital: "Hospital",
  usina: "Usina",
  rua: "Rua",
  praca: "Praça",
  predio: "Prédio",
  unidade_publica: "Unidade pública",
  ponto_critico: "Ponto crítico",
  memorial: "Memorial",
  outro: "Outro",
};

export const placeHubLinkTypeLabels: Record<PlaceHubLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  campaign: "Campanha",
  impact: "Impacto",
  hub: "Eixo",
  page: "Página",
  external: "Externo",
};

export const placeHubLinkRoleLabels: Record<PlaceHubLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};

export const placeHubLinkRoleOrder: Record<PlaceHubLinkRole, number> = {
  lead: 1,
  evidence: 2,
  context: 3,
  followup: 4,
  archive: 5,
};

export function getPlaceHubStatusSortOrder(status: string) {
  return placeHubStatusOrder[status as PlaceHubStatus] ?? 9;
}

export function getPlaceHubStatusLabel(status: string) {
  return placeHubStatusLabels[status as PlaceHubStatus] ?? status;
}

export function getPlaceHubStatusTone(status: string) {
  return placeHubStatusTones[status as PlaceHubStatus] ?? "status-tone--muted";
}

export function getPlaceHubPlaceTypeLabel(type: string) {
  return placeHubPlaceTypeLabels[type as PlaceHubPlaceType] ?? type;
}

export function getPlaceHubLinkTypeLabel(type: string) {
  return placeHubLinkTypeLabels[type as PlaceHubLinkType] ?? type;
}

export function getPlaceHubLinkRoleLabel(role: string) {
  return placeHubLinkRoleLabels[role as PlaceHubLinkRole] ?? role;
}

export function getPlaceHubLinkRoleOrder(role: string) {
  return placeHubLinkRoleOrder[role as PlaceHubLinkRole] ?? 9;
}

export function getPlaceHubLinkHref(type: string, key: string) {
  switch (type) {
    case "editorial":
      return `/pautas/${key}`;
    case "memory":
      return `/memoria/${key}`;
    case "archive":
      return `/acervo/${key}`;
    case "collection":
      return `/acervo/colecoes/${key}`;
    case "dossier":
      return `/dossies/${key}`;
    case "campaign":
      return `/campanhas/${key}`;
    case "impact":
      return `/impacto/${key}`;
    case "hub":
      return `/eixos/${key}`;
    case "page":
      return key.startsWith("/") ? key : `/${key}`;
    case "external":
      return key;
    default:
      return "/";
  }
}

export function getPlaceHubLinkRef(type: string, key: string) {
  return `${type}:${key}`;
}

export function parsePlaceHubLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}
