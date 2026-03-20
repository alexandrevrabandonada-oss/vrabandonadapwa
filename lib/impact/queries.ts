import { impactLinkMockItems, impactMockItems } from "@/lib/impact/mock";
import { getImpactStatusSortOrder } from "@/lib/impact/navigation";
import type { PublicImpact, PublicImpactLink } from "@/lib/impact/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, lead_question, impact_type, status, date_label, happened_at, territory_label, cover_image_url, featured, public_visibility, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, impact_id, link_type, link_key, link_role, note, featured, sort_order, created_at, updated_at";

function sortImpacts(items: PublicImpact[]) {
  return [...items].sort((a, b) => {
    const aStatus = getImpactStatusSortOrder(a.status);
    const bStatus = getImpactStatusSortOrder(b.status);

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

function sortLinks(items: PublicImpactLink[]) {
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

function getFallbackImpacts() {
  return sortImpacts(impactMockItems.filter((impact) => impact.public_visibility));
}

function getFallbackLinks(impactId: string) {
  return sortLinks(impactLinkMockItems.filter((link) => link.impact_id === impactId));
}

export async function getPublishedImpacts() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackImpacts();
  }

  const { data, error } = await supabase
    .from("public_impacts")
    .select(publicFields)
    .eq("public_visibility", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackImpacts();
  }

  return sortImpacts(data as PublicImpact[]);
}

export async function getPublishedImpactBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedImpacts()).find((impact) => impact.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("public_impacts")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedImpacts()).find((impact) => impact.slug === slug) ?? null;
  }

  return data as PublicImpact;
}

export async function getPublishedImpactById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedImpacts()).find((impact) => impact.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("public_impacts")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedImpacts()).find((impact) => impact.id === id) ?? null;
  }

  return data as PublicImpact;
}

export async function getPublishedImpactLinks(impactId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(impactId);
  }

  const { data, error } = await supabase
    .from("public_impact_links")
    .select(linkFields)
    .eq("impact_id", impactId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(impactId);
  }

  return sortLinks(data as PublicImpactLink[]);
}

export async function getInternalImpacts(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("public_impacts").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortImpacts((data ?? []) as PublicImpact[]);
}

export async function getInternalImpactById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("public_impacts").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PublicImpact | null) ?? null;
}

export async function getInternalImpactBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("public_impacts").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PublicImpact | null) ?? null;
}

export async function getInternalImpactLinks(impactId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("public_impact_links")
    .select(linkFields)
    .eq("impact_id", impactId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as PublicImpactLink[]);
}

