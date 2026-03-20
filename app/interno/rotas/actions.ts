"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalEntryRouteById } from "@/lib/entry-routes/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EntryRouteActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/interno/entrar");
  }

  return { supabase, user };
}

function revalidateEntryRoutePaths(routeSlug: string, routeId: string) {
  revalidatePath("/comecar");
  revalidatePath(`/comecar/${routeSlug}`);
  revalidatePath("/interno/rotas");
  revalidatePath("/interno/rotas/novo");
  revalidatePath(`/interno/rotas/${routeId}`);
}

export async function saveEntryRouteAction(_: EntryRouteActionState, formData: FormData): Promise<EntryRouteActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const audienceLabel = normalize(formData.get("audience_label"));
  const status = normalize(formData.get("status")) || "draft";
  const publicVisibility = toBool(formData.get("public_visibility"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase, user } = await ensureAdmin();

  if (!title) {
    return { ok: false, message: "Título é obrigatório." };
  }

  const normalizedSlug = slugify(slugInput || title);
  if (!normalizedSlug) {
    return { ok: false, message: "Slug inválido." };
  }

  if (currentId) {
    const current = await getInternalEntryRouteById(currentId);
    if (!current) {
      return { ok: false, message: "Rota não encontrada." };
    }

    const { error } = await supabase
      .from("entry_routes")
      .update({
        title,
        excerpt: excerpt || null,
        description: description || null,
        audience_label: audienceLabel || null,
        status,
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId);

    if (error) {
      return { ok: false, message: "Não foi possível salvar a rota." };
    }

    revalidateEntryRoutePaths(current.slug, current.id);
    return { ok: true, message: "Rota atualizada." };
  }

  const { error } = await supabase.from("entry_routes").insert({
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    audience_label: audienceLabel || null,
    status,
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar a rota." };
  }

  revalidateEntryRoutePaths(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Rota criada." };
}

export async function saveEntryRouteItemAction(_: EntryRouteActionState, formData: FormData): Promise<EntryRouteActionState> {
  const routeId = normalize(formData.get("route_id"));
  const currentId = normalize(formData.get("id")) || null;
  const itemRef = normalize(formData.get("item_ref"));
  const role = normalize(formData.get("role")) || "context";
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;
  const note = normalize(formData.get("note"));

  const { supabase } = await ensureAdmin();

  if (!routeId) {
    return { ok: false, message: "Rota inválida." };
  }

  const [itemType, ...rest] = itemRef.split(":");
  const itemKey = rest.join(":");
  if (!itemType || !itemKey) {
    return { ok: false, message: "Escolha uma peça válida." };
  }

  const payload = {
    route_id: routeId,
    item_type: itemType,
    item_key: itemKey,
    role,
    sort_order: sortOrder,
    note: note || null,
    updated_at: new Date().toISOString(),
  };

  let error = null;
  if (currentId) {
    ({ error } = await supabase.from("entry_route_items").update(payload).eq("id", currentId).eq("route_id", routeId));
  } else {
    ({ error } = await supabase.from("entry_route_items").insert(payload));
  }

  if (error) {
    return { ok: false, message: "Não foi possível salvar o passo." };
  }

  const route = await getInternalEntryRouteById(routeId);
  if (route) {
    revalidateEntryRoutePaths(route.slug, route.id);
  }

  return { ok: true, message: currentId ? "Passo atualizado." : "Passo adicionado." };
}

export async function removeEntryRouteItemAction(formData: FormData): Promise<void> {
  const routeId = normalize(formData.get("route_id"));
  const itemId = normalize(formData.get("item_id"));

  const { supabase } = await ensureAdmin();

  if (!routeId || !itemId) {
    return;
  }

  const { error } = await supabase.from("entry_route_items").delete().eq("id", itemId).eq("route_id", routeId);
  if (error) {
    return;
  }

  const route = await getInternalEntryRouteById(routeId);
  if (route) {
    revalidateEntryRoutePaths(route.slug, route.id);
  }
}
