import { editorialMockItems } from "@/lib/editorial/mock";
import type { EditorialAuditLogEntry, EditorialItem } from "@/lib/editorial/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, body, category, primary_tag, secondary_tags, series_slug, series_title, reading_time, featured_order, cover_variant, neighborhood, cover_image_url, published, published_at, editorial_status, featured, created_at, updated_at";

const internalFields =
  "id, intake_submission_id, title, slug, excerpt, body, category, primary_tag, secondary_tags, series_slug, series_title, reading_time, featured_order, cover_variant, neighborhood, cover_image_url, cover_image_path, published, published_at, editorial_status, review_status, featured, publication_reason, sensitivity_check_passed, fact_check_note, last_reviewed_at, last_reviewed_by, published_by, archived_reason, source_visibility_note, created_at, updated_at, created_by, updated_by";

const auditFields = "id, editorial_item_id, actor_email, event_type, from_status, to_status, note, created_at";

function sortPublishedEditorialItems(items: EditorialItem[]) {
  return [...items].sort((a, b) => {
    const aOrder = a.featured_order ?? 9999;
    const bOrder = b.featured_order ?? 9999;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
  });
}

export async function getPublishedEditorialItems() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return sortPublishedEditorialItems(editorialMockItems);
  }

  const { data, error } = await supabase
    .from("editorial_items")
    .select(publicFields)
    .eq("published", true)
    .eq("editorial_status", "published")
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return sortPublishedEditorialItems(editorialMockItems);
  }

  return data as EditorialItem[];
}

export async function getPublishedEditorialBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return editorialMockItems.find((item) => item.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("editorial_items")
    .select(publicFields)
    .eq("published", true)
    .eq("editorial_status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return editorialMockItems.find((item) => item.slug === slug) ?? null;
  }

  return data as EditorialItem;
}

export async function getPublishedEditorialItemsBySeries(seriesSlug: string) {
  const items = await getPublishedEditorialItems();
  return items.filter((item) => item.series_slug === seriesSlug);
}

export async function getInternalEditorialItems(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("editorial_items")
    .select(internalFields)
    .order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("editorial_status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []) as EditorialItem[];
}

export async function getInternalEditorialById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("editorial_items")
    .select(internalFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorialItem | null) ?? null;
}

export async function getEditorialByIntakeId(intakeSubmissionId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("editorial_items")
    .select(internalFields)
    .eq("intake_submission_id", intakeSubmissionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorialItem | null) ?? null;
}

export async function getEditorialAuditLog(editorialItemId: string, limit = 10) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("editorial_audit_log")
    .select(auditFields)
    .eq("editorial_item_id", editorialItemId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as EditorialAuditLogEntry[];
}
