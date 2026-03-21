"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordEditorialAuditEvent } from "@/lib/editorial/audit";
import { buildEditorialSlug, slugifyEditorialValue } from "@/lib/editorial/utils";
import { suggestEditorialSeriesByCategory } from "@/lib/editorial/taxonomy";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { enrichmentDestinationTargets, type EnrichmentDestination } from "@/lib/enriquecimento/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
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

function destinationHref(destination: EnrichmentDestination, entryId: string) {
  const query = `entry_id=${encodeURIComponent(entryId)}`;

  switch (destination) {
    case "memoria":
      return `/interno/memoria/novo?${query}`;
    case "acervo":
      return `/interno/acervo/novo?${query}`;
    case "editorial":
      return `/interno/editorial`;
    case "dossie":
      return `/interno/dossies/novo?${query}`;
    case "campaign":
      return `/interno/campanhas/novo?${query}`;
    case "impacto":
      return `/interno/impacto/novo?${query}`;
    case "edition":
      return `/interno/edicoes/novo?${query}`;
  }
}

async function createEditorialDraftFromEntry(entryId: string, email: string | null) {
  const current = await getInternalEditorialEntryById(entryId);
  if (!current) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const category = current.axis_label || current.territory_label || current.entry_type;
  const series = suggestEditorialSeriesByCategory(category);
  const title = current.title || current.summary || "Peça editorial";
  const slug = buildEditorialSlug(title, current.id.slice(0, 6));
  const primaryTag = slugifyEditorialValue(current.axis_label || current.entry_type) || null;
  const secondaryTags = primaryTag ? [primaryTag] : [];

  const { data, error } = await supabase
    .from("editorial_items")
    .insert({
      intake_submission_id: null,
      title,
      slug,
      excerpt: current.summary || current.details || "Peça editorial derivada da fila de enriquecimento.",
      body: current.details || current.summary || "Rascunho inicial gerado pela fila de enriquecimento.",
      category,
      primary_tag: primaryTag,
      secondary_tags: secondaryTags,
      series_slug: series?.slug ?? null,
      series_title: series?.title ?? null,
      reading_time: 5,
      featured_order: null,
      cover_variant: series?.coverVariant ?? "concrete",
      neighborhood: current.territory_label || current.place_label || null,
      cover_image_url: null,
      cover_image_path: null,
      published: false,
      published_at: null,
      editorial_status: "draft",
      review_status: "pending",
      featured: false,
      publication_reason: null,
      sensitivity_check_passed: false,
      fact_check_note: null,
      last_reviewed_at: null,
      last_reviewed_by: null,
      published_by: null,
      archived_reason: null,
      source_visibility_note: `Derivado da entrada simplificada ${entryId}.`,
      created_by: email || null,
      updated_by: email || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create editorial draft from entry", error);
    return null;
  }

  await recordEditorialAuditEvent({
    editorialItemId: data.id,
    actorEmail: email || null,
    eventType: "draft_created",
    fromStatus: null,
    toStatus: "draft",
    note: `Rascunho derivado da entrada ${entryId} em ${now}.`,
  });

  revalidatePath("/interno/editorial");
  revalidatePath(`/interno/editorial/${data.id}`);
  return data.id;
}

export async function storeEntryAction(formData: FormData) {
  const entryId = normalize(formData.get("entry_id"));
  const returnUrl = normalize(formData.get("return_url")) || "/interno/enriquecer";

  if (!entryId) {
    redirect(returnUrl);
  }

  const current = await getInternalEditorialEntryById(entryId);
  if (!current) {
    redirect(returnUrl);
  }

  const { supabase, user } = await ensureAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("editorial_entries")
    .update({
      entry_status: "stored",
      target_surface: current.target_surface,
      updated_at: now,
      updated_by: user.email || null,
    })
    .eq("id", entryId);

  if (error) {
    console.error("Failed to store editorial entry", error);
  }

  revalidatePath("/interno/enriquecer");
  revalidatePath(`/interno/entrada/${entryId}`);
  redirect(returnUrl);
}

export async function prepareEntryEnrichmentAction(formData: FormData) {
  const entryId = normalize(formData.get("entry_id"));
  const destination = normalize(formData.get("destination")) as EnrichmentDestination;
  const returnUrl = normalize(formData.get("return_url")) || "/interno/enriquecer";

  if (!entryId || !destination) {
    redirect(returnUrl);
  }

  const current = await getInternalEditorialEntryById(entryId);
  if (!current) {
    redirect(returnUrl);
  }

  const { supabase, user } = await ensureAdmin();
  const now = new Date().toISOString();
  const targetSurface = enrichmentDestinationTargets[destination];
  const nextStatus = destination === "editorial" ? "linked" : destination === "memoria" || destination === "acervo" ? "linked" : "enriched";

  const { error } = await supabase
    .from("editorial_entries")
    .update({
      entry_status: nextStatus,
      target_surface: targetSurface,
      updated_at: now,
      updated_by: user.email || null,
    })
    .eq("id", entryId);

  if (error) {
    console.error("Failed to prepare editorial entry", error);
  }

  revalidatePath("/interno/enriquecer");
  revalidatePath(`/interno/entrada/${entryId}`);
  revalidatePath("/interno/entrada");

  if (destination === "editorial") {
    const createdId = await createEditorialDraftFromEntry(entryId, user.email || null);
    if (createdId) {
      redirect(`/interno/editorial/${createdId}`);
    }

    redirect(returnUrl);
  }

  redirect(destinationHref(destination, entryId));
}
