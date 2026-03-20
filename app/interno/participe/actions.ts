"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalParticipationPathById } from "@/lib/participation/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ParticipationActionState = {
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

function revalidateParticipationPaths(pathSlug: string, pathId: string) {
  revalidatePath("/participe");
  revalidatePath(`/participe/${pathSlug}`);
  revalidatePath("/interno/participe");
  revalidatePath("/interno/participe/novo");
  revalidatePath(`/interno/participe/${pathId}`);
}

export async function saveParticipationPathAction(_: ParticipationActionState, formData: FormData): Promise<ParticipationActionState> {
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
    const current = await getInternalParticipationPathById(currentId);
    if (!current) {
      return { ok: false, message: "Rota não encontrada." };
    }

    const { error } = await supabase
      .from("participation_paths")
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

    revalidateParticipationPaths(current.slug, current.id);
    return { ok: true, message: "Rota atualizada." };
  }

  const { error } = await supabase.from("participation_paths").insert({
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

  revalidateParticipationPaths(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Rota criada." };
}

export async function saveParticipationPathItemAction(_: ParticipationActionState, formData: FormData): Promise<ParticipationActionState> {
  const pathId = normalize(formData.get("path_id"));
  const currentId = normalize(formData.get("id")) || null;
  const itemRef = normalize(formData.get("item_ref"));
  const role = normalize(formData.get("role")) || "context";
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;
  const note = normalize(formData.get("note"));

  const { supabase } = await ensureAdmin();

  if (!pathId) {
    return { ok: false, message: "Rota inválida." };
  }

  const [itemType, ...rest] = itemRef.split(":");
  const itemKey = rest.join(":");
  if (!itemType || !itemKey) {
    return { ok: false, message: "Escolha uma peça válida." };
  }

  const payload = {
    path_id: pathId,
    item_type: itemType,
    item_key: itemKey,
    role,
    sort_order: sortOrder,
    note: note || null,
    updated_at: new Date().toISOString(),
  };

  let error = null;
  if (currentId) {
    ({ error } = await supabase.from("participation_path_items").update(payload).eq("id", currentId).eq("path_id", pathId));
  } else {
    ({ error } = await supabase.from("participation_path_items").insert(payload));
  }

  if (error) {
    return { ok: false, message: "Não foi possível salvar o passo." };
  }

  const path = await getInternalParticipationPathById(pathId);
  if (path) {
    revalidateParticipationPaths(path.slug, path.id);
  }

  return { ok: true, message: currentId ? "Passo atualizado." : "Passo adicionado." };
}

export async function removeParticipationPathItemAction(formData: FormData): Promise<void> {
  const pathId = normalize(formData.get("path_id"));
  const itemId = normalize(formData.get("item_id"));

  const { supabase } = await ensureAdmin();

  if (!pathId || !itemId) {
    return;
  }

  const { error } = await supabase.from("participation_path_items").delete().eq("id", itemId).eq("path_id", pathId);
  if (error) {
    return;
  }

  const path = await getInternalParticipationPathById(pathId);
  if (path) {
    revalidateParticipationPaths(path.slug, path.id);
  }
}