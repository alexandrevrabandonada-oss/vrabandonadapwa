import { dossierUpdateTypeLabels, type DossierUpdateType, type InvestigationDossierUpdate } from "@/lib/dossiers/types";

export function getDossierUpdateTypeLabel(type: string) {
  return dossierUpdateTypeLabels[type as DossierUpdateType] ?? type;
}

export function sortDossierUpdates(items: InvestigationDossierUpdate[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    const aPublishedAt = a.published_at ? new Date(a.published_at).getTime() : Number.POSITIVE_INFINITY;
    const bPublishedAt = b.published_at ? new Date(b.published_at).getTime() : Number.POSITIVE_INFINITY;

    if (aPublishedAt !== bPublishedAt) {
      return aPublishedAt - bPublishedAt;
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function groupDossierUpdatesByDossierId(items: InvestigationDossierUpdate[]) {
  return sortDossierUpdates(items).reduce<Map<string, InvestigationDossierUpdate[]>>((acc, item) => {
    const current = acc.get(item.dossier_id) ?? [];
    acc.set(item.dossier_id, [...current, item]);
    return acc;
  }, new Map());
}

export function groupDossierUpdatesByType(items: InvestigationDossierUpdate[]) {
  return items.reduce<Partial<Record<string, InvestigationDossierUpdate[]>>>((acc, item) => {
    const key = item.update_type;
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

export function getDossierUpdateYearLabel(item: InvestigationDossierUpdate) {
  const date = item.published_at || item.created_at;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getDossierUpdatePreviewText(item: InvestigationDossierUpdate) {
  return item.excerpt || item.body.slice(0, 180);
}

export function getDossierUpdateNarrativeLabel(type: string) {
  switch (type) {
    case "development":
      return "O que mudou";
    case "evidence":
      return "Prova nova";
    case "monitoring":
      return "Em acompanhamento";
    case "note":
      return "Observação";
    case "call":
      return "Convocação";
    case "correction":
      return "Correção";
    default:
      return getDossierUpdateTypeLabel(type);
  }
}

export function getDossierUpdateTone(type: string) {
  switch (type) {
    case "development":
      return "update-tone--hot";
    case "evidence":
      return "update-tone--calm";
    case "monitoring":
      return "update-tone--watch";
    case "note":
      return "update-tone--muted";
    case "call":
      return "update-tone--call";
    case "correction":
      return "update-tone--alert";
    default:
      return "update-tone--muted";
  }
}

export function getDossierLatestUpdate(items: InvestigationDossierUpdate[]) {
  return sortDossierUpdates(items)[0] ?? null;
}
