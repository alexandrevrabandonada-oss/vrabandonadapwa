import type { ArchiveAsset, ArchiveCollection } from "@/lib/archive/types";
import type { EditorialItem, EditorialSeries } from "@/lib/editorial/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { ParticipationPathItem, ParticipationResolvedItem } from "@/lib/participation/types";
import { getParticipationItemRoleLabel, getParticipationItemRoleTone, getParticipationItemTypeLabel } from "@/lib/participation/navigation";

export type ParticipationLinkOption = {
  value: string;
  label: string;
};

export type ParticipationResolutionContext = {
  editorialItems: EditorialItem[];
  dossiers: InvestigationDossier[];
  memoryItems: MemoryItem[];
  archiveAssets: ArchiveAsset[];
  archiveCollections: ArchiveCollection[];
  hubs: ThemeHub[];
  seriesCards: EditorialSeries[];
};

function getFallbackHref(type: string, key: string) {
  switch (type) {
    case "page":
      return key;
    case "editorial":
      return `/pautas/${key}`;
    case "dossier":
      return `/dossies/${key}`;
    case "memory":
      return `/memoria/${key}`;
    case "archive":
      return `/acervo/${key}`;
    case "collection":
      return `/acervo/colecoes/${key}`;
    case "hub":
      return `/eixos/${key}`;
    case "series":
      return `/series/${key}`;
    case "external":
      return key;
    default:
      return "/";
  }
}

function sortResolvedItems(items: ParticipationResolvedItem[]) {
  return [...items].sort((a, b) => {
    const roleA = a.role === "start" ? 1 : a.role === "context" ? 2 : a.role === "proof" ? 3 : a.role === "deepen" ? 4 : 5;
    const roleB = b.role === "start" ? 1 : b.role === "context" ? 2 : b.role === "proof" ? 3 : b.role === "deepen" ? 4 : 5;
    if (roleA !== roleB) return roleA - roleB;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });
}

export function buildParticipationLinkOptions(context: ParticipationResolutionContext): ParticipationLinkOption[] {
  const pages = [
    { value: "/envie", label: "Página · Envie" },
    { value: "/apoie", label: "Página · Apoie" },
    { value: "/comecar", label: "Página · Começar" },
    { value: "/agora", label: "Página · Agora" },
    { value: "/memoria", label: "Página · Memória" },
    { value: "/acervo", label: "Página · Acervo" },
    { value: "/dossies", label: "Página · Dossiês" },
    { value: "/eixos", label: "Página · Eixos" },
  ];
  const editorial = context.editorialItems.map((item) => ({ value: `editorial:${item.slug}`, label: `Pauta · ${item.title}` }));
  const dossiers = context.dossiers.map((item) => ({ value: `dossier:${item.slug}`, label: `Dossiê · ${item.title}` }));
  const memory = context.memoryItems.map((item) => ({ value: `memory:${item.slug}`, label: `Memória · ${item.title}` }));
  const archive = context.archiveAssets.map((item) => ({ value: `archive:${item.id}`, label: `Acervo · ${item.title}` }));
  const collections = context.archiveCollections.map((item) => ({ value: `collection:${item.slug}`, label: `Coleção · ${item.title}` }));
  const hubs = context.hubs.map((item) => ({ value: `hub:${item.slug}`, label: `Eixo · ${item.title}` }));
  const series = context.seriesCards.map((item) => ({ value: `series:${item.slug}`, label: `Série · ${item.title}` }));

  return [...pages, ...editorial, ...dossiers, ...memory, ...archive, ...collections, ...hubs, ...series].sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveParticipationItem(item: ParticipationPathItem, context: ParticipationResolutionContext): ParticipationResolvedItem {
  let title = item.item_key;
  let excerpt: string | null = null;
  let href = getFallbackHref(item.item_type, item.item_key);
  const primaryLabel = getParticipationItemTypeLabel(item.item_type);
  let secondaryLabel: string | null = null;

  if (item.item_type === "page") {
    const pageLabels: Record<string, string> = {
      "/envie": "Canal de envio",
      "/apoie": "Apoio",
      "/comecar": "Rotas de entrada",
      "/agora": "Radar editorial",
      "/memoria": "Arquivo vivo",
      "/acervo": "Acervo público",
      "/dossies": "Dossiês vivos",
      "/eixos": "Eixos temáticos",
    };
    title = pageLabels[item.item_key] || item.item_key;
    href = item.item_key;
  }

  if (item.item_type === "editorial") {
    const found = context.editorialItems.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt;
      href = `/pautas/${found.slug}`;
      secondaryLabel = found.series_title || found.primary_tag || found.category;
    }
  }

  if (item.item_type === "dossier") {
    const found = context.dossiers.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt || found.description;
      href = `/dossies/${found.slug}`;
      secondaryLabel = found.lead_question || found.period_label || found.territory_label;
    }
  }

  if (item.item_type === "memory") {
    const found = context.memoryItems.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt;
      href = `/memoria/${found.slug}`;
      secondaryLabel = found.collection_title || found.memory_collection;
    }
  }

  if (item.item_type === "archive") {
    const found = context.archiveAssets.find((entry) => entry.id === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.description || found.source_label;
      href = `/acervo/${found.id}`;
      secondaryLabel = found.collection_slug || found.place_label || found.rights_note;
    }
  }

  if (item.item_type === "collection") {
    const found = context.archiveCollections.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt || found.description;
      href = `/acervo/colecoes/${found.slug}`;
      secondaryLabel = found.excerpt || found.description;
    }
  }

  if (item.item_type === "hub") {
    const found = context.hubs.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt || found.description;
      href = `/eixos/${found.slug}`;
      secondaryLabel = found.lead_question || found.excerpt || found.description;
    }
  }

  if (item.item_type === "series") {
    const found = context.seriesCards.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.description;
      href = `/series/${found.slug}`;
      secondaryLabel = found.axis;
    }
  }

  return {
    ...item,
    title,
    excerpt,
    href,
    primaryLabel,
    secondaryLabel,
    roleLabel: getParticipationItemRoleLabel(item.role),
    roleTone: getParticipationItemRoleTone(item.role),
  };
}

export function resolveParticipationItems(items: ParticipationPathItem[], context: ParticipationResolutionContext) {
  return sortResolvedItems(items.map((item) => resolveParticipationItem(item, context)));
}

export function groupParticipationItemsByRole(items: ParticipationResolvedItem[]) {
  return items.reduce<Partial<Record<string, ParticipationResolvedItem[]>>>((acc, item) => {
    const key = item.role;
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

export function getParticipationLeadItem(items: ParticipationResolvedItem[]) {
  return items.find((item) => item.role === "start") ?? items[0] ?? null;
}