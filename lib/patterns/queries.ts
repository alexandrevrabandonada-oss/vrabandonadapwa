import { patternReadLinkMockItems, patternReadMockItems } from "@/lib/patterns/mock";
import type { PatternRead, PatternReadLink } from "@/lib/patterns/types";
import { getPatternReadStatusSortOrder } from "@/lib/patterns/navigation";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, pattern_type, lead_question, status, cover_image_url, featured, public_visibility, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, pattern_read_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at";

function sortPatternReads(items: PatternRead[]) {
  return [...items].sort((a, b) => {
    const aStatus = getPatternReadStatusSortOrder(a.status);
    const bStatus = getPatternReadStatusSortOrder(b.status);

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

function sortPatternReadLinks(items: PatternReadLink[]) {
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

function getFallbackPatterns() {
  return sortPatternReads(patternReadMockItems.filter((pattern) => pattern.public_visibility && pattern.status !== "draft"));
}

function getFallbackPatternLinks(patternReadId: string) {
  return sortPatternReadLinks(patternReadLinkMockItems.filter((link) => link.pattern_read_id === patternReadId));
}

export async function getPublishedPatternReads() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackPatterns();
  }

  const { data, error } = await supabase
    .from("pattern_reads")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackPatterns();
  }

  return sortPatternReads(data as PatternRead[]);
}

export async function getPublishedPatternReadBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedPatternReads()).find((pattern) => pattern.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("pattern_reads")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedPatternReads()).find((pattern) => pattern.slug === slug) ?? null;
  }

  return data as PatternRead;
}

export async function getPublishedPatternReadById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedPatternReads()).find((pattern) => pattern.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("pattern_reads")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedPatternReads()).find((pattern) => pattern.id === id) ?? null;
  }

  return data as PatternRead;
}

export async function getPublishedPatternReadLinks(patternReadId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackPatternLinks(patternReadId);
  }

  const { data, error } = await supabase
    .from("pattern_read_links")
    .select(linkFields)
    .eq("pattern_read_id", patternReadId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackPatternLinks(patternReadId);
  }

  return sortPatternReadLinks(data as PatternReadLink[]);
}

export async function getInternalPatternReads(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("pattern_reads").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortPatternReads((data ?? []) as PatternRead[]);
}

export async function getInternalPatternReadById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("pattern_reads").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PatternRead | null) ?? null;
}

export async function getInternalPatternReadBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("pattern_reads").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PatternRead | null) ?? null;
}

export async function getInternalPatternReadLinks(patternReadId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pattern_read_links")
    .select(linkFields)
    .eq("pattern_read_id", patternReadId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortPatternReadLinks((data ?? []) as PatternReadLink[]);
}
