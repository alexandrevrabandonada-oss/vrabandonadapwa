import type { SharePackContentType, SharePackCoverVariant, SharePackFormat, SharePackStatus } from "@/lib/share-packs/types";

export const sharePackContentTypeLabels: Record<SharePackContentType, string> = {
  edicao: "Edição",
  campanha: "Campanha",
  dossie: "Dossiê",
  impacto: "Impacto",
  padrao: "Padrão",
  pauta: "Pauta",
};

export const sharePackStatusLabels: Record<SharePackStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivo",
};

export const sharePackCoverVariantLabels: Record<SharePackCoverVariant, string> = {
  steel: "Aço",
  ember: "Brasa",
  concrete: "Concreto",
  night: "Noite",
};

export const sharePackFormatLabels: Record<SharePackFormat, string> = {
  square: "Quadrado",
  vertical: "Vertical",
  both: "Ambos",
};

export function getSharePackContentTypeLabel(type: string) {
  switch (type) {
    case "edicao":
      return sharePackContentTypeLabels.edicao;
    case "campanha":
      return sharePackContentTypeLabels.campanha;
    case "dossie":
      return sharePackContentTypeLabels.dossie;
    case "impacto":
      return sharePackContentTypeLabels.impacto;
    case "padrao":
      return sharePackContentTypeLabels.padrao;
    case "pauta":
      return sharePackContentTypeLabels.pauta;
    default:
      return type;
  }
}

export function getSharePackStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return sharePackStatusLabels.draft;
    case "published":
      return sharePackStatusLabels.published;
    case "archived":
      return sharePackStatusLabels.archived;
    default:
      return status;
  }
}

export function getSharePackStatusTone(status: string) {
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

export function getSharePackCoverVariant(type: string): SharePackCoverVariant {
  switch (type) {
    case "campanha":
      return "ember";
    case "dossie":
      return "night";
    case "impacto":
      return "concrete";
    case "padrao":
      return "steel";
    case "pauta":
      return "concrete";
    case "edicao":
    default:
      return "steel";
  }
}

export function getSharePackFormatLabel(format: string) {
  switch (format) {
    case "square":
      return sharePackFormatLabels.square;
    case "vertical":
      return sharePackFormatLabels.vertical;
    case "both":
      return sharePackFormatLabels.both;
    default:
      return format;
  }
}

export function getSharePackContentHref(type: string, key: string) {
  switch (type) {
    case "edicao":
      return `/edicoes/${key}`;
    case "campanha":
      return `/campanhas/${key}`;
    case "dossie":
      return `/dossies/${key}`;
    case "impacto":
      return `/impacto/${key}`;
    case "padrao":
      return `/padroes/${key}`;
    case "pauta":
      return `/pautas/${key}`;
    default:
      return `/`;
  }
}

export function getSharePackPagePath(type: string, key: string) {
  return `/compartilhar/${type}/${key}`;
}

export function getSharePackOpenGraphImagePath(type: string, key: string) {
  return `/compartilhar/${type}/${key}/opengraph-image`;
}

export function getSharePackReference(type: string, key: string) {
  return `${type}:${key}`;
}

export function splitSharePackReference(reference: string) {
  const [contentType, ...rest] = reference.split(":");
  return {
    contentType: contentType || "",
    contentKey: rest.join(":") || "",
  };
}

export function getSharePackCardImagePath(type: string, key: string, format: SharePackFormat = "square") {
  return `/api/share/card?contentType=${encodeURIComponent(type)}&contentKey=${encodeURIComponent(key)}&format=${encodeURIComponent(format)}`;
}

export function getSharePackCardDownloadPath(type: string, key: string, format: SharePackFormat = "square") {
  return `${getSharePackCardImagePath(type, key, format)}&download=1`;
}
