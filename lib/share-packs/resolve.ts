import type { SharePack, SharePackContext, SharePackLinkOption, SharePackResolved } from "@/lib/share-packs/types";
import {
  getSharePackContentHref,
  getSharePackContentTypeLabel,
  getSharePackCoverVariant,
  getSharePackPagePath,
  getSharePackReference,
  getSharePackStatusLabel,
} from "@/lib/share-packs/navigation";
import type { EditorialEdition } from "@/lib/editions/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { EditorialItem } from "@/lib/editorial/types";
import type { PatternRead } from "@/lib/patterns/types";

function uniqueOptions(options: SharePackLinkOption[]) {
  return Array.from(new Map(options.map((option) => [option.value, option])).values());
}

function pushOption(options: SharePackLinkOption[], type: string, key: string, label: string) {
  options.push({ value: getSharePackReference(type, key), label });
}

function labelWithExcerpt(title: string, excerpt: string | null) {
  return excerpt ? `${title} · ${excerpt}` : title;
}

function findEdition(context: SharePackContext, key: string) {
  return context.editions.find((item) => item.slug === key || item.id === key) ?? null;
}

function findCampaign(context: SharePackContext, key: string) {
  return context.campaigns.find((item) => item.slug === key || item.id === key) ?? null;
}

function findImpact(context: SharePackContext, key: string) {
  return context.impacts.find((item) => item.slug === key || item.id === key) ?? null;
}

function findDossier(context: SharePackContext, key: string) {
  return context.dossiers.find((item) => item.slug === key || item.id === key) ?? null;
}

function findPauta(context: SharePackContext, key: string) {
  return context.pautas.find((item) => item.slug === key || item.id === key) ?? null;
}

function findPattern(context: SharePackContext, key: string) {
  return context.patterns.find((item) => item.slug === key || item.id === key) ?? null;
}

function resolveByType(type: string, key: string, context: SharePackContext) {
  switch (type) {
    case "edicao":
      return findEdition(context, key);
    case "campanha":
      return findCampaign(context, key);
    case "dossie":
      return findDossier(context, key);
    case "impacto":
      return findImpact(context, key);
    case "pauta":
      return findPauta(context, key);
    case "padrao":
      return findPattern(context, key);
    default:
      return null;
  }
}

function getResolvedSummary(pack: SharePack, target: EditorialEdition | PublicCampaign | PublicImpact | InvestigationDossier | EditorialItem | PatternRead | null) {
  return pack.short_summary || (target && "excerpt" in target ? target.excerpt : null) || (target && "description" in target ? target.description : null) || null;
}

function getResolvedTitle(pack: SharePack, target: EditorialEdition | PublicCampaign | PublicImpact | InvestigationDossier | EditorialItem | PatternRead | null, fallbackKey: string) {
  return pack.title_override || target?.title || fallbackKey;
}

function getResolvedCaption(pack: SharePack, title: string, summary: string | null) {
  if (pack.share_caption) {
    return pack.share_caption;
  }

  if (summary) {
    return `Leia e compartilhe: ${title}. ${summary}`;
  }

  return `Leia e compartilhe: ${title}.`;
}

export function resolveSharePack(pack: SharePack, context: SharePackContext): SharePackResolved {
  const target = resolveByType(pack.content_type, pack.content_key, context);
  const title = getResolvedTitle(pack, target, pack.content_key);
  const summary = getResolvedSummary(pack, target);
  const caption = getResolvedCaption(pack, title, summary);
  const coverVariantResolved = (pack.cover_variant as SharePackResolved["coverVariantResolved"]) || getSharePackCoverVariant(pack.content_type);

  return {
    ...pack,
    href: getSharePackPagePath(pack.content_type, pack.content_key),
    contentHref: getSharePackContentHref(pack.content_type, pack.content_key),
    title,
    summary: summary || caption,
    caption,
    typeLabel: getSharePackContentTypeLabel(pack.content_type),
    statusLabel: getSharePackStatusLabel(pack.share_status),
    coverVariantResolved,
  };
}

export function resolveSharePacks(packs: SharePack[], context: SharePackContext) {
  return packs.map((pack) => resolveSharePack(pack, context));
}

export function sortSharePacks(items: SharePack[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function groupSharePacksByType(items: SharePackResolved[]) {
  return items.reduce<Record<string, SharePackResolved[]>>((groups, pack) => {
    const key = String(pack.content_type);
    groups[key] ||= [];
    groups[key].push(pack);
    return groups;
  }, {});
}

export function buildSharePackLinkOptions(context: SharePackContext) {
  const options: SharePackLinkOption[] = [];

  context.editions.forEach((item) => pushOption(options, "edicao", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.campaigns.forEach((item) => pushOption(options, "campanha", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.dossiers.forEach((item) => pushOption(options, "dossie", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.impacts.forEach((item) => pushOption(options, "impacto", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.pautas.forEach((item) => pushOption(options, "pauta", item.slug, labelWithExcerpt(item.title, item.excerpt)));
  context.patterns.forEach((item) => pushOption(options, "padrao", item.slug, labelWithExcerpt(item.title, item.excerpt)));

  return uniqueOptions(options).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}


