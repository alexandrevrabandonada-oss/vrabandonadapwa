import type { ImpactLinkResolved, ImpactLinkType, PublicImpactLink } from "@/lib/impact/types";
import { getImpactLinkRoleLabel, getImpactLinkTypeLabel } from "@/lib/impact/navigation";

export function getImpactLinkKey(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseImpactLinkKey(value: string) {
  const [type, ...rest] = value.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}

function normalizeExternalHref(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("tel:")) {
    return value;
  }

  return value.startsWith("/") ? value : `https://${value}`;
}

export function resolveImpactLinkHref(type: ImpactLinkType | string, key: string) {
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
    case "hub":
      return `/eixos/${key}`;
    case "page":
      return `/${key}`;
    case "external":
      return normalizeExternalHref(key);
    default:
      return `/${key}`;
  }
}

export function resolveImpactLink(item: PublicImpactLink): ImpactLinkResolved {
  const href = resolveImpactLinkHref(item.link_type, item.link_key);
  return {
    ...item,
    href,
    typeLabel: getImpactLinkTypeLabel(item.link_type),
    roleLabel: getImpactLinkRoleLabel(item.link_role),
    external: item.link_type === "external",
  };
}
