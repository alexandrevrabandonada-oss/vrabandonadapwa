import type { CampaignLinkResolved, CampaignLinkType, PublicCampaignLink } from "@/lib/campaigns/types";
import { getCampaignLinkRoleLabel, getCampaignLinkTypeLabel } from "@/lib/campaigns/navigation";

export function getCampaignLinkKey(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseCampaignLinkKey(value: string) {
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

export function resolveCampaignLinkHref(type: CampaignLinkType | string, key: string) {
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

export function resolveCampaignLink(item: PublicCampaignLink): CampaignLinkResolved {
  const href = resolveCampaignLinkHref(item.link_type, item.link_key);
  return {
    ...item,
    href,
    typeLabel: getCampaignLinkTypeLabel(item.link_type),
    roleLabel: getCampaignLinkRoleLabel(item.link_role),
    external: item.link_type === "external",
  };
}



