import { investigationDossierLinkMockItems, investigationDossierMockItems, investigationDossierUpdateMockItems } from "@/lib/dossiers/mock";
import { getDossierStatusSortOrder } from "@/lib/dossiers/navigation";
import { groupDossierUpdatesByDossierId, sortDossierUpdates } from "@/lib/dossiers/updates";
import type { InvestigationDossier, InvestigationDossierLink, InvestigationDossierUpdate } from "@/lib/dossiers/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, status, cover_image_url, featured, public_visibility, sort_order, lead_question, period_label, territory_label, created_at, updated_at, created_by, updated_by";

const internalFields = publicFields;
const linkFields = "id, dossier_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at";
const updateFields =
  "id, dossier_id, title, slug, excerpt, body, update_type, published, published_at, featured, sort_order, created_at, updated_at, created_by, updated_by";

function sortDossiers(items: InvestigationDossier[]) {
  return [...items].sort((a, b) => {
    const aStatus = getDossierStatusSortOrder(a.status);
    const bStatus = getDossierStatusSortOrder(b.status);

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

function sortLinks(items: InvestigationDossierLink[]) {
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

function sortUpdates(items: InvestigationDossierUpdate[]) {
  return sortDossierUpdates(items);
}

function getFallbackDossiers() {
  return sortDossiers(investigationDossierMockItems.filter((dossier) => dossier.public_visibility && dossier.status !== "draft"));
}

function getFallbackLinks(dossierId: string) {
  return sortLinks(investigationDossierLinkMockItems.filter((link) => link.dossier_id === dossierId));
}

function getFallbackUpdates(dossierId: string) {
  return sortUpdates(investigationDossierUpdateMockItems.filter((update) => update.dossier_id === dossierId && update.published));
}

function isPublicDossierStatus(status: string) {
  return status !== "draft";
}

export async function getPublishedDossiers() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackDossiers();
  }

  const { data, error } = await supabase
    .from("investigation_dossiers")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackDossiers();
  }

  return sortDossiers(data as InvestigationDossier[]);
}

export async function getPublishedDossierBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedDossiers()).find((dossier) => dossier.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("investigation_dossiers")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedDossiers()).find((dossier) => dossier.slug === slug) ?? null;
  }

  return data as InvestigationDossier;
}

export async function getPublishedDossierById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedDossiers()).find((dossier) => dossier.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("investigation_dossiers")
    .select(publicFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedDossiers()).find((dossier) => dossier.id === id) ?? null;
  }

  return data as InvestigationDossier;
}

export async function getPublishedDossierLinks(dossierId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(dossierId);
  }

  const { data, error } = await supabase
    .from("investigation_dossier_links")
    .select(linkFields)
    .eq("dossier_id", dossierId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(dossierId);
  }

  return sortLinks(data as InvestigationDossierLink[]);
}

export async function getPublishedDossierUpdates(dossierId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackUpdates(dossierId);
  }

  const { data, error } = await supabase
    .from("investigation_dossier_updates")
    .select(updateFields)
    .eq("dossier_id", dossierId)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return getFallbackUpdates(dossierId);
  }

  return sortUpdates(data as InvestigationDossierUpdate[]);
}

export async function getPublishedDossierUpdatesByDossierIds(dossierIds: string[]) {
  if (!dossierIds.length) {
    return new Map<string, InvestigationDossierUpdate[]>();
  }

  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return groupDossierUpdatesByDossierId(
      investigationDossierUpdateMockItems.filter((update) => dossierIds.includes(update.dossier_id) && update.published),
    );
  }

  const { data, error } = await supabase
    .from("investigation_dossier_updates")
    .select(updateFields)
    .in("dossier_id", dossierIds)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return groupDossierUpdatesByDossierId(
      investigationDossierUpdateMockItems.filter((update) => dossierIds.includes(update.dossier_id) && update.published),
    );
  }

  return groupDossierUpdatesByDossierId(data as InvestigationDossierUpdate[]);
}

export async function getInternalDossiers(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("investigation_dossiers").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortDossiers((data ?? []) as InvestigationDossier[]);
}

export async function getInternalDossierById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("investigation_dossiers").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as InvestigationDossier | null) ?? null;
}

export async function getInternalDossierBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("investigation_dossiers").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as InvestigationDossier | null) ?? null;
}

export async function getInternalDossierLinks(dossierId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("investigation_dossier_links")
    .select(linkFields)
    .eq("dossier_id", dossierId)
    .order("featured", { ascending: false })
    .order("timeline_year", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as InvestigationDossierLink[]);
}

export async function getInternalDossierUpdates(dossierId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("investigation_dossier_updates")
    .select(updateFields)
    .eq("dossier_id", dossierId)
    .order("published", { ascending: false })
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return sortUpdates((data ?? []) as InvestigationDossierUpdate[]);
}

export async function getInternalDossierUpdateById(updateId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("investigation_dossier_updates")
    .select(updateFields)
    .eq("id", updateId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as InvestigationDossierUpdate | null) ?? null;
}

export function getDossierLinkKey(type: string, key: string) {
  return `${type}:${key}`;
}

export function parseDossierLinkKey(value: string) {
  const [type, ...rest] = value.split(":");
  const key = rest.join(":");

  if (!type || !key) {
    return null;
  }

  return { type, key };
}

export function resolveDossierLinkHref(type: string, key: string) {
  switch (type) {
    case "editorial":
      return `/pautas/${key}`;
    case "memory":
      return `/memoria/${key}`;
    case "archive":
      return `/acervo/${key}`;
    case "collection":
      return `/acervo/colecoes/${key}`;
    case "series":
      return `/series/${key}`;
    default:
      return "/";
  }
}

export function isPublishedDossierStatus(status: string) {
  return isPublicDossierStatus(status);
}
