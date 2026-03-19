import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryCollection, MemoryItem } from "@/lib/memory/types";

export function getMemoryCollectionCount(collection: MemoryCollection, items: MemoryItem[]) {
  return items.filter((item) => item.collection_slug === collection.slug || item.memory_collection === collection.slug).length;
}

export function getMemoryFeaturedItem(items: MemoryItem[]) {
  return items.find((item) => item.featured || item.highlight_in_memory) ?? items[0] ?? null;
}

export function getRelatedEditorialForMemory(memory: MemoryItem, items: EditorialItem[]) {
  if (memory.related_editorial_slug) {
    return items.find((item) => item.slug === memory.related_editorial_slug) ?? null;
  }

  if (memory.related_series_slug) {
    return items.find((item) => item.series_slug === memory.related_series_slug) ?? null;
  }

  return items[0] ?? null;
}

export function getMemoryTimelineEntries(items: MemoryItem[]) {
  return items
    .filter((item) => item.timeline_rank !== null || item.featured || item.highlight_in_memory)
    .sort((a, b) => {
      const aRank = a.timeline_rank ?? 9999;
      const bRank = b.timeline_rank ?? 9999;

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      return (a.year_start ?? 0) - (b.year_start ?? 0);
    })
    .map((item) => ({
      label: item.collection_title || item.memory_collection,
      year: item.period_label || (item.year_start ? String(item.year_start) : ""),
      detail: item.excerpt,
      slug: item.slug,
    }));
}
