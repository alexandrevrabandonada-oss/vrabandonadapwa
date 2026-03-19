import { editorialMockItems } from "@/lib/editorial/mock";
import type { EditorialItem } from "@/lib/editorial/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, intake_submission_id, title, slug, excerpt, body, category, neighborhood, cover_image_url, published, published_at, editorial_status, featured, source_visibility_note, created_at, updated_at, created_by, updated_by";

export async function getPublishedEditorialItems() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("editorial_items")
    .select(publicFields)
    .eq("published", true)
    .eq("editorial_status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return editorialMockItems;
  }

  return data as EditorialItem[];
}

export async function getPublishedEditorialBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
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

export async function getInternalEditorialItems(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("editorial_items")
    .select(publicFields)
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
    .select(publicFields)
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
    .select(publicFields)
    .eq("intake_submission_id", intakeSubmissionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorialItem | null) ?? null;
}
