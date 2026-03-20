"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getInternalDossierById } from "@/lib/dossiers/queries";
import { parseDossierLinkRef } from "@/lib/dossiers/navigation";

export type DossierActionState = {
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

function revalidateDossier(slug: string) {
  revalidatePath("/dossies");
  revalidatePath(`/dossies/${slug}`);
  revalidatePath("/interno/dossies");
  revalidatePath("/interno/dossies/novo");
}

export async function saveInvestigationDossierAction(_: DossierActionState, formData: FormData): Promise<DossierActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const periodLabel = normalize(formData.get("period_label"));
  const territoryLabel = normalize(formData.get("territory_label"));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
  const status = normalize(formData.get("status"));
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
    const current = await getInternalDossierById(currentId);
    if (!current) {
      return { ok: false, message: "Dossiê não encontrado." };
    }

    const { error } = await supabase
      .from("investigation_dossiers")
      .update({
        title,
        excerpt: excerpt || null,
        description: description || null,
        lead_question: leadQuestion || null,
        period_label: periodLabel || null,
        territory_label: territoryLabel || null,
        cover_image_url: coverImageUrl || null,
        status: status || "draft",
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId);

    if (error) {
      return { ok: false, message: "Não foi possível salvar o dossiê." };
    }

    revalidateDossier(current.slug);
    revalidatePath(`/interno/dossies/${currentId}`);

    return { ok: true, message: "Dossiê atualizado." };
  }

  const { error } = await supabase.from("investigation_dossiers").insert({
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    lead_question: leadQuestion || null,
    period_label: periodLabel || null,
    territory_label: territoryLabel || null,
    cover_image_url: coverImageUrl || null,
    status: status || "draft",
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o dossiê." };
  }

  revalidateDossier(normalizedSlug);
  return { ok: true, message: "Dossiê criado." };
}

export async function addInvestigationDossierLinkAction(_: DossierActionState, formData: FormData): Promise<DossierActionState> {
  const dossierId = normalize(formData.get("dossier_id"));
  const linkRef = normalize(formData.get("link_ref"));
  const linkRole = normalize(formData.get("link_role")) || "context";
  const timelineYearRaw = normalize(formData.get("timeline_year"));
  const timelineYear = timelineYearRaw ? Number.parseInt(timelineYearRaw, 10) : null;
  const timelineLabel = normalize(formData.get("timeline_label"));
  const timelineNote = normalize(formData.get("timeline_note"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase } = await ensureAdmin();

  if (!dossierId) {
    return { ok: false, message: "Dossiê inválido." };
  }

  const parsed = parseDossierLinkRef(linkRef);
  if (!parsed) {
    return { ok: false, message: "Escolha uma peça relacionada válida." };
  }

  const { error } = await supabase.from("investigation_dossier_links").insert({
    dossier_id: dossierId,
    link_type: parsed.type,
    link_key: parsed.key,
    link_role: linkRole,
    timeline_year: Number.isNaN(timelineYear) ? null : timelineYear,
    timeline_label: timelineLabel || null,
    timeline_note: timelineNote || null,
    featured,
    sort_order: sortOrder,
  });

  if (error) {
    return { ok: false, message: "Não foi possível vincular a peça." };
  }

  const dossier = await getInternalDossierById(dossierId);
  if (dossier) {
    revalidateDossier(dossier.slug);
    revalidatePath(`/interno/dossies/${dossier.id}`);
  }

  return { ok: true, message: "Peça vinculada ao dossiê." };
}

export async function removeInvestigationDossierLinkAction(formData: FormData): Promise<void> {
  const dossierId = normalize(formData.get("dossier_id"));
  const linkId = normalize(formData.get("link_id"));

  const { supabase } = await ensureAdmin();

  if (!dossierId || !linkId) {
    return;
  }

  const { error } = await supabase.from("investigation_dossier_links").delete().eq("id", linkId).eq("dossier_id", dossierId);

  if (error) {
    return;
  }

  const dossier = await getInternalDossierById(dossierId);
  if (dossier) {
    revalidateDossier(dossier.slug);
    revalidatePath(`/interno/dossies/${dossier.id}`);
  }

  return;
}
