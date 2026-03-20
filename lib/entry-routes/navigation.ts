import type { EntryRouteItemRole, EntryRouteItemType, EntryRouteStatus } from "@/lib/entry-routes/types";

export const entryRouteStatusOrder: Record<EntryRouteStatus, number> = {
  active: 1,
  archive: 2,
  draft: 3,
};

export const entryRouteItemRoleOrder: Record<EntryRouteItemRole, number> = {
  start: 1,
  context: 2,
  proof: 3,
  deepen: 4,
  follow: 5,
};

export const entryRouteItemTypeLabels: Record<EntryRouteItemType, string> = {
  editorial: "Pauta",
  dossier: "Dossiê",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  hub: "Eixo",
  series: "Série",
};

export function getEntryRouteStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "active":
      return "Ativa";
    case "archive":
      return "Arquivo";
    default:
      return status;
  }
}

export function getEntryRouteStatusTone(status: string) {
  switch (status) {
    case "active":
      return "status-tone--hot";
    case "archive":
      return "status-tone--calm";
    default:
      return "status-tone--draft";
  }
}

export function getEntryRouteItemRoleLabel(role: string) {
  switch (role) {
    case "start":
      return "Comece por aqui";
    case "context":
      return "Contexto";
    case "proof":
      return "Prova";
    case "deepen":
      return "Aprofunde";
    case "follow":
      return "Acompanhe";
    default:
      return role;
  }
}

export function getEntryRouteItemRoleTone(role: string) {
  switch (role) {
    case "start":
      return "status-tone--hot";
    case "context":
      return "status-tone--watch";
    case "proof":
      return "status-tone--calm";
    case "deepen":
      return "status-tone--muted";
    case "follow":
      return "status-tone--alert";
    default:
      return "status-tone--muted";
  }
}

export function getEntryRouteItemTypeLabel(type: string) {
  return entryRouteItemTypeLabels[type as EntryRouteItemType] ?? type;
}

export function getEntryRouteSectionLabel(role: string) {
  return getEntryRouteItemRoleLabel(role);
}

export function getEntryRouteSortOrder(status: string) {
  switch (status) {
    case "active":
      return 1;
    case "archive":
      return 2;
    case "draft":
      return 3;
    default:
      return 9;
  }
}
