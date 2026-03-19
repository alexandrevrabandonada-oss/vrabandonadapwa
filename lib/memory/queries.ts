import { memoryMockItems } from "@/lib/memory/mock";
import type { MemoryItem } from "@/lib/memory/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";

const memoryFields =
  "id, slug, title, excerpt, body, memory_type, memory_collection, period_label, year_start, year_end, place_label, source_note, archive_status, highlight_in_memory, related_editorial_slug, related_series_slug, cover_image_url, created_at, updated_at";

function sortMemoryItems(items: MemoryItem[]) {
  return [...items].sort((a, b) => {
    if (a.highlight_in_memory !== b.highlight_in_memory) {
      return Number(b.highlight_in_memory) - Number(a.highlight_in_memory);
    }

    const aYear = a.year_start ?? 0;
    const bYear = b.year_start ?? 0;

    if (aYear !== bYear) {
      return bYear - aYear;
    }

    return new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime();
  });
}

export async function getPublishedMemoryItems() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return sortMemoryItems(memoryMockItems);
  }

  const { data, error } = await supabase
    .from("memory_items")
    .select(memoryFields)
    .order("highlight_in_memory", { ascending: false })
    .order("year_start", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return sortMemoryItems(memoryMockItems);
  }

  return sortMemoryItems(data as MemoryItem[]);
}

export async function getPublishedMemoryBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return memoryMockItems.find((item) => item.slug === slug) ?? null;
  }

  const { data, error } = await supabase.from("memory_items").select(memoryFields).eq("slug", slug).maybeSingle();

  if (error || !data) {
    return memoryMockItems.find((item) => item.slug === slug) ?? null;
  }

  return data as MemoryItem;
}

export async function getMemoryItemsByCollection(collectionSlug: string) {
  const items = await getPublishedMemoryItems();
  return items.filter((item) => item.memory_collection === collectionSlug);
}

export async function getMemoryItemsByPeriod(periodLabel: string) {
  const items = await getPublishedMemoryItems();
  return items.filter((item) => item.period_label === periodLabel);
}
