import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { entryRouteMockItems, entryRouteItemMockItems } from "@/lib/entry-routes/mock";
import type { EntryRoute, EntryRouteItem } from "@/lib/entry-routes/types";
import { getEntryRouteSortOrder } from "@/lib/entry-routes/navigation";
import { buildEntryRouteLinkOptions, resolveEntryRouteItems, type EntryRouteResolutionContext } from "@/lib/entry-routes/resolve";

const publicRouteFields = "id, title, slug, excerpt, description, audience_label, featured, public_visibility, sort_order, status, created_at, updated_at, created_by, updated_by";
const internalRouteFields = publicRouteFields;
const publicItemFields = "id, route_id, item_type, item_key, role, sort_order, note, created_at, updated_at";
const internalItemFields = publicItemFields;

function sortRoutes(items: EntryRoute[]) {
  return [...items].sort((a, b) => {
    const aOrder = getEntryRouteSortOrder(a.status);
    const bOrder = getEntryRouteSortOrder(b.status);
    if (aOrder !== bOrder) return aOrder - bOrder;
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) return Number(b.featured) - Number(a.featured);
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function sortItems(items: EntryRouteItem[]) {
  return [...items].sort((a, b) => {
    if (a.role !== b.role) {
      const order = { start: 1, context: 2, proof: 3, deepen: 4, follow: 5 } as const;
      return (order[a.role as keyof typeof order] ?? 9) - (order[b.role as keyof typeof order] ?? 9);
    }
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getFallbackRoutes() {
  return sortRoutes(entryRouteMockItems.filter((route) => route.public_visibility && route.status !== "draft"));
}

function getFallbackItems(routeId: string) {
  return sortItems(entryRouteItemMockItems.filter((item) => item.route_id === routeId));
}

async function buildContext(): Promise<EntryRouteResolutionContext> {
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

export async function getPublishedEntryRoutes() {
  const supabase = createSupabasePublicClient();
  if (!supabase) return getFallbackRoutes();

  const { data, error } = await supabase
    .from("entry_routes")
    .select(publicRouteFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error || !data || data.length === 0) return getFallbackRoutes();
  return sortRoutes(data as EntryRoute[]);
}

export async function getPublishedEntryRouteBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  if (!supabase) return (await getPublishedEntryRoutes()).find((route) => route.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("entry_routes")
    .select(publicRouteFields)
    .eq("public_visibility", true)
    .neq("status", "draft")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return (await getPublishedEntryRoutes()).find((route) => route.slug === slug) ?? null;
  return data as EntryRoute;
}

export async function getPublishedEntryRouteItems(routeId: string) {
  const supabase = createSupabasePublicClient();
  if (!supabase) return getFallbackItems(routeId);

  const { data, error } = await supabase
    .from("entry_route_items")
    .select(publicItemFields)
    .eq("route_id", routeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return getFallbackItems(routeId);
  return sortItems(data as EntryRouteItem[]);
}

export async function getPublishedEntryRoutesWithItems() {
  const routes = await getPublishedEntryRoutes();
  const itemPairs = await Promise.all(routes.map(async (route) => [route.id, await getPublishedEntryRouteItems(route.id)] as const));
  return { routes, itemsById: new Map(itemPairs) };
}

export async function getResolvedPublishedEntryRouteBySlug(slug: string) {
  const route = await getPublishedEntryRouteBySlug(slug);
  if (!route) return null;

  const [items, context] = await Promise.all([getPublishedEntryRouteItems(route.id), buildContext()]);
  return { route, items: resolveEntryRouteItems(items, context), context };
}

export async function getInternalEntryRoutes(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("entry_routes").select(internalRouteFields).order("updated_at", { ascending: false });
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return sortRoutes((data ?? []) as EntryRoute[]);
}

export async function getInternalEntryRouteById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("entry_routes").select(internalRouteFields).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as EntryRoute | null) ?? null;
}

export async function getInternalEntryRouteBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("entry_routes").select(internalRouteFields).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as EntryRoute | null) ?? null;
}

export async function getInternalEntryRouteItems(routeId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("entry_route_items").select(internalItemFields).eq("route_id", routeId).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw error;
  return sortItems((data ?? []) as EntryRouteItem[]);
}

export async function getInternalEntryRouteContext() {
  const context = await buildContext();
  const links = buildEntryRouteLinkOptions(context);
  return { ...context, linkOptions: links };
}
