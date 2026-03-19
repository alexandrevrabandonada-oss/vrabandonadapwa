import { memoryCollectionsFallback, memoryTimelineFallback } from "@/lib/memory/catalog";
import type { MemoryCollection, MemoryItem, MemoryTimelineEntry } from "@/lib/memory/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, slug, title, excerpt, body, memory_type, memory_collection, collection_slug, collection_title, period_label, year_start, year_end, place_label, source_note, archive_status, editorial_status, published, published_at, featured, highlight_in_memory, timeline_rank, related_editorial_slug, related_series_slug, cover_image_url, cover_image_path, created_at, updated_at, created_by, updated_by";

const collectionFields = "slug, title, description, display_order, featured, created_at, updated_at";

function sortPublishedMemoryItems(items: MemoryItem[]) {
  return [...items].sort((a, b) => {
    const aRank = a.timeline_rank ?? 9999;
    const bRank = b.timeline_rank ?? 9999;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.year_start !== b.year_start) {
      return (b.year_start ?? 0) - (a.year_start ?? 0);
    }

    return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
  });
}

export async function getPublishedMemoryItems() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return sortPublishedMemoryItems(memoryCollectionsFallback.map((collection, index) => ({
      id: `fallback-${collection.slug}`,
      slug: collection.slug,
      title: collection.title,
      excerpt: collection.description,
      body: collection.description,
      memory_type: "landmark",
      memory_collection: collection.slug,
      collection_slug: collection.slug,
      collection_title: collection.title,
      period_label: collection.title,
      year_start: null,
      year_end: null,
      place_label: null,
      source_note: null,
      archive_status: "active",
      editorial_status: "published",
      published: true,
      published_at: null,
      featured: Boolean(collection.featured),
      highlight_in_memory: Boolean(collection.featured),
      timeline_rank: index + 1,
      related_editorial_slug: null,
      related_series_slug: null,
      cover_image_url: null,
      cover_image_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null,
    })) as MemoryItem[]);
  }

  const { data, error } = await supabase
    .from("memory_items")
    .select(publicFields)
    .eq("published", true)
    .eq("editorial_status", "published")
    .order("timeline_rank", { ascending: true, nullsFirst: false })
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return sortPublishedMemoryItems(memoryCollectionsFallback.map((collection, index) => ({
      id: `fallback-${collection.slug}`,
      slug: collection.slug,
      title: collection.title,
      excerpt: collection.description,
      body: collection.description,
      memory_type: "landmark",
      memory_collection: collection.slug,
      collection_slug: collection.slug,
      collection_title: collection.title,
      period_label: collection.title,
      year_start: null,
      year_end: null,
      place_label: null,
      source_note: null,
      archive_status: "active",
      editorial_status: "published",
      published: true,
      published_at: null,
      featured: Boolean(collection.featured),
      highlight_in_memory: Boolean(collection.featured),
      timeline_rank: index + 1,
      related_editorial_slug: null,
      related_series_slug: null,
      cover_image_url: null,
      cover_image_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null,
    })) as MemoryItem[]);
  }

  return sortPublishedMemoryItems(data as MemoryItem[]);
}

export async function getPublishedMemoryBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedMemoryItems()).find((item) => item.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("memory_items")
    .select(publicFields)
    .eq("published", true)
    .eq("editorial_status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedMemoryItems()).find((item) => item.slug === slug) ?? null;
  }

  return data as MemoryItem;
}

export async function getPublishedMemoryItemsByCollection(collectionSlug: string) {
  const items = await getPublishedMemoryItems();
  return items.filter((item) => item.collection_slug === collectionSlug || item.memory_collection === collectionSlug);
}

export async function getPublishedMemoryCollections() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return memoryCollectionsFallback;
  }

  const { data, error } = await supabase
    .from("memory_collections")
    .select(collectionFields)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data || data.length === 0) {
    return memoryCollectionsFallback;
  }

  return data as MemoryCollection[];
}

export async function getPublishedMemoryTimeline() {
  const items = await getPublishedMemoryItems();
  const timeline: MemoryTimelineEntry[] = items
    .filter((item) => item.timeline_rank !== null || item.highlight_in_memory || item.featured)
    .map((item) => ({
      label: item.collection_title || item.memory_collection,
      year: item.period_label || (item.year_start ? String(item.year_start) : ""),
      detail: item.excerpt,
      slug: item.slug,
    }))
    .slice(0, 8);

  return timeline.length ? timeline : memoryTimelineFallback;
}

export async function getInternalMemoryItems(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("memory_items")
    .select(publicFields)
    .order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("editorial_status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []) as MemoryItem[];
}

export async function getInternalMemoryById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("memory_items")
    .select(publicFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as MemoryItem | null) ?? null;
}
