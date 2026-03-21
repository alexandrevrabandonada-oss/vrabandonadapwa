"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { upsertMemoryCollection } from "@/lib/memory/admin";
import { getInternalMemoryById } from "@/lib/memory/queries";
import { normalizeMemoryCollectionSlug } from "@/lib/memory/admin";
import { removeMemoryCover, uploadMemoryCover } from "@/lib/media/memory";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugifyEditorialValue } from "@/lib/editorial/utils";
import type { MemoryEditorialStatus } from "@/lib/memory/types";

export type MemoryActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return value === "on";
}

function parseNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getUploadedFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

async function ensureCollection(input: {
  slug: string;
  title: string;
  description: string;
  displayOrder: number | null;
  featured: boolean;
}) {
  await upsertMemoryCollection({
    slug: input.slug,
    title: input.title,
    description: input.description,
    displayOrder: input.displayOrder,
    featured: input.featured,
  });
}

export async function saveMemoryItemAction(
  _: MemoryActionState,
  formData: FormData,
): Promise<MemoryActionState> {
  const idInput = normalize(formData.get("id"));
  const id = idInput || randomUUID();
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const body = normalize(formData.get("body"));
  const memoryType = normalize(formData.get("memory_type"));
  const editorialStatus = normalize(formData.get("editorial_status")) as MemoryEditorialStatus;
  const periodLabel = normalize(formData.get("period_label"));
  const yearStart = parseNumber(normalize(formData.get("year_start")));
  const yearEnd = parseNumber(normalize(formData.get("year_end")));
  const placeLabel = normalize(formData.get("place_label"));
  const sourceNote = normalize(formData.get("source_note"));
  const collectionSlugInput = normalize(formData.get("collection_slug"));
  const collectionTitle = normalize(formData.get("collection_title"));
  const collectionDescription = normalize(formData.get("collection_description"));
  const collectionOrder = parseNumber(normalize(formData.get("collection_order")));
  const relatedEditorialSlug = normalize(formData.get("related_editorial_slug"));
  const relatedSeriesSlug = normalize(formData.get("related_series_slug"));
  const timelineRank = parseNumber(normalize(formData.get("timeline_rank")));
  const coverImageUrlInput = normalize(formData.get("cover_image_url"));
  const coverImageFile = getUploadedFile(formData.get("cover_image_file"));
  const coverImageClear = toBool(formData.get("cover_image_clear"));
  const featured = toBool(formData.get("featured"));

  if (!title || !slugInput || !excerpt || !body || !memoryType || !editorialStatus || !periodLabel || !collectionSlugInput || !collectionTitle) {
    return {
      ok: false,
      message: "Preencha os campos mínimos da memória.",
    };
  }

  if (editorialStatus === "published" && !sourceNote) {
    return {
      ok: false,
      message: "Antes de publicar, registre a fonte ou o contexto editorial da memória.",
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

  const current = idInput ? await getInternalMemoryById(idInput) : null;
  const collectionSlug = normalizeMemoryCollectionSlug(collectionSlugInput || collectionTitle);
  const collectionDisplayOrder = collectionOrder ?? 0;

  await ensureCollection({
    slug: collectionSlug,
    title: collectionTitle,
    description: collectionDescription,
    displayOrder: collectionDisplayOrder,
    featured,
  });

  const now = new Date().toISOString();
  const currentCoverPath = current?.cover_image_path ?? null;
  let coverImageUrl = current?.cover_image_url ?? null;
  let coverImagePath = currentCoverPath;

  try {
    if (coverImageClear) {
      coverImageUrl = null;
      coverImagePath = null;
    } else if (coverImageFile) {
      const uploaded = await uploadMemoryCover(coverImageFile, id);
      coverImageUrl = uploaded.url;
      coverImagePath = uploaded.path;
    } else if (coverImageUrlInput) {
      coverImageUrl = coverImageUrlInput;
      coverImagePath = null;
    }
  } catch (uploadError) {
    console.error("Failed to upload memory cover", uploadError);
    return {
      ok: false,
      message: "Não foi possível enviar a imagem de capa agora.",
    };
  }

  const published = editorialStatus === "published";
  const publishedAt = published ? current?.published_at ?? now : current?.published_at ?? null;
  const archiveStatus = editorialStatus === "archived" ? "archived" : featured ? "featured" : "active";

  const payload = {
    id,
    slug: slugifyEditorialValue(slugInput),
    title,
    excerpt,
    body,
    memory_type: memoryType,
    memory_collection: collectionSlug,
    collection_slug: collectionSlug,
    collection_title: collectionTitle,
    period_label: periodLabel,
    year_start: yearStart,
    year_end: yearEnd,
    place_label: placeLabel || null,
    source_note: sourceNote || null,
    archive_status: archiveStatus,
    editorial_status: editorialStatus,
    published,
    published_at: publishedAt,
    featured,
    highlight_in_memory: featured,
    timeline_rank: timelineRank,
    related_editorial_slug: relatedEditorialSlug || null,
    related_series_slug: relatedSeriesSlug || null,
    cover_image_url: coverImageUrl,
    cover_image_path: coverImagePath,
    updated_at: now,
    updated_by: user.email || null,
    created_by: (current?.created_by ?? user.email) || null,
    created_at: current?.created_at ?? now,
  };

  const operation = current
    ? supabase.from("memory_items").update(payload).eq("id", current.id)
    : supabase.from("memory_items").insert(payload);

  const { error } = await operation;
  if (error) {
    console.error("Failed to save memory item", error);
    return {
      ok: false,
      message: "Não foi possível salvar a memória agora.",
    };
  }

  if (currentCoverPath && currentCoverPath !== coverImagePath) {
    try {
      await removeMemoryCover(currentCoverPath);
    } catch (coverError) {
      console.error("Failed to remove previous memory cover", coverError);
    }
  }

  revalidatePath("/memoria");
  revalidatePath(`/memoria/${payload.slug}`);
  revalidatePath("/interno/memoria");
  revalidatePath(`/interno/memoria/${id}`);

  return {
    ok: true,
    message:
      editorialStatus === "published"
        ? "Memória salva e publicada."
        : editorialStatus === "archived"
          ? "Memória salva e arquivada."
          : "Memória salva com segurança editorial.",
  };
}
