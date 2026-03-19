"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildEditorialSlug, slugifyEditorialValue } from "@/lib/editorial/utils";
import { getEditorialByIntakeId, getInternalEditorialById } from "@/lib/editorial/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EditorialActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return value === "on";
}

export async function createEditorialDraftFromIntakeAction(formData: FormData) {
  const intakeId = normalize(formData.get("intake_submission_id"));
  if (!intakeId) {
    redirect("/interno/intake");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const existing = await getEditorialByIntakeId(intakeId);
  if (existing) {
    redirect(`/interno/editorial/${existing.id}`);
  }

  const { data: intake, error } = await supabase
    .from("intake_submissions")
    .select("id, category, title, location, safe_public_summary")
    .eq("id", intakeId)
    .maybeSingle();

  if (error || !intake) {
    redirect("/interno/intake");
  }

  const title = intake.safe_public_summary?.trim() || intake.title;
  const slug = buildEditorialSlug(title, intake.id.slice(0, 6));

  const { data, error: insertError } = await supabase
    .from("editorial_items")
    .insert({
      intake_submission_id: intake.id,
      title,
      slug,
      excerpt:
        intake.safe_public_summary?.trim() ||
        "Rascunho editorial derivado de material interno e ainda em revisão.",
      body: intake.safe_public_summary?.trim()
        ? `${intake.safe_public_summary.trim()}\n\nRascunho inicial criado a partir da triagem interna.`
        : "Rascunho em construção. Sanitizar, reescrever e contextualizar antes de publicar.",
      category: intake.category,
      neighborhood: intake.location || null,
      cover_image_url: null,
      published: false,
      editorial_status: "draft",
      featured: false,
      source_visibility_note: `Derivado da submissão interna ${intake.id}. Conteúdo sanitizado para camada pública.`,
      created_by: user.email || null,
      updated_by: user.email || null,
    })
    .select("id")
    .single();

  if (insertError || !data) {
    throw insertError ?? new Error("Failed to create editorial draft.");
  }

  revalidatePath("/interno/editorial");
  revalidatePath(`/interno/editorial/${data.id}`);
  redirect(`/interno/editorial/${data.id}`);
}

export async function saveEditorialItemAction(
  _: EditorialActionState,
  formData: FormData,
): Promise<EditorialActionState> {
  const id = normalize(formData.get("id"));
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const body = normalize(formData.get("body"));
  const category = normalize(formData.get("category"));
  const neighborhood = normalize(formData.get("neighborhood"));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
  const sourceVisibilityNote = normalize(formData.get("source_visibility_note"));
  const editorialStatus = normalize(formData.get("editorial_status"));
  const featured = toBool(formData.get("featured"));
  const published = toBool(formData.get("published")) || editorialStatus === "published";

  if (!id || !title || !slugInput || !excerpt || !body || !category || !editorialStatus) {
    return {
      ok: false,
      message: "Preencha os campos editoriais obrigatórios.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/interno/entrar");
  }

  const current = await getInternalEditorialById(id);

  const publishedAt = published
    ? current?.published_at ?? new Date().toISOString()
    : null;

  const { error } = await supabase
    .from("editorial_items")
    .update({
      title,
      slug: slugifyEditorialValue(slugInput),
      excerpt,
      body,
      category,
      neighborhood: neighborhood || null,
      cover_image_url: coverImageUrl || null,
      editorial_status: editorialStatus,
      featured,
      published,
      published_at: publishedAt,
      source_visibility_note: sourceVisibilityNote || null,
      updated_at: new Date().toISOString(),
      updated_by: user.email || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to save editorial item", error);
    return {
      ok: false,
      message: "Não foi possível salvar o item editorial agora.",
    };
  }

  revalidatePath("/interno/editorial");
  revalidatePath(`/interno/editorial/${id}`);
  revalidatePath("/pautas");
  revalidatePath(`/pautas/${slugifyEditorialValue(slugInput)}`);

  return {
    ok: true,
    message: published
      ? "Item salvo e marcado para publicação."
      : "Item salvo como rascunho interno.",
  };
}
