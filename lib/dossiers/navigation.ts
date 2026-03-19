import type { DossierLinkType } from "@/lib/dossiers/types";

export const dossierLinkTypeLabels: Record<DossierLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  series: "Série",
};

export function getDossierLinkTypeLabel(type: string) {
  return dossierLinkTypeLabels[type as DossierLinkType] ?? type;
}

export function getDossierStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "in_progress":
      return "Em curso";
    case "published":
      return "Publicado";
    case "archived":
      return "Arquivado";
    default:
      return status;
  }
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
