import { placeHubMockItems, placeHubLinkMockItems } from "@/lib/territories/mock";
import type { PlaceHub, PlaceHubLink } from "@/lib/territories/types";
import { getPlaceHubStatusSortOrder } from "@/lib/territories/navigation";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, lead_question, place_type, parent_place_slug, territory_label, address_label, latitude, longitude, cover_image_url, featured, public_visibility, status, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, place_hub_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at";

function sortHubs(items: PlaceHub[]) {
  return [...items].sort((a, b) => {
    const aStatus = getPlaceHubStatusSortOrder(a.status);
    const bStatus = getPlaceHubStatusSortOrder(b.status);

    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function sortLinks(items: PlaceHubLink[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    const aYear = a.timeline_year ?? Number.POSITIVE_INFINITY;
    const bYear = b.timeline_year ?? Number.POSITIVE_INFINITY;
    if (aYear !== bYear) {
      return aYear - bYear;
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getFallbackHubs() {
  return sortHubs(placeHubMockItems.filter((hub) => hub.public_visibility && hub.status !== "draft"));
}

function getFallbackLinks(placeHubId: string) {
  return sortLinks(placeHubLinkMockItems.filter((link) => link.place_hub_id === placeHubId));
}

export async function getPublishedPlaceHubs() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackHubs();
  }

  const { data, error } = await supabase
    .from("place_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackHubs();
  }

  return sortHubs(data as PlaceHub[]);
}

export async function getPublishedPlaceHubBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedPlaceHubs()).find((hub) => hub.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("place_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedPlaceHubs()).find((hub) => hub.slug === slug) ?? null;
  }

  return data as PlaceHub;
}

export async function getPublishedPlaceHubById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedPlaceHubs()).find((hub) => hub.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("place_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedPlaceHubs()).find((hub) => hub.id === id) ?? null;
  }

  return data as PlaceHub;
}

export async function getPublishedPlaceHubLinks(placeHubId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(placeHubId);
  }

  const { data, error } = await supabase
    .from("place_hub_links")
    .select(linkFields)
    .eq("place_hub_id", placeHubId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(placeHubId);
  }

  return sortLinks(data as PlaceHubLink[]);
}

export async function getInternalPlaceHubs(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("place_hubs").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortHubs((data ?? []) as PlaceHub[]);
}

export async function getInternalPlaceHubById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("place_hubs").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PlaceHub | null) ?? null;
}

export async function getInternalPlaceHubBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("place_hubs").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PlaceHub | null) ?? null;
}

export async function getInternalPlaceHubLinks(placeHubId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("place_hub_links")
    .select(linkFields)
    .eq("place_hub_id", placeHubId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as PlaceHubLink[]);
}
