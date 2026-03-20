import { actorHubMockItems, actorHubLinkMockItems } from "@/lib/actors/mock";
import type { ActorHub, ActorHubLink } from "@/lib/actors/types";
import { getActorHubStatusSortOrder } from "@/lib/actors/navigation";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, lead_question, actor_type, territory_label, cover_image_url, featured, public_visibility, status, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, actor_hub_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at";

function sortActors(items: ActorHub[]) {
  return [...items].sort((a, b) => {
    const aStatus = getActorHubStatusSortOrder(a.status);
    const bStatus = getActorHubStatusSortOrder(b.status);

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

function sortLinks(items: ActorHubLink[]) {
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

function getFallbackActors() {
  return sortActors(actorHubMockItems.filter((actor) => actor.public_visibility && actor.status !== "draft"));
}

function getFallbackLinks(actorHubId: string) {
  return sortLinks(actorHubLinkMockItems.filter((link) => link.actor_hub_id === actorHubId));
}

export async function getPublishedActorHubs() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackActors();
  }

  const { data, error } = await supabase
    .from("actor_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackActors();
  }

  return sortActors(data as ActorHub[]);
}

export async function getPublishedActorHubBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedActorHubs()).find((actor) => actor.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("actor_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedActorHubs()).find((actor) => actor.slug === slug) ?? null;
  }

  return data as ActorHub;
}

export async function getPublishedActorHubById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedActorHubs()).find((actor) => actor.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("actor_hubs")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedActorHubs()).find((actor) => actor.id === id) ?? null;
  }

  return data as ActorHub;
}

export async function getPublishedActorHubLinks(actorHubId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(actorHubId);
  }

  const { data, error } = await supabase
    .from("actor_hub_links")
    .select(linkFields)
    .eq("actor_hub_id", actorHubId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(actorHubId);
  }

  return sortLinks(data as ActorHubLink[]);
}

export async function getInternalActorHubs(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("actor_hubs").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortActors((data ?? []) as ActorHub[]);
}

export async function getInternalActorHubById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("actor_hubs").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ActorHub | null) ?? null;
}

export async function getInternalActorHubBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("actor_hubs").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ActorHub | null) ?? null;
}

export async function getInternalActorHubLinks(actorHubId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("actor_hub_links")
    .select(linkFields)
    .eq("actor_hub_id", actorHubId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as ActorHubLink[]);
}
