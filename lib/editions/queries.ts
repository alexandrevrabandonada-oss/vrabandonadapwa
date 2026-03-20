import { editionLinkMockItems, editionMockItems } from "@/lib/editions/mock";
import { getEditionStatusSortOrder } from "@/lib/editions/navigation";
import type { EditorialEdition, EditorialEditionLink } from "@/lib/editions/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const editionFields =
  "id, title, slug, excerpt, description, edition_type, period_label, published_at, cover_image_url, featured, public_visibility, status, sort_order, created_at, updated_at, created_by, updated_by";
const linkFields = "id, edition_id, link_type, link_key, link_role, note, featured, sort_order, created_at, updated_at";

function sortEditions(items: EditorialEdition[]) {
  return [...items].sort((a, b) => {
    const aStatus = getEditionStatusSortOrder(a.status);
    const bStatus = getEditionStatusSortOrder(b.status);

    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    const aPublishedAt = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bPublishedAt = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (aPublishedAt !== bPublishedAt) {
      return bPublishedAt - aPublishedAt;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function sortLinks(items: EditorialEditionLink[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getFallbackEditions() {
  return sortEditions(editionMockItems.filter((edition) => edition.public_visibility));
}

function getFallbackLinks(editionId: string) {
  return sortLinks(editionLinkMockItems.filter((link) => link.edition_id === editionId));
}

export async function getPublishedEditorialEditions() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackEditions();
  }

  const { data, error } = await supabase
    .from("editorial_editions")
    .select(editionFields)
    .eq("public_visibility", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data || data.length === 0) {
    return getFallbackEditions();
  }

  return sortEditions(data as EditorialEdition[]);
}

export async function getPublishedEditorialEditionBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedEditorialEditions()).find((edition) => edition.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("editorial_editions")
    .select(editionFields)
    .eq("public_visibility", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedEditorialEditions()).find((edition) => edition.slug === slug) ?? null;
  }

  return data as EditorialEdition;
}

export async function getPublishedEditorialEditionById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedEditorialEditions()).find((edition) => edition.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("editorial_editions")
    .select(editionFields)
    .eq("public_visibility", true)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedEditorialEditions()).find((edition) => edition.id === id) ?? null;
  }

  return data as EditorialEdition;
}

export async function getPublishedEditorialEditionLinks(editionId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(editionId);
  }

  const { data, error } = await supabase
    .from("editorial_edition_links")
    .select(linkFields)
    .eq("edition_id", editionId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(editionId);
  }

  return sortLinks(data as EditorialEditionLink[]);
}

export async function getInternalEditorialEditions(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("editorial_editions").select(editionFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortEditions((data ?? []) as EditorialEdition[]);
}

export async function getInternalEditorialEditionById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("editorial_editions").select(editionFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorialEdition | null) ?? null;
}

export async function getInternalEditorialEditionBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("editorial_editions").select(editionFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorialEdition | null) ?? null;
}

export async function getInternalEditorialEditionLinks(editionId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("editorial_edition_links")
    .select(linkFields)
    .eq("edition_id", editionId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as EditorialEditionLink[]);
}
