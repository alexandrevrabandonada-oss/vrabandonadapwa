import { investigationDossierLinkMockItems, investigationDossierMockItems } from "@/lib/dossiers/mock";
import type { DossierResolvedLink, InvestigationDossier, InvestigationDossierLink } from "@/lib/dossiers/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, status, cover_image_url, featured, public_visibility, sort_order, lead_question, period_label, territory_label, created_at, updated_at, created_by, updated_by";

const internalFields = publicFields;
const linkFields = "id, dossier_id, link_type, link_key, featured, sort_order, created_at, updated_at";

function sortDossiers(items: InvestigationDossier[]) {
  return [...items].sort((a, b) => {
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

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getFallbackDossiers() {
  return sortDossiers(investigationDossierMockItems.filter((dossier) => dossier.public_visibility));
}

function getFallbackLinks(dossierId: string) {
  return sortLinks(investigationDossierLinkMockItems.filter((link) => link.dossier_id === dossierId));
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
    .eq("status", "published")
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
    .eq("status", "published")
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
    .eq("status", "published")
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(dossierId);
  }

  return sortLinks(data as InvestigationDossierLink[]);
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

  return (data ?? []) as InvestigationDossier[];
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as InvestigationDossierLink[];
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

export function resolveDossierLinks(links: InvestigationDossierLink[]): DossierResolvedLink[] {
  return sortLinks(links)
    .map((link) => {
      const href = resolveDossierLinkHref(link.link_type, link.link_key);
      const title = link.link_key;
      const excerpt: string | null = null;

      return {
        id: link.id,
        link_type: link.link_type,
        link_key: link.link_key,
        title,
        excerpt,
        href,
        featured: link.featured,
        sort_order: link.sort_order,
      };
    })
    .filter(Boolean);
}

