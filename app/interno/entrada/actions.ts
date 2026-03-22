"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import type { ArchiveAssetType } from "@/lib/archive/types";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { editorialEntryTypes, type EditorialEntryStatus, type EditorialEntryTarget, type EditorialEntryType } from "@/lib/entrada/types";
import { removeArchiveAsset, uploadArchiveAsset } from "@/lib/media/archive";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EntryActionState = {
  ok: boolean;
  message: string;
  redirectTo?: string | null;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseYear(value: string) {
  if (!value) {
    return null;
  }

  const match = value.match(/\d{4}/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getFile(formData: FormData) {
  const file = formData.get("asset_file");
  return file instanceof File && file.size > 0 ? file : null;
}

function isEntryType(value: string): value is EditorialEntryType {
  return editorialEntryTypes.includes(value as EditorialEntryType);
}

function resolveArchiveAssetType(entryType: EditorialEntryType, mimeType: string | null): ArchiveAssetType {
  if (entryType === "image") {
    return mimeType === "application/pdf" ? "scan" : "photo";
  }

  return mimeType === "application/pdf" ? "pdf" : "document";
}

function resolveEntryState(entryType: EditorialEntryType, saveMode: string): { status: EditorialEntryStatus; target: EditorialEntryTarget | null } {
  if (entryType === "post") {
    if (saveMode === "primary") {
      return { status: "published", target: "agora" };
    }

    if (saveMode === "secondary") {
      return { status: "draft", target: "agora" };
    }

    return { status: "stored", target: "agora" };
  }

  if (entryType === "document") {
    if (saveMode === "secondary") {
      return { status: "ready_for_enrichment", target: "acervo" };
    }

    if (saveMode === "tertiary") {
      return { status: "ready_for_enrichment", target: "edition" };
    }

    return { status: "stored", target: "acervo" };
  }

  if (saveMode === "secondary") {
    return { status: "ready_for_enrichment", target: "memoria" };
  }

  if (saveMode === "tertiary") {
    return { status: "stored", target: "acervo" };
  }

  return { status: "stored", target: "acervo" };
}

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, authError: true as const };
  }

  return { supabase, user, authError: false as const };
}

async function syncArchiveAssetFromEntry({
  supabase,
  userEmail,
  entryType,
  title,
  summary,
  details,
  sourceLabel,
  yearLabel,
  approximateYear,
  placeLabel,
  territoryLabel,
  actorLabel,
  notes,
  featured,
  sortOrder,
  fileUrl,
  filePath,
  currentFilePath,
  fileMimeType,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userEmail: string | null;
  entryType: EditorialEntryType;
  title: string;
  summary: string | null;
  details: string | null;
  sourceLabel: string | null;
  yearLabel: string | null;
  approximateYear: number | null;
  placeLabel: string | null;
  territoryLabel: string | null;
  actorLabel: string | null;
  notes: string | null;
  featured: boolean;
  sortOrder: number;
  fileUrl: string;
  filePath: string;
  currentFilePath: string | null;
  fileMimeType: string | null;
}) {
  const searchPath = currentFilePath || filePath;
  const { data: existingAsset, error: lookupError } = searchPath
    ? await supabase.from("archive_assets").select("id, file_path, asset_type, thumb_url, thumb_path").eq("file_path", searchPath).maybeSingle()
    : { data: null, error: null };

  if (lookupError) {
    throw lookupError;
  }

  const nextAssetType = fileMimeType ? resolveArchiveAssetType(entryType, fileMimeType) : ((existingAsset?.asset_type as ArchiveAssetType | undefined) ?? resolveArchiveAssetType(entryType, null));
  const nextThumbUrl = fileMimeType ? (nextAssetType === "photo" || nextAssetType === "scan" ? fileUrl : null) : existingAsset?.thumb_url ?? null;
  const nextThumbPath = fileMimeType ? (nextAssetType === "photo" || nextAssetType === "scan" ? filePath : null) : existingAsset?.thumb_path ?? null;
  const now = new Date().toISOString();

  const payload = {
    title,
    asset_type: nextAssetType,
    file_url: fileUrl,
    file_path: filePath,
    thumb_url: nextThumbUrl,
    thumb_path: nextThumbPath,
    source_label: sourceLabel || actorLabel || territoryLabel || "Entrada simplificada",
    source_date_label: yearLabel || "",
    approximate_year: approximateYear,
    place_label: placeLabel || territoryLabel || null,
    rights_note: notes || "Uso editorial controlado",
    description: details || summary || notes || null,
    public_visibility: false,
    featured,
    sort_order: sortOrder,
    updated_at: now,
    updated_by: userEmail,
  };

  if (existingAsset) {
    const { error } = await supabase.from("archive_assets").update(payload).eq("id", existingAsset.id);

    if (error) {
      throw error;
    }

    return { archiveAssetId: existingAsset.id, created: false };
  }

  const archiveAssetId = randomUUID();
  const { error } = await supabase.from("archive_assets").insert({
    id: archiveAssetId,
    memory_item_id: null,
    editorial_item_id: null,
    collection_slug: null,
    ...payload,
    created_at: now,
    created_by: userEmail,
  });

  if (error) {
    throw error;
  }

  return { archiveAssetId, created: true };
}

export async function saveEditorialEntryAction(_: EntryActionState, formData: FormData): Promise<EntryActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const entryType = normalize(formData.get("entry_type"));
  const saveMode = normalize(formData.get("save_mode")) || "tertiary";
  const title = normalize(formData.get("title"));
  const summary = normalize(formData.get("summary"));
  const details = normalize(formData.get("details"));
  const sourceLabel = normalize(formData.get("source_label"));
  const yearLabel = normalize(formData.get("year_label"));
  const approximateYear = parseYear(yearLabel);
  const placeLabel = normalize(formData.get("place_label"));
  const territoryLabel = normalize(formData.get("territory_label"));
  const actorLabel = normalize(formData.get("actor_label"));
  const axisLabel = normalize(formData.get("axis_label"));
  const notes = normalize(formData.get("notes"));
  const featured = parseBoolean(formData.get("featured"));
  const sortOrderInput = normalize(formData.get("sort_order"));
  const sortOrder = sortOrderInput ? Number.parseInt(sortOrderInput, 10) || 0 : 0;
  const file = getFile(formData);

  if (!isEntryType(entryType)) {
    return {
      ok: false,
      message: "Escolha um tipo de entrada válido.",
    };
  }

  if (!title) {
    return {
      ok: false,
      message: "Preencha pelo menos o título curto.",
    };
  }

  if (title.length < 4) {
    return {
      ok: false,
      message: "O título precisa ter um pouco mais de contexto.",
    };
  }

  if ((entryType === "document" || entryType === "image") && !currentId && !file) {
    return {
      ok: false,
      message: "Envie o arquivo para guardar essa entrada.",
    };
  }

  const { status, target } = resolveEntryState(entryType, saveMode);
  const supabaseResult = await ensureAdmin();
  const { supabase, user, authError } = supabaseResult;

  if (authError || !user) {
    return {
      ok: false,
      message: "Sua sessão interna expirou. Entre novamente antes de salvar.",
    };
  }

  const now = new Date().toISOString();
  const entryId = currentId ?? randomUUID();

  const current = currentId ? await getInternalEditorialEntryById(currentId) : null;
  let fileUrl = current?.file_url ?? null;
  let filePath = current?.file_path ?? null;
  let fileName = current?.file_name ?? null;
  const shouldMaterializeArchive = (entryType === "document" || entryType === "image") && saveMode === "primary";
  const currentArchivePath = current?.file_path ?? null;

  try {
    if (file) {
      const uploaded = await uploadArchiveAsset(file, entryId);
      fileUrl = uploaded.url;
      filePath = uploaded.path;
      fileName = file.name;
    }
  } catch (uploadError) {
    console.error("Failed to upload editorial entry asset", uploadError);
    return {
      ok: false,
      message: "Não foi possível enviar o arquivo agora. Tente novamente.",
    };
  }

  const payload = {
    entry_type: entryType,
    entry_status: status,
    target_surface: target,
    title,
    summary: summary || null,
    details: details || null,
    file_url: fileUrl,
    file_path: filePath,
    file_name: fileName,
    source_label: sourceLabel || null,
    year_label: yearLabel || null,
    approximate_year: approximateYear,
    place_label: placeLabel || null,
    territory_label: territoryLabel || null,
    actor_label: actorLabel || null,
    axis_label: axisLabel || null,
    notes: notes || null,
    featured,
    sort_order: sortOrder,
    published_at: status === "published" ? current?.published_at ?? now : current?.published_at ?? null,
    updated_at: now,
    updated_by: user.email || null,
  };

  if (currentId) {
    const { error } = await supabase.from("editorial_entries").update(payload).eq("id", currentId);

    if (error) {
      console.error("Failed to update editorial entry", error);
      return {
        ok: false,
        message: "Não foi possível salvar a entrada agora.",
      };
    }

    if (file && current?.file_path && current.file_path !== filePath) {
      await removeArchiveAsset(current.file_path).catch((cleanupError) => {
        console.error("Failed to remove previous entry file", cleanupError);
      });
    }
  } else {
    const { error } = await supabase.from("editorial_entries").insert({
      id: entryId,
      ...payload,
      created_at: now,
      created_by: user.email || null,
    });

    if (error) {
      console.error("Failed to create editorial entry", error);
      if (fileUrl && filePath) {
        await removeArchiveAsset(filePath).catch((cleanupError) => {
          console.error("Failed to remove failed entry file", cleanupError);
        });
      }
      return {
        ok: false,
        message: "Não foi possível criar a entrada agora.",
      };
    }
  }

  let archiveResult: { archiveAssetId: string; created: boolean } | null = null;

  if (shouldMaterializeArchive && fileUrl && filePath) {
    try {
      archiveResult = await syncArchiveAssetFromEntry({
        supabase,
        userEmail: user.email || null,
        entryType,
        title,
        summary,
        details,
        sourceLabel,
        yearLabel,
        approximateYear,
        placeLabel,
        territoryLabel,
        actorLabel,
        notes,
        featured,
        sortOrder,
        fileUrl,
        filePath,
        currentFilePath: currentArchivePath,
        fileMimeType: file?.type || null,
      });
    } catch (archiveError) {
      console.error("Failed to sync archive asset from editorial entry", archiveError);
    }
  }

  revalidatePath("/interno/entrada");
  revalidatePath(`/interno/entrada/${entryId}`);
  revalidatePath("/interno/acervo");
  revalidatePath("/interno");

  if (archiveResult) {
    revalidatePath(`/interno/acervo/${archiveResult.archiveAssetId}`);
  }

  return {
    ok: true,
    message: "Entrada guardada com sucesso.",
    redirectTo: `/interno/entrada/${entryId}?saved=1${archiveResult ? `&archive=1&archive_asset_id=${archiveResult.archiveAssetId}` : shouldMaterializeArchive ? "&archive=0" : ""}`,
  };
}


