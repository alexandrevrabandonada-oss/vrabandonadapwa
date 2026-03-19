import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryCollection, MemoryItem } from "@/lib/memory/types";

export function getMemoryCollectionCount(collection: MemoryCollection, items: MemoryItem[]) {
  return items.filter((item) => item.memory_collection === collection.slug).length;
}

export function getMemoryFeaturedItem(items: MemoryItem[]) {
  return items.find((item) => item.highlight_in_memory) ?? items[0] ?? null;
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
