import { sharePackMockItems } from "@/lib/share-packs/mock";
import { sortSharePacks } from "@/lib/share-packs/resolve";
import type { SharePack } from "@/lib/share-packs/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, content_type, content_key, title_override, short_summary, share_caption, share_status, cover_variant, preferred_format, featured, public_visibility, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;

function getFallbackSharePacks() {
  return sortSharePacks(sharePackMockItems.filter((item) => item.public_visibility && item.share_status === "published"));
}

export async function getPublishedSharePacks() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackSharePacks();
  }

  const { data, error } = await supabase
    .from("share_packs")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("share_status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackSharePacks();
  }

  return sortSharePacks(data as SharePack[]);
}

export async function getPublishedSharePackByContent(contentType: string, contentKey: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedSharePacks()).find((pack) => pack.content_type === contentType && pack.content_key === contentKey) ?? null;
  }

  const { data, error } = await supabase
    .from("share_packs")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("share_status", "published")
    .eq("content_type", contentType)
    .eq("content_key", contentKey)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedSharePacks()).find((pack) => pack.content_type === contentType && pack.content_key === contentKey) ?? null;
  }

  return data as SharePack;
}

export async function getPublishedSharePackById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedSharePacks()).find((pack) => pack.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("share_packs")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("share_status", "published")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedSharePacks()).find((pack) => pack.id === id) ?? null;
  }

  return data as SharePack;
}

export async function getInternalSharePacks(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("share_packs").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("share_status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortSharePacks((data ?? []) as SharePack[]);
}

export async function getInternalSharePackById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("share_packs").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SharePack | null) ?? null;
}

export async function getInternalSharePackByContent(contentType: string, contentKey: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("share_packs")
    .select(internalFields)
    .eq("content_type", contentType)
    .eq("content_key", contentKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SharePack | null) ?? null;
}
