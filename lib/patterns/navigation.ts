import type { PatternReadLinkRole, PatternReadStatus } from "@/lib/patterns/types";

export const patternReadStatusOrder: Record<PatternReadStatus, number> = {
  active: 1,
  monitoring: 2,
  archive: 3,
  draft: 4,
};

export const patternReadLinkRoleOrder: Record<PatternReadLinkRole, number> = {
  lead: 1,
  evidence: 2,
  context: 3,
  followup: 4,
  archive: 5,
};

export function getPatternReadStatusSortOrder(status: string) {
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

export function getPatternReadStatusLabel(status: string) {
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

export function getPatternReadStatusTone(status: string) {
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

export function getPatternReadTypeLabel(type: string) {
  switch (type) {
    case "actor_recurrence":
      return "Recorrência de ator";
    case "territory_recurrence":
      return "Recorrência territorial";
    case "impact_pattern":
      return "Padrão de impacto";
    case "thematic_pattern":
      return "Padrão temático";
    case "institution_pattern":
      return "Padrão institucional";
    case "archive_pattern":
      return "Padrão de arquivo";
    case "continuity":
      return "Continuidade";
    case "dispute":
      return "Disputa recorrente";
    default:
      return type;
  }
}

export function getPatternReadLinkTypeLabel(type: string) {
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

export function getPatternReadLinkRoleLabel(role: string) {
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

export function getPatternReadLinkRoleOrder(role: string) {
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

export function getPatternReadLinkHref(type: string, key: string) {
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

export function getPatternReadLinkRef(type: string, key: string) {
  return `${type}:${key}`;
}

export function parsePatternReadLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}

