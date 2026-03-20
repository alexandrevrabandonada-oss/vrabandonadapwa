import type { ActorHubLinkRole, ActorHubStatus } from "@/lib/actors/types";

export const actorHubStatusOrder: Record<ActorHubStatus, number> = {
  active: 1,
  monitoring: 2,
  archive: 3,
  draft: 4,
};

export const actorHubLinkRoleOrder: Record<ActorHubLinkRole, number> = {
  lead: 1,
  evidence: 2,
  context: 3,
  followup: 4,
  archive: 5,
};

export function getActorHubStatusSortOrder(status: string) {
  switch (status) {
    case "active":
      return 1;
    case "monitoring":
      return 2;
    case "archive":
      return 3;
    case "draft":
      return 4;
    default:
      return 9;
  }
}

export function getActorHubStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Ativo";
    case "monitoring":
      return "Monitoramento";
    case "archive":
      return "Arquivo";
    case "draft":
      return "Rascunho";
    default:
      return status;
  }
}

export function getActorHubStatusTone(status: string) {
  switch (status) {
    case "active":
      return "status-tone--hot";
    case "monitoring":
      return "status-tone--watch";
    case "archive":
      return "status-tone--calm";
    case "draft":
      return "status-tone--draft";
    default:
      return "status-tone--muted";
  }
}

export function getActorHubActorTypeLabel(type: string) {
  switch (type) {
    case "empresa":
      return "Empresa";
    case "orgao_publico":
      return "Órgão público";
    case "hospital":
      return "Hospital";
    case "escola":
      return "Escola";
    case "universidade":
      return "Universidade";
    case "secretaria":
      return "Secretaria";
    case "autarquia":
      return "Autarquia";
    case "grupo_economico":
      return "Grupo econômico";
    case "equipamento":
      return "Equipamento";
    case "outro":
      return "Outro";
    default:
      return type;
  }
}

export function getActorHubLinkTypeLabel(type: string) {
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
    case "page":
      return "Página";
    case "external":
      return "Externo";
    default:
      return type;
  }
}

export function getActorHubLinkRoleLabel(role: string) {
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

export function getActorHubLinkRoleOrder(role: string) {
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

export function getActorHubLinkHref(type: string, key: string) {
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
    case "page":
      return key.startsWith("/") ? key : `/${key}`;
    case "external":
      return key;
    default:
      return "/";
  }
}

export function getActorHubLinkRef(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseActorHubLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}

