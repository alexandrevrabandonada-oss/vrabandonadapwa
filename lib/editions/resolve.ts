import type { EditorialEditionLink, EditorialEditionLinkOption, EditorialEditionResolvedLink } from "@/lib/editions/types";
import { getEditionLinkHref, getEditionLinkRef, getEditionLinkRoleLabel, getEditionLinkRoleOrder, getEditionLinkTypeLabel } from "@/lib/editions/navigation";
import type { ArchiveAsset, ArchiveCollection } from "@/lib/archive/types";
import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { PlaceHub } from "@/lib/territories/types";
import type { ActorHub } from "@/lib/actors/types";
import type { PatternRead } from "@/lib/patterns/types";

export type EditionResolvedContext = {
  editorialItems: EditorialItem[];
  memoryItems: MemoryItem[];
  archiveAssets: ArchiveAsset[];
  archiveCollections: ArchiveCollection[];
  dossiers: InvestigationDossier[];
  campaigns: PublicCampaign[];
  impacts: PublicImpact[];
  themeHubs: ThemeHub[];
  placeHubs: PlaceHub[];
  actorHubs: ActorHub[];
  patternReads: PatternRead[];
};


function uniqueOptions(options: EditorialEditionLinkOption[]) {
  return Array.from(new Map(options.map((option) => [option.value, option])).values());
}

function pushOption(options: EditorialEditionLinkOption[], type: string, key: string, label: string) {
  options.push({ value: getEditionLinkRef(type, key), label });
}

function labelWithExcerpt(title: string, excerpt: string | null) {
  return excerpt ? `${title} · ${excerpt}` : title;
}

function findEditorialItem(context: EditionResolvedContext, key: string) {
  return context.editorialItems.find((item) => item.slug === key || item.id === key) ?? null;
}

function findMemoryItem(context: EditionResolvedContext, key: string) {
  return context.memoryItems.find((item) => item.slug === key || item.id === key) ?? null;
}

function findArchiveAsset(context: EditionResolvedContext, key: string) {
  return context.archiveAssets.find((item) => item.id === key) ?? null;
}

function findArchiveCollection(context: EditionResolvedContext, key: string) {
  return context.archiveCollections.find((item) => item.slug === key || item.id === key) ?? null;
}

function findDossier(context: EditionResolvedContext, key: string) {
  return context.dossiers.find((item) => item.slug === key || item.id === key) ?? null;
}

function findCampaign(context: EditionResolvedContext, key: string) {
  return context.campaigns.find((item) => item.slug === key || item.id === key) ?? null;
}

function findImpact(context: EditionResolvedContext, key: string) {
  return context.impacts.find((item) => item.slug === key || item.id === key) ?? null;
}

function findThemeHub(context: EditionResolvedContext, key: string) {
  return context.themeHubs.find((item) => item.slug === key || item.id === key) ?? null;
}

function findPlaceHub(context: EditionResolvedContext, key: string) {
  return context.placeHubs.find((item) => item.slug === key || item.id === key) ?? null;
}

function findActorHub(context: EditionResolvedContext, key: string) {
  return context.actorHubs.find((item) => item.slug === key || item.id === key) ?? null;
}

function findPatternRead(context: EditionResolvedContext, key: string) {
  return context.patternReads.find((item) => item.slug === key || item.id === key) ?? null;
}

export function resolveEditionLink(item: EditorialEditionLink, context: EditionResolvedContext): EditorialEditionResolvedLink {
  switch (item.link_type) {
    case "editorial": {
      const found = findEditorialItem(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "memory": {
      const found = findMemoryItem(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "archive": {
      const found = findArchiveAsset(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.description ?? found?.source_label ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "collection": {
      const found = findArchiveCollection(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt ?? found?.description ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "dossier": {
      const found = findDossier(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "campaign": {
      const found = findCampaign(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "impact": {
      const found = findImpact(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "hub": {
      const found = findThemeHub(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "territory": {
      const found = findPlaceHub(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "actor": {
      const found = findActorHub(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "pattern": {
      const found = findPatternRead(context, item.link_key);
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: found?.title ?? item.link_key,
        excerpt: found?.excerpt || found?.description || null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "radar": {
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: "Radar editorial",
        excerpt: item.note ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "page": {
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: item.link_key.replace(/^\//, ""),
        excerpt: item.note ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: false,
      };
    }
    case "external":
    default:
      return {
        ...item,
        href: getEditionLinkHref(item.link_type, item.link_key),
        title: item.link_key,
        excerpt: item.note ?? null,
        typeLabel: getEditionLinkTypeLabel(item.link_type),
        roleLabel: getEditionLinkRoleLabel(item.link_role),
        external: true,
      };
  }
}

export function resolveEditionLinks(links: EditorialEditionLink[], context: EditionResolvedContext) {
  return links.map((link) => resolveEditionLink(link, context));
}

export function groupEditionLinksByType(links: EditorialEditionResolvedLink[]) {
  return links.reduce<Record<string, EditorialEditionResolvedLink[]>>((groups, link) => {
    const key = String(link.link_type);
    groups[key] ||= [];
    groups[key].push(link);
    return groups;
  }, {});
}

export function groupEditionLinksByRole(links: EditorialEditionResolvedLink[]) {
  return links.reduce<Record<string, EditorialEditionResolvedLink[]>>((groups, link) => {
    const key = String(link.link_role);
    groups[key] ||= [];
    groups[key].push(link);
    return groups;
  }, {});
}

export function sortEditionLinks(links: EditorialEditionLink[]) {
  return [...links].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    const aRole = getEditionLinkRoleOrder(a.link_role);
    const bRole = getEditionLinkRoleOrder(b.link_role);
    if (aRole !== bRole) {
      return aRole - bRole;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export function buildEditionLinkOptions(context: EditionResolvedContext) {
  const options: EditorialEditionLinkOption[] = [];

  context.editorialItems.forEach((item) => pushOption(options, "editorial", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.memoryItems.forEach((item) => pushOption(options, "memory", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.archiveAssets.forEach((item) => pushOption(options, "archive", item.id, labelWithExcerpt(item.title, item.description || item.source_label)));
  context.archiveCollections.forEach((item) => pushOption(options, "collection", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.dossiers.forEach((item) => pushOption(options, "dossier", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.campaigns.forEach((item) => pushOption(options, "campaign", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.impacts.forEach((item) => pushOption(options, "impact", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.themeHubs.forEach((item) => pushOption(options, "hub", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.placeHubs.forEach((item) => pushOption(options, "territory", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.actorHubs.forEach((item) => pushOption(options, "actor", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));
  context.patternReads.forEach((item) => pushOption(options, "pattern", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description)));

  return uniqueOptions(options).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

