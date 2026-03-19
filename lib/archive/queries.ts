import { archiveAssetMockItems } from "@/lib/archive/mock";
import type { ArchiveAsset } from "@/lib/archive/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, memory_item_id, editorial_item_id, title, asset_type, file_url, thumb_url, source_label, source_date_label, approximate_year, place_label, rights_note, description, public_visibility, featured, sort_order, created_at, updated_at, created_by, updated_by";

const internalFields = `${publicFields}, file_path, thumb_path`;

function sortArchiveAssets(items: ArchiveAsset[]) {
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

function getArchiveFallbackItems() {
  return sortArchiveAssets(archiveAssetMockItems.filter((asset) => asset.public_visibility));
}

function filterPublicAssets(items: ArchiveAsset[], filter: { assetType?: string; memoryItemId?: string; editorialItemId?: string; place?: string; year?: number | null; }) {
  return items.filter((asset) => {
    if (filter.assetType && asset.asset_type !== filter.assetType) {
      return false;
    }

    if (filter.memoryItemId && asset.memory_item_id !== filter.memoryItemId) {
      return false;
    }

    if (filter.editorialItemId && asset.editorial_item_id !== filter.editorialItemId) {
      return false;
    }

    if (filter.place && asset.place_label !== filter.place) {
      return false;
    }

    if (filter.year && asset.approximate_year !== filter.year) {
      return false;
    }

    return true;
  });
}

export async function getPublishedArchiveAssets() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getArchiveFallbackItems();
  }

  const { data, error } = await supabase
    .from("archive_assets")
    .select(publicFields)
    .eq("public_visibility", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getArchiveFallbackItems();
  }

  return sortArchiveAssets(data as ArchiveAsset[]);
}

export async function getPublishedArchiveAssetById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedArchiveAssets()).find((asset) => asset.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("archive_assets")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedArchiveAssets()).find((asset) => asset.id === id) ?? null;
  }

  return data as ArchiveAsset;
}

export async function getPublishedArchiveAssetsByMemoryItemId(memoryItemId: string) {
  const items = await getPublishedArchiveAssets();
  return items.filter((asset) => asset.memory_item_id === memoryItemId && asset.public_visibility);
}

export async function getPublishedArchiveAssetsByEditorialItemId(editorialItemId: string) {
  const items = await getPublishedArchiveAssets();
  return items.filter((asset) => asset.editorial_item_id === editorialItemId && asset.public_visibility);
}

export async function getPublishedArchiveAssetsByType(assetType: string) {
  const items = await getPublishedArchiveAssets();
  return items.filter((asset) => asset.asset_type === assetType);
}

export async function getPublishedArchiveFilteredAssets(filter: { assetType?: string; memoryItemId?: string; editorialItemId?: string; place?: string; year?: number | null; }) {
  const items = await getPublishedArchiveAssets();
  return sortArchiveAssets(filterPublicAssets(items, filter));
}

export async function getInternalArchiveAssets(filters?: { memoryItemId?: string; editorialItemId?: string; visibility?: "all" | "public" | "private"; assetType?: string; }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("archive_assets")
    .select(internalFields)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.memoryItemId) {
    query = query.eq("memory_item_id", filters.memoryItemId);
  }

  if (filters?.editorialItemId) {
    query = query.eq("editorial_item_id", filters.editorialItemId);
  }

  if (filters?.visibility === "public") {
    query = query.eq("public_visibility", true);
  }

  if (filters?.visibility === "private") {
    query = query.eq("public_visibility", false);
  }

  if (filters?.assetType && filters.assetType !== "all") {
    query = query.eq("asset_type", filters.assetType);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []) as ArchiveAsset[];
}

export async function getInternalArchiveAssetById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("archive_assets")
    .select(internalFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ArchiveAsset | null) ?? null;
}

export async function getInternalArchiveAssetsByMemoryItemId(memoryItemId: string) {
  return getInternalArchiveAssets({ memoryItemId });
}
