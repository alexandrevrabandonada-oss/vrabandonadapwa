import { themeHubMockItems, themeHubLinkMockItems } from "@/lib/hubs/mock";
import type { ThemeHub, ThemeHubLink } from "@/lib/hubs/types";
import { getThemeHubStatusSortOrder } from "@/lib/hubs/navigation";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, lead_question, cover_image_url, featured, public_visibility, sort_order, status, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, theme_hub_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at";

function sortHubs(items: ThemeHub[]) {
  return [...items].sort((a, b) => {
    const aStatus = getThemeHubStatusSortOrder(a.status);
    const bStatus = getThemeHubStatusSortOrder(b.status);

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

function sortLinks(items: ThemeHubLink[]) {
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
  return sortHubs(themeHubMockItems.filter((hub) => hub.public_visibility && hub.status !== "draft"));
}

function getFallbackLinks(hubId: string) {
  return sortLinks(themeHubLinkMockItems.filter((link) => link.theme_hub_id === hubId));
}

export async function getPublishedThemeHubs() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackHubs();
  }

  const { data, error } = await supabase
    .from("theme_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackHubs();
  }

  return sortHubs(data as ThemeHub[]);
}

export async function getPublishedThemeHubBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedThemeHubs()).find((hub) => hub.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("theme_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedThemeHubs()).find((hub) => hub.slug === slug) ?? null;
  }

  return data as ThemeHub;
}

export async function getPublishedThemeHubById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedThemeHubs()).find((hub) => hub.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("theme_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedThemeHubs()).find((hub) => hub.id === id) ?? null;
  }

  return data as ThemeHub;
}

export async function getPublishedThemeHubLinks(themeHubId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(themeHubId);
  }

  const { data, error } = await supabase
    .from("theme_hub_links")
    .select(linkFields)
    .eq("theme_hub_id", themeHubId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(themeHubId);
  }

  return sortLinks(data as ThemeHubLink[]);
}

export async function getInternalThemeHubs(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("theme_hubs").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortHubs((data ?? []) as ThemeHub[]);
}

export async function getInternalThemeHubById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("theme_hubs").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ThemeHub | null) ?? null;
}

export async function getInternalThemeHubBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("theme_hubs").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ThemeHub | null) ?? null;
}

export async function getInternalThemeHubLinks(themeHubId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("theme_hub_links")
    .select(linkFields)
    .eq("theme_hub_id", themeHubId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as ThemeHubLink[]);
}
