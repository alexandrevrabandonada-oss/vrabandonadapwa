"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordEditorialAuditEvent, resolveEditorialAuditEventType } from "@/lib/editorial/audit";
import { buildEditorialSlug, slugifyEditorialValue } from "@/lib/editorial/utils";
import { getEditorialByIntakeId, getInternalEditorialById } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug, suggestEditorialSeriesByCategory } from "@/lib/editorial/taxonomy";
import { editorialCoverVariants } from "@/lib/editorial/types";
import { removeEditorialCover, uploadEditorialCover } from "@/lib/media/editorial";
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

function parseNumber(value: string, fallback: number | null = null) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseTags(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => slugifyEditorialValue(tag))
    .filter(Boolean);
}

function formatChecklistMessage(missing: string[]) {
  if (missing.length === 0) {
    return "";
  }

  if (missing.length === 1) {
    return missing[0];
  }

  return `${missing.slice(0, -1).join(", ")} e ${missing[missing.length - 1]}`;
}

function validatePublishingChecklist(formData: FormData) {
  const missing: string[] = [];

  if (!toBool(formData.get("check_personal_data_removed"))) {
    missing.push("remover dados pessoais ou sensíveis");
  }

  if (!toBool(formData.get("check_sanitized"))) {
    missing.push("confirmar que o texto está sanitizado");
  }

  if (!toBool(formData.get("check_no_private_contact"))) {
    missing.push("confirmar que não há contato privado exposto");
  }

  if (!toBool(formData.get("check_editorial_fit"))) {
    missing.push("confirmar que a publicação faz sentido editorial");
  }

  return missing;
}

function getUploadedFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

async function applyCoverUpdate(params: {
  itemId: string;
  currentPath: string | null;
  currentUrl: string | null;
  formData: FormData;
}) {
  const coverImageFile = getUploadedFile(params.formData.get("cover_image_file"));
  const coverImageUrlInput = normalize(params.formData.get("cover_image_url"));
  const coverImageClear = toBool(params.formData.get("cover_image_clear"));

  if (coverImageClear) {
    if (params.currentPath) {
      await removeEditorialCover(params.currentPath);
    }

    return { cover_image_url: null, cover_image_path: null };
  }

  if (coverImageFile) {
    const uploaded = await uploadEditorialCover(coverImageFile, params.itemId);

    if (params.currentPath && params.currentPath !== uploaded.path) {
      await removeEditorialCover(params.currentPath);
    }

    return { cover_image_url: uploaded.url, cover_image_path: uploaded.path };
  }

  if (coverImageUrlInput && coverImageUrlInput !== params.currentUrl) {
    if (params.currentPath) {
      await removeEditorialCover(params.currentPath);
    }

    return { cover_image_url: coverImageUrlInput, cover_image_path: null };
  }

  return {
    cover_image_url: params.currentUrl,
    cover_image_path: params.currentPath,
  };
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
  const now = new Date().toISOString();
  const suggestedSeries = suggestEditorialSeriesByCategory(intake.category);
  const primaryTag = slugifyEditorialValue(intake.category);

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
      primary_tag: primaryTag || null,
      secondary_tags: primaryTag ? [primaryTag] : [],
      series_slug: suggestedSeries?.slug ?? null,
      series_title: suggestedSeries?.title ?? null,
      reading_time: 5,
      featured_order: null,
      cover_variant: suggestedSeries?.coverVariant ?? "concrete",
      neighborhood: intake.location || null,
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
      source_visibility_note: `Derivado da submissão interna ${intake.id}. Conteúdo sanitizado para camada pública.`,
      created_by: user.email || null,
      updated_by: user.email || null,
    })
    .select("id")
    .single();

  if (insertError || !data) {
    throw insertError ?? new Error("Failed to create editorial draft.");
  }

  await recordEditorialAuditEvent({
    editorialItemId: data.id,
    actorEmail: user.email || null,
    eventType: "draft_created",
    fromStatus: null,
    toStatus: "draft",
    note: `Rascunho criado a partir da submissão ${intake.id} em ${now}.`,
  });

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
  const primaryTag = normalize(formData.get("primary_tag"));
  const secondaryTagsInput = normalize(formData.get("secondary_tags"));
  const seriesSlugInput = normalize(formData.get("series_slug"));
  const seriesTitleInput = normalize(formData.get("series_title"));
  const coverVariantInput = normalize(formData.get("cover_variant"));
  const readingTimeInput = normalize(formData.get("reading_time"));
  const featuredOrderInput = normalize(formData.get("featured_order"));
  const neighborhood = normalize(formData.get("neighborhood"));
  const sourceVisibilityNote = normalize(formData.get("source_visibility_note"));
  const editorialStatus = normalize(formData.get("editorial_status"));
  const reviewStatus = normalize(formData.get("review_status"));
  const publicationReason = normalize(formData.get("publication_reason"));
  const factCheckNote = normalize(formData.get("fact_check_note"));
  const archivedReason = normalize(formData.get("archived_reason"));
  const featured = toBool(formData.get("featured"));
  const sensitivityCheckPassed = toBool(formData.get("sensitivity_check_passed"));
  const published = editorialStatus === "published";
  const readingTime = parseNumber(readingTimeInput, 5) ?? 5;
  const featuredOrder = parseNumber(featuredOrderInput, null);
  const coverVariant = editorialCoverVariants.includes(coverVariantInput as (typeof editorialCoverVariants)[number])
    ? coverVariantInput
    : "concrete";
  const secondaryTags = parseTags(secondaryTagsInput);
  const normalizedSeries = seriesSlugInput ? getEditorialSeriesBySlug(seriesSlugInput) : null;
  const seriesSlug = normalizedSeries?.slug ?? (seriesSlugInput || null);
  const seriesTitle = normalizedSeries?.title ?? (seriesTitleInput || null);

  if (!id || !title || !slugInput || !excerpt || !body || !category || !editorialStatus || !reviewStatus) {
    return {
      ok: false,
      message: "Preencha os campos editoriais obrigatórios.",
    };
  }

  if (published) {
    const missingChecklist = validatePublishingChecklist(formData);
    if (!publicationReason || !factCheckNote || !sensitivityCheckPassed || missingChecklist.length > 0) {
      const pieces = [];
      if (!publicationReason) {
        pieces.push("motivo curto de publicação");
      }
      if (!factCheckNote) {
        pieces.push("nota de checagem");
      }
      if (!sensitivityCheckPassed) {
        pieces.push("confirmação de sigilo");
      }
      if (missingChecklist.length > 0) {
        pieces.push(formatChecklistMessage(missingChecklist));
      }

      return {
        ok: false,
        message: `Antes de publicar, conclua: ${pieces.join("; ")}.`,
      };
    }

    if (reviewStatus !== "reviewed") {
      return {
        ok: false,
        message: "Para publicar, marque o item como revisado.",
      };
    }
  }

  if (editorialStatus === "archived" && !archivedReason) {
    return {
      ok: false,
      message: "Explique por que o item foi arquivado.",
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
  if (!current) {
    return {
      ok: false,
      message: "Item editorial não encontrado.",
    };
  }

  let coverImageUrl = current.cover_image_url;
  let coverImagePath = current.cover_image_path;

  try {
    const coverUpdate = await applyCoverUpdate({
      itemId: id,
      currentPath: current.cover_image_path,
      currentUrl: current.cover_image_url,
      formData,
    });

    coverImageUrl = coverUpdate.cover_image_url;
    coverImagePath = coverUpdate.cover_image_path;
  } catch (coverError) {
    console.error("Failed to update editorial cover", coverError);
    return {
      ok: false,
      message: "Não foi possível atualizar a capa agora.",
    };
  }

  const now = new Date().toISOString();
  const publishedAt = published ? current.published_at ?? now : current.published_at;
  const publishedBy = published ? user.email || current.published_by : current.published_by;
  const auditEventType = resolveEditorialAuditEventType(current.editorial_status, editorialStatus);
  const auditNote =
    editorialStatus === "published"
      ? publicationReason || "Publicado após checklist editorial."
      : editorialStatus === "archived"
        ? archivedReason || "Arquivado."
        : publicationReason || factCheckNote || "Atualização editorial.";

  const { error } = await supabase
    .from("editorial_items")
    .update({
      title,
      slug: slugifyEditorialValue(slugInput),
      excerpt,
      body,
      category,
      primary_tag: primaryTag || null,
      secondary_tags: secondaryTags,
      series_slug: seriesSlug,
      series_title: seriesTitle,
      reading_time: readingTime,
      featured_order: featuredOrder,
      cover_variant: coverVariant,
      neighborhood: neighborhood || null,
      cover_image_url: coverImageUrl,
      cover_image_path: coverImagePath,
      editorial_status: editorialStatus,
      review_status: reviewStatus,
      featured,
      published,
      published_at: publishedAt,
      publication_reason: publicationReason || null,
      sensitivity_check_passed: sensitivityCheckPassed,
      fact_check_note: factCheckNote || null,
      last_reviewed_at: now,
      last_reviewed_by: user.email || null,
      published_by: publishedBy,
      archived_reason: editorialStatus === "archived" ? archivedReason || null : null,
      source_visibility_note: sourceVisibilityNote || null,
      updated_at: now,
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

  await recordEditorialAuditEvent({
    editorialItemId: id,
    actorEmail: user.email || null,
    eventType: auditEventType,
    fromStatus: current.editorial_status,
    toStatus: editorialStatus,
    note: auditNote,
  });

  revalidatePath("/interno/editorial");
  revalidatePath(`/interno/editorial/${id}`);
  revalidatePath("/pautas");
  revalidatePath(`/pautas/${slugifyEditorialValue(slugInput)}`);
  if (seriesSlug) {
    revalidatePath(`/series/${seriesSlug}`);
  }
  if (current.series_slug && current.series_slug !== seriesSlug) {
    revalidatePath(`/series/${current.series_slug}`);
  }

  return {
    ok: true,
    message:
      editorialStatus === "published"
        ? "Item salvo e publicado após checklist editorial."
        : editorialStatus === "archived"
          ? "Item salvo e arquivado."
          : editorialStatus === "in_review"
            ? "Item salvo e enviado para revisão."
            : "Item salvo com segurança editorial.",
  };
}

