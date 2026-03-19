import type { EditorialItem } from "@/lib/editorial/types";

function scoreRelated(candidate: EditorialItem, current: EditorialItem) {
  let score = 0;

  if (candidate.id === current.id) {
    return -1;
  }

  if (candidate.series_slug && candidate.series_slug === current.series_slug) {
    score += 8;
  }

  if (candidate.primary_tag && candidate.primary_tag === current.primary_tag) {
    score += 5;
  }

  if (candidate.category === current.category) {
    score += 3;
  }

  const sharedTags = candidate.secondary_tags.filter((tag) => current.secondary_tags.includes(tag));
  score += sharedTags.length * 2;

  if (candidate.neighborhood && candidate.neighborhood === current.neighborhood) {
    score += 1;
  }

  return score;
}

export function getRelatedEditorialItems(items: EditorialItem[], current: EditorialItem, limit = 3) {
  return items
    .map((item) => ({ item, score: scoreRelated(item, current) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (b.item.featured_order ?? 9999) - (a.item.featured_order ?? 9999))
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getNextEditorialItem(items: EditorialItem[], current: EditorialItem) {
  const ordered = [...items].sort((a, b) => {
    const aOrder = a.featured_order ?? 9999;
    const bOrder = b.featured_order ?? 9999;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
  });

  const index = ordered.findIndex((item) => item.slug === current.slug);
  if (index === -1) {
    return ordered[0] ?? null;
  }

  return ordered[index + 1] ?? ordered[0] ?? null;
}

export function getSeriesEditorialItems(items: EditorialItem[], seriesSlug: string, excludeSlug?: string) {
  return items
    .filter((item) => item.series_slug === seriesSlug && item.slug !== excludeSlug)
    .sort((a, b) => (a.featured_order ?? 9999) - (b.featured_order ?? 9999));
}
