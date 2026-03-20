import type { DossierLinkRole, DossierStatus } from "@/lib/dossiers/types";

export const dossierLinkTypeLabels = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  series: "Série",
} as const;

export const dossierStatusOrder: Record<DossierStatus, number> = {
  in_progress: 1,
  monitoring: 2,
  concluded: 3,
  archived: 4,
  draft: 5,
};

export const dossierLinkRoleOrder: Record<DossierLinkRole, number> = {
  lead: 1,
  evidence: 2,
  context: 3,
  followup: 4,
  archive: 5,
};

export function getDossierStatusSortOrder(status: string) {
  switch (status) {
    case "in_progress":
      return 1;
    case "monitoring":
      return 2;
    case "concluded":
    case "published":
      return 3;
    case "archived":
      return 4;
    case "draft":
      return 5;
    default:
      return 9;
  }
}

export function getDossierLinkTypeLabel(type: string) {
  return dossierLinkTypeLabels[type as keyof typeof dossierLinkTypeLabels] ?? type;
}

export function getDossierLinkRoleLabel(role: string) {
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

export function getDossierStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "in_progress":
      return "Em curso";
    case "monitoring":
      return "Monitoramento";
    case "concluded":
    case "published":
      return "Concluído";
    case "archived":
      return "Arquivado";
    default:
      return status;
  }
}

export function getDossierStatusTone(status: string) {
  switch (status) {
    case "in_progress":
      return "status-tone--hot";
    case "monitoring":
      return "status-tone--watch";
    case "concluded":
    case "published":
      return "status-tone--calm";
    case "archived":
      return "status-tone--muted";
    default:
      return "status-tone--draft";
  }
}

export function getDossierSectionOrder(type: string) {
  switch (type) {
    case "editorial":
      return 1;
    case "archive":
      return 2;
    case "memory":
      return 3;
    case "collection":
      return 4;
    case "series":
      return 5;
    default:
      return 9;
  }
}

export function getDossierLinkRoleOrder(role: string) {
  return dossierLinkRoleOrder[role as DossierLinkRole] ?? 9;
}

export function getDossierLinkHref(type: string, key: string) {
  switch (type) {
    case "editorial":
      return `/pautas/${key}`;
    case "memory":
      return `/memoria/${key}`;
    case "archive":
      return `/acervo/${key}`;
    case "collection":
      return `/acervo/colecoes/${key}`;
    case "series":
      return `/series/${key}`;
    default:
      return "/";
  }
}

export function getDossierLinkRef(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseDossierLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}
