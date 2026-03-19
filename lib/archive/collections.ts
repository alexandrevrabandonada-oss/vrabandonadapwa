import { archiveCollectionMockItems } from "@/lib/archive/mock";
import type { ArchiveCollection } from "@/lib/archive/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, cover_image_url, public_visibility, featured, sort_order, created_at, updated_at, created_by, updated_by";

function sortArchiveCollections(items: ArchiveCollection[]) {
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

function getArchiveFallbackCollections() {
  return sortArchiveCollections(archiveCollectionMockItems.filter((collection) => collection.public_visibility));
}

export async function getPublishedArchiveCollections() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getArchiveFallbackCollections();
  }

  const { data, error } = await supabase
    .from("archive_collections")
    .select(publicFields)
    .eq("public_visibility", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getArchiveFallbackCollections();
  }

  return sortArchiveCollections(data as ArchiveCollection[]);
}

export async function getPublishedArchiveCollectionBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedArchiveCollections()).find((collection) => collection.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("archive_collections")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedArchiveCollections()).find((collection) => collection.slug === slug) ?? null;
  }

  return data as ArchiveCollection;
}

export async function getInternalArchiveCollections() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("archive_collections")
    .select(publicFields)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ArchiveCollection[]) ?? [];
}

export async function getInternalArchiveCollectionById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("archive_collections")
    .select(publicFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ArchiveCollection | null) ?? null;
}

export async function getInternalArchiveCollectionBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("archive_collections")
    .select(publicFields)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ArchiveCollection | null) ?? null;
}


