import type { EditorialEditionLinkRole, EditorialEditionStatus } from "@/lib/editions/types";

export const editorialEditionStatusOrder: Record<EditorialEditionStatus, number> = {
  published: 1,
  draft: 2,
  archived: 3,
};

export const editorialEditionLinkRoleOrder: Record<EditorialEditionLinkRole, number> = {
  lead: 1,
  evidence: 2,
  context: 3,
  followup: 4,
  archive: 5,
};

export function getEditionStatusSortOrder(status: string) {
  switch (status) {
    case "published":
      return 1;
    case "draft":
      return 2;
    case "archived":
      return 3;
    default:
      return 9;
  }
}

export function getEditionStatusLabel(status: string) {
  switch (status) {
    case "published":
      return "Publicado";
    case "draft":
      return "Rascunho";
    case "archived":
      return "Arquivo";
    default:
      return status;
  }
}

export function getEditionStatusTone(status: string) {
  switch (status) {
    case "published":
      return "status-tone--hot";
    case "draft":
      return "status-tone--draft";
    case "archived":
      return "status-tone--calm";
    default:
      return "status-tone--muted";
  }
}

export function getEditionTypeLabel(type: string) {
  switch (type) {
    case "weekly":
      return "Semanal";
    case "thematic":
      return "Temática";
    case "campaign":
      return "Campanha";
    case "dossier":
      return "Dossiê";
    case "city_pulse":
      return "Pulso da cidade";
    case "archive":
      return "Arquivo";
    case "special":
      return "Especial";
    default:
      return type;
  }
}

export function getEditionCoverVariant(type: string) {
  switch (type) {
    case "weekly":
      return "steel";
    case "campaign":
      return "ember";
    case "dossier":
      return "night";
    case "city_pulse":
      return "ember";
    case "archive":
      return "concrete";
    case "special":
      return "night";
    case "thematic":
    default:
      return "steel";
  }
}

export function getEditionLinkTypeLabel(type: string) {
  switch (type) {
    case "editorial":
      return "Pauta";
    case "memory":
      return "Memória";
    case "archive":
      return "Acervo";
    case "collection":
      return "Coleção";
    case "dossier":
      return "Dossiê";
    case "campaign":
      return "Campanha";
    case "impact":
      return "Impacto";
    case "hub":
      return "Eixo";
    case "territory":
      return "Território";
    case "actor":
      return "Ator";
    case "pattern":
      return "Padrão";
    case "radar":
      return "Radar";
    case "page":
      return "Página";
    case "external":
      return "Externo";
    default:
      return type;
  }
}

export function getEditionLinkRoleLabel(role: string) {
  switch (role) {
    case "lead":
      return "Peça central";
    case "evidence":
      return "Evidência";
    case "context":
      return "Contexto";
    case "followup":
      return "Desdobramento";
    case "archive":
      return "Arquivo de base";
    default:
      return role;
  }
}

export function getEditionLinkRoleOrder(role: string) {
  switch (role) {
    case "lead":
      return 1;
    case "evidence":
      return 2;
    case "context":
      return 3;
    case "followup":
      return 4;
    case "archive":
      return 5;
    default:
      return 9;
  }
}

export function getEditionLinkHref(type: string, key: string) {
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
    case "territory":
      return `/territorios/${key}`;
    case "actor":
      return `/atores/${key}`;
    case "pattern":
      return `/padroes/${key}`;
    case "radar":
      return `/agora`;
    case "page":
      return key.startsWith("/") ? key : `/${key}`;
    case "external":
      return key;
    default:
      return "/";
  }
}

export function getEditionLinkRef(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseEditionLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}

