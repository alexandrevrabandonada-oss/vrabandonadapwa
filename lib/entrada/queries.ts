import { createSupabaseServerClient } from "@/lib/supabase/server";
import { editorialEntryMockItems } from "@/lib/entrada/mock";
import type { EditorialEntry, EditorialEntryStatus, EditorialEntryType } from "@/lib/entrada/types";

const internalFields =
  "id, entry_type, entry_status, target_surface, title, summary, details, file_url, file_path, file_name, source_label, year_label, approximate_year, place_label, territory_label, actor_label, axis_label, notes, featured, sort_order, published_at, created_at, updated_at, created_by, updated_by";

function sortEntries(items: EditorialEntry[]) {
  const statusOrder: Record<EditorialEntryStatus, number> = {
    published: 0,
    linked: 1,
    enriched: 2,
    ready_for_enrichment: 3,
    stored: 4,
    draft: 5,
    archived: 6,
  };

  return [...items].sort((a, b) => {
    const aOrder = a.featured ? -1 : 0;
    const bOrder = b.featured ? -1 : 0;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    const aStatus = statusOrder[a.entry_status as EditorialEntryStatus] ?? 99;
    const bStatus = statusOrder[b.entry_status as EditorialEntryStatus] ?? 99;
    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    const aDate = new Date(a.published_at ?? a.updated_at ?? a.created_at).getTime();
    const bDate = new Date(b.published_at ?? b.updated_at ?? b.created_at).getTime();
    if (aDate !== bDate) {
      return bDate - aDate;
    }

    return a.sort_order - b.sort_order;
  });
}

function applyFilters(items: EditorialEntry[], filters?: { status?: string; type?: string }) {
  return items.filter((entry) => {
    if (filters?.status && filters.status !== "all" && entry.entry_status !== filters.status) {
      return false;
    }

    if (filters?.type && filters.type !== "all" && entry.entry_type !== filters.type) {
      return false;
    }

    return true;
  });
}

async function fetchEntries() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("editorial_entries")
      .select(internalFields)
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return sortEntries(editorialEntryMockItems);
    }

    return sortEntries(data as EditorialEntry[]);
  } catch {
    return sortEntries(editorialEntryMockItems);
  }
}

export async function getInternalEditorialEntries(filters?: { status?: string; type?: string }) {
  const entries = await fetchEntries();
  return applyFilters(entries, filters);
}

export async function getInternalEditorialEntryById(id: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("editorial_entries").select(internalFields).eq("id", id).maybeSingle();

    if (error || !data) {
      return editorialEntryMockItems.find((item) => item.id === id) ?? null;
    }

    return data as EditorialEntry;
  } catch {
    return editorialEntryMockItems.find((item) => item.id === id) ?? null;
  }
}

export async function getInternalEditorialEntryCounts() {
  const entries = await fetchEntries();
  return entries.reduce<Record<EditorialEntryStatus | "total", number>>(
    (acc, entry) => {
      acc.total += 1;
      acc[entry.entry_status as EditorialEntryStatus] += 1;
      return acc;
    },
    { total: 0, draft: 0, stored: 0, ready_for_enrichment: 0, enriched: 0, linked: 0, published: 0, archived: 0 },
  );
}

export async function getInternalEditorialTypeCounts() {
  const entries = await fetchEntries();
  return entries.reduce<Record<EditorialEntryType | "total", number>>(
    (acc, entry) => {
      acc.total += 1;
      acc[entry.entry_type as EditorialEntryType] += 1;
      return acc;
    },
    { total: 0, post: 0, document: 0, image: 0 },
  );
}
