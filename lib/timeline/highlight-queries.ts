
import { timelineHighlightLinkMockItems, timelineHighlightMockItems } from "@/lib/timeline/highlight-mock";
import type { TimelineHighlight, TimelineHighlightLink } from "@/lib/timeline/highlights";
import { getTimelineHighlightStatusSortOrder } from "@/lib/timeline/highlights";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, highlight_type, date_label, year_start, year_end, period_label, lead_question, cover_image_url, featured, public_visibility, status, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, timeline_highlight_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at";

function sortHighlights(items: TimelineHighlight[]) {
  return [...items].sort((a, b) => {
    const aStatus = getTimelineHighlightStatusSortOrder(a.status);
    const bStatus = getTimelineHighlightStatusSortOrder(b.status);

    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function sortLinks(items: TimelineHighlightLink[]) {
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

function getFallbackHighlights() {
  return sortHighlights(timelineHighlightMockItems.filter((item) => item.public_visibility && item.status !== "draft"));
}

function getFallbackLinks(highlightId: string) {
  return sortLinks(timelineHighlightLinkMockItems.filter((link) => link.timeline_highlight_id === highlightId));
}

export async function getPublishedTimelineHighlights() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackHighlights();
  }

  const { data, error } = await supabase
    .from("timeline_highlights")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackHighlights();
  }

  return sortHighlights(data as TimelineHighlight[]);
}

export async function getPublishedTimelineHighlightBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedTimelineHighlights()).find((highlight) => highlight.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("timeline_highlights")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedTimelineHighlights()).find((highlight) => highlight.slug === slug) ?? null;
  }

  return data as TimelineHighlight;
}

export async function getPublishedTimelineHighlightById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedTimelineHighlights()).find((highlight) => highlight.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("timeline_highlights")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedTimelineHighlights()).find((highlight) => highlight.id === id) ?? null;
  }

  return data as TimelineHighlight;
}

export async function getPublishedTimelineHighlightLinks(highlightId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(highlightId);
  }

  const { data, error } = await supabase
    .from("timeline_highlight_links")
    .select(linkFields)
    .eq("timeline_highlight_id", highlightId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(highlightId);
  }

  return sortLinks(data as TimelineHighlightLink[]);
}

export async function getPublishedTimelineHighlightLinksByHighlightIds(highlightIds: string[]) {
  if (!highlightIds.length) {
    return new Map<string, TimelineHighlightLink[]>();
  }

  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return new Map(highlightIds.map((id) => [id, getFallbackLinks(id)] as const));
  }

  const { data, error } = await supabase
    .from("timeline_highlight_links")
    .select(linkFields)
    .in("timeline_highlight_id", highlightIds)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return new Map(highlightIds.map((id) => [id, getFallbackLinks(id)] as const));
  }

  const grouped = new Map<string, TimelineHighlightLink[]>();
  for (const link of sortLinks(data as TimelineHighlightLink[])) {
    const list = grouped.get(link.timeline_highlight_id) ?? [];
    list.push(link);
    grouped.set(link.timeline_highlight_id, list);
  }

  return grouped;
}

export async function getInternalTimelineHighlights(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("timeline_highlights").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortHighlights((data ?? []) as TimelineHighlight[]);
}

export async function getInternalTimelineHighlightById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("timeline_highlights").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as TimelineHighlight | null) ?? null;
}

export async function getInternalTimelineHighlightBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("timeline_highlights").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as TimelineHighlight | null) ?? null;
}

export async function getInternalTimelineHighlightLinks(highlightId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeline_highlight_links")
    .select(linkFields)
    .eq("timeline_highlight_id", highlightId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as TimelineHighlightLink[]);
}
