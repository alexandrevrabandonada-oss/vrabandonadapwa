import type { ArchiveAsset, ArchiveCollection } from "@/lib/archive/types";
import type { PatternReadLinkOption, PatternReadLinkType, PatternReadLink, PatternReadResolvedLink, PatternReadTimelineEntry } from "@/lib/patterns/types";
import { getPatternReadLinkHref, getPatternReadLinkRef, getPatternReadLinkRoleLabel, getPatternReadLinkRoleOrder, getPatternReadLinkTypeLabel } from "@/lib/patterns/navigation";
import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { PlaceHub } from "@/lib/territories/types";
import type { ActorHub } from "@/lib/actors/types";

export type PatternReadResolvedContext = {
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
};

function clean(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function uniqueOptions(options: PatternReadLinkOption[]) {
  return Array.from(new Map(options.map((option) => [option.value, option])).values());
}

function pushOption(options: PatternReadLinkOption[], type: string, key: string, label: string) {
  options.push({ value: getPatternReadLinkRef(type, key), label });
}

function labelWithExcerpt(title: string, excerpt: string | null) {
  return excerpt ? `${title} · ${excerpt}` : title;
}

function findEditorialItem(context: PatternReadResolvedContext, key: string) {
  return context.editorialItems.find((item) => item.slug === key || item.id === key) ?? null;
}

function findMemoryItem(context: PatternReadResolvedContext, key: string) {
  return context.memoryItems.find((item) => item.slug === key || item.id === key) ?? null;
}

function findArchiveAsset(context: PatternReadResolvedContext, key: string) {
  return context.archiveAssets.find((item) => item.id === key) ?? null;
}

function findArchiveCollection(context: PatternReadResolvedContext, key: string) {
  return context.archiveCollections.find((item) => item.slug === key || item.id === key) ?? null;
}

function findDossier(context: PatternReadResolvedContext, key: string) {
  return context.dossiers.find((item) => item.slug === key || item.id === key) ?? null;
}

function findCampaign(context: PatternReadResolvedContext, key: string) {
  return context.campaigns.find((item) => item.slug === key || item.id === key) ?? null;
}

function findImpact(context: PatternReadResolvedContext, key: string) {
  return context.impacts.find((item) => item.slug === key || item.id === key) ?? null;
}

function findThemeHub(context: PatternReadResolvedContext, key: string) {
  return context.themeHubs.find((item) => item.slug === key || item.id === key) ?? null;
}

function findPlaceHub(context: PatternReadResolvedContext, key: string) {
  return context.placeHubs.find((item) => item.slug === key || item.id === key) ?? null;
}

function findActorHub(context: PatternReadResolvedContext, key: string) {
  return context.actorHubs.find((item) => item.slug === key || item.id === key) ?? null;
}

function toResolvedLink(link: PatternReadLink, context: PatternReadResolvedContext): PatternReadResolvedLink {
  switch (link.link_type as PatternReadLinkType) {
    case "editorial": {
      const item = findEditorialItem(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt ?? null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "memory": {
      const item = findMemoryItem(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt ?? null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "archive": {
      const item = findArchiveAsset(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.description ?? item?.source_label ?? null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "collection": {
      const item = findArchiveCollection(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt ?? item?.description ?? null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "dossier": {
      const item = findDossier(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt || item?.description || null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "campaign": {
      const item = findCampaign(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt || item?.description || null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "impact": {
      const item = findImpact(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt || item?.description || null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "hub": {
      const item = findThemeHub(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt || item?.description || null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "territory": {
      const item = findPlaceHub(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt || item?.description || null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "actor": {
      const item = findActorHub(context, link.link_key);
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: item?.title ?? link.link_key,
        excerpt: item?.excerpt || item?.description || null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "page": {
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: link.link_key.replace(/^\//, ""),
        excerpt: link.timeline_note ?? null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: false,
      };
    }
    case "external":
    default:
      return {
        ...link,
        href: getPatternReadLinkHref(link.link_type, link.link_key),
        title: link.link_key,
        excerpt: link.timeline_note ?? null,
        typeLabel: getPatternReadLinkTypeLabel(link.link_type),
        roleLabel: getPatternReadLinkRoleLabel(link.link_role),
        external: true,
      };
  }
}

export function resolvePatternReadLinks(links: PatternReadLink[], context: PatternReadResolvedContext) {
  return links.map((link) => toResolvedLink(link, context));
}

export function groupPatternReadLinksByType(links: PatternReadResolvedLink[]) {
  return links.reduce<Record<string, PatternReadResolvedLink[]>>((groups, link) => {
    const key = String(link.link_type);
    groups[key] ||= [];
    groups[key].push(link);
    return groups;
  }, {});
}

export function groupPatternReadLinksByRole(links: PatternReadResolvedLink[]) {
  return links.reduce<Record<string, PatternReadResolvedLink[]>>((groups, link) => {
    const key = String(link.link_role);
    groups[key] ||= [];
    groups[key].push(link);
    return groups;
  }, {});
}

export function buildPatternReadTimeline(links: PatternReadResolvedLink[]) {
  return [...links]
    .sort((a, b) => {
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }

      const aYear = a.timeline_year ?? Number.POSITIVE_INFINITY;
      const bYear = b.timeline_year ?? Number.POSITIVE_INFINITY;
      if (aYear !== bYear) {
        return aYear - bYear;
      }

      const aRole = getPatternReadLinkRoleOrder(a.link_role);
      const bRole = getPatternReadLinkRoleOrder(b.link_role);
      if (aRole !== bRole) {
        return aRole - bRole;
      }

      return a.sort_order - b.sort_order;
    })
    .map((link): PatternReadTimelineEntry => ({
      ...link,
      yearLabel: clean(link.timeline_label) || (link.timeline_year ? String(link.timeline_year) : "sem data") || "sem data",
    }));
}

export function buildPatternReadLinkOptions(context: PatternReadResolvedContext): PatternReadLinkOption[] {
  const options: PatternReadLinkOption[] = [];

  context.editorialItems.forEach((item) => {
    pushOption(options, "editorial", item.slug, labelWithExcerpt(item.title, item.excerpt));
  });

  context.memoryItems.forEach((item) => {
    pushOption(options, "memory", item.slug, labelWithExcerpt(item.title, item.excerpt));
  });

  context.archiveAssets.forEach((item) => {
    pushOption(options, "archive", item.id, labelWithExcerpt(item.title, item.description || item.source_label));
  });

  context.archiveCollections.forEach((item) => {
    pushOption(options, "collection", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  context.dossiers.forEach((item) => {
    pushOption(options, "dossier", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  context.campaigns.forEach((item) => {
    pushOption(options, "campaign", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  context.impacts.forEach((item) => {
    pushOption(options, "impact", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  context.themeHubs.forEach((item) => {
    pushOption(options, "hub", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  context.placeHubs.forEach((item) => {
    pushOption(options, "territory", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  context.actorHubs.forEach((item) => {
    pushOption(options, "actor", item.slug, labelWithExcerpt(item.title, item.excerpt || item.description));
  });

  return uniqueOptions(options).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

