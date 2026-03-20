import type { ThemeHubLinkRole, ThemeHubLinkType, ThemeHubStatus } from "@/lib/hubs/types";
import { dossierLinkRoleLabels } from "@/lib/dossiers/types";

export const themeHubStatusOrder: Record<ThemeHubStatus, number> = {
  active: 1,
  monitoring: 2,
  archive: 3,
  draft: 4,
};

export const themeHubLinkRoleOrder: Record<ThemeHubLinkRole, number> = {
  lead: 1,
  evidence: 2,
  context: 3,
  followup: 4,
  archive: 5,
};

export const themeHubLinkTypeLabels = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  series: "Série",
} as const;

export function getThemeHubStatusSortOrder(status: string) {
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

export function getThemeHubStatusLabel(status: string) {
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

export function getThemeHubStatusTone(status: string) {
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

export function getThemeHubLinkTypeLabel(type: string) {
  return themeHubLinkTypeLabels[type as ThemeHubLinkType] ?? type;
}

export function getThemeHubLinkRoleLabel(role: string) {
  return dossierLinkRoleLabels[role as keyof typeof dossierLinkRoleLabels] ?? role;
}

export function getThemeHubLinkRoleOrder(role: string) {
  return themeHubLinkRoleOrder[role as ThemeHubLinkRole] ?? 9;
}

export function getThemeHubLinkHref(type: string, key: string) {
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
    case "series":
      return `/series/${key}`;
    default:
      return "/";
  }
}

export function getThemeHubLinkRef(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseThemeHubLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}
