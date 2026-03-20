import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { participationPathItemMockItems, participationPathMockItems } from "@/lib/participation/mock";
import type { ParticipationPath, ParticipationPathItem } from "@/lib/participation/types";
import { participationStatusOrder } from "@/lib/participation/navigation";
import { buildParticipationLinkOptions, resolveParticipationItems, type ParticipationResolutionContext } from "@/lib/participation/resolve";

const publicPathFields = "id, title, slug, excerpt, description, audience_label, featured, public_visibility, sort_order, status, created_at, updated_at, created_by, updated_by";
const publicItemFields = "id, path_id, item_type, item_key, role, sort_order, note, created_at, updated_at";

function sortPaths(items: ParticipationPath[]) {
  return [...items].sort((a, b) => {
    const aOrder = participationStatusOrder[a.status as keyof typeof participationStatusOrder] ?? 9;
    const bOrder = participationStatusOrder[b.status as keyof typeof participationStatusOrder] ?? 9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) return Number(b.featured) - Number(a.featured);
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function sortItems(items: ParticipationPathItem[]) {
  return [...items].sort((a, b) => {
    const order = { start: 1, context: 2, proof: 3, deepen: 4, follow: 5 } as const;
    if (a.role !== b.role) return (order[a.role as keyof typeof order] ?? 9) - (order[b.role as keyof typeof order] ?? 9);
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getFallbackPaths() {
  return sortPaths(participationPathMockItems.filter((path) => path.public_visibility && path.status !== "draft"));
}

function getFallbackItems(pathId: string) {
  return sortItems(participationPathItemMockItems.filter((item) => item.path_id === pathId));
}

async function buildContext(): Promise<ParticipationResolutionContext> {
  const [editorialItems, dossiers, memoryItems, archiveAssets, archiveCollections, hubs] = await Promise.all([
    getPublishedEditorialItems(),
    getPublishedDossiers(),
    getPublishedMemoryItems(),
    getPublishedArchiveAssets(),
    getPublishedArchiveCollections(),
    getPublishedThemeHubs(),
  ]);

  return {
    editorialItems,
    dossiers,
    memoryItems,
    archiveAssets,
    archiveCollections,
    hubs,
    seriesCards: getEditorialSeriesCards(editorialItems),
  };
}

export async function getPublishedParticipationPaths() {
  const supabase = createSupabasePublicClient();
  if (!supabase) return getFallbackPaths();

  const { data, error } = await supabase
    .from("participation_paths")
    .select(publicPathFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error || !data || data.length === 0) return getFallbackPaths();
  return sortPaths(data as ParticipationPath[]);
}

export async function getPublishedParticipationPathBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  if (!supabase) return (await getPublishedParticipationPaths()).find((path) => path.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("participation_paths")
    .select(publicPathFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return (await getPublishedParticipationPaths()).find((path) => path.slug === slug) ?? null;
  return data as ParticipationPath;
}

export async function getPublishedParticipationPathItems(pathId: string) {
  const supabase = createSupabasePublicClient();
  if (!supabase) return getFallbackItems(pathId);

  const { data, error } = await supabase
    .from("participation_path_items")
    .select(publicItemFields)
    .eq("path_id", pathId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return getFallbackItems(pathId);
  return sortItems(data as ParticipationPathItem[]);
}

export async function getPublishedParticipationPathsWithItems() {
  const paths = await getPublishedParticipationPaths();
  const itemPairs = await Promise.all(paths.map(async (path) => [path.id, await getPublishedParticipationPathItems(path.id)] as const));
  return { paths, itemsById: new Map(itemPairs) };
}

export async function getResolvedPublishedParticipationPathBySlug(slug: string) {
  const path = await getPublishedParticipationPathBySlug(slug);
  if (!path) return null;

  const [items, context] = await Promise.all([getPublishedParticipationPathItems(path.id), buildContext()]);
  return { path, items: resolveParticipationItems(items, context), context };
}

export async function getInternalParticipationPaths(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("participation_paths").select(publicPathFields).order("updated_at", { ascending: false });
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return sortPaths((data ?? []) as ParticipationPath[]);
}

export async function getInternalParticipationPathById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("participation_paths").select(publicPathFields).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as ParticipationPath | null) ?? null;
}

export async function getInternalParticipationPathItems(pathId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("participation_path_items").select(publicItemFields).eq("path_id", pathId).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw error;
  return sortItems((data ?? []) as ParticipationPathItem[]);
}

export async function getInternalParticipationContext() {
  const context = await buildContext();
  return { ...context, linkOptions: buildParticipationLinkOptions(context) };
}