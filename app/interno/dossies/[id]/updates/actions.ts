"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalDossierById, getInternalDossierUpdateById } from "@/lib/dossiers/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DossierUpdateActionState = {
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

function revalidateDossierRoutes(dossierSlug: string, dossierId: string, updateId?: string) {
  revalidatePath("/dossies");
  revalidatePath(`/dossies/${dossierSlug}`);
  revalidatePath(`/interno/dossies/${dossierId}`);
  revalidatePath(`/interno/dossies/${dossierId}/updates`);

  if (updateId) {
    revalidatePath(`/interno/dossies/${dossierId}/updates/${updateId}`);
  }
}

export async function saveInvestigationDossierUpdateAction(_: DossierUpdateActionState, formData: FormData): Promise<DossierUpdateActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const dossierId = normalize(formData.get("dossier_id"));
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const body = normalize(formData.get("body"));
  const updateType = normalize(formData.get("update_type")) || "note";
  const published = toBool(formData.get("published"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase, user } = await ensureAdmin();

  if (!dossierId) {
    return { ok: false, message: "Dossiê inválido." };
  }

  if (!title) {
    return { ok: false, message: "Título é obrigatório." };
  }

  if (!body) {
    return { ok: false, message: "Corpo do update é obrigatório." };
  }

  const dossier = await getInternalDossierById(dossierId);
  if (!dossier) {
    return { ok: false, message: "Dossiê não encontrado." };
  }

  const normalizedSlug = slugify(slugInput || title);
  if (slugInput && !normalizedSlug) {
    return { ok: false, message: "Slug inválido." };
  }

  if (currentId) {
    const current = await getInternalDossierUpdateById(currentId);
    if (!current) {
      return { ok: false, message: "Update não encontrado." };
    }

    const publishedAt = published ? current.published_at || new Date().toISOString() : current.published_at;

    const { error } = await supabase
      .from("investigation_dossier_updates")
      .update({
        title,
        slug: normalizedSlug || null,
        excerpt: excerpt || null,
        body,
        update_type: updateType,
        published,
        published_at: publishedAt,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId)
      .eq("dossier_id", dossierId);

    if (error) {
      return { ok: false, message: "Não foi possível salvar o update." };
    }

    revalidateDossierRoutes(dossier.slug, dossier.id, currentId);
    return { ok: true, message: "Update atualizado." };
  }

  const { error } = await supabase.from("investigation_dossier_updates").insert({
    dossier_id: dossierId,
    title,
    slug: normalizedSlug || null,
    excerpt: excerpt || null,
    body,
    update_type: updateType,
    published,
    published_at: published ? new Date().toISOString() : null,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o update." };
  }

  revalidateDossierRoutes(dossier.slug, dossier.id);
  return { ok: true, message: "Update criado." };
}
