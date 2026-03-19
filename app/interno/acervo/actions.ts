"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalEditorialById } from "@/lib/editorial/queries";
import { getInternalMemoryById } from "@/lib/memory/queries";
import { removeArchiveAsset, uploadArchiveAsset } from "@/lib/media/archive";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ArchiveAssetType } from "@/lib/archive/types";

export type ArchiveAssetActionState = {
  ok: boolean;
  message: string;
};

const allowedAssetTypes: ArchiveAssetType[] = ["photo", "scan", "newspaper", "document", "pdf", "audio", "other"];

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function parseNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getFiles(formData: FormData) {
  return formData.getAll("asset_files").filter((value): value is File => value instanceof File && value.size > 0);
}

function humanizeFileName(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base ? base.replace(/\b\w/g, (match) => match.toUpperCase()) : "Anexo de arquivo";
}

function isVisualAssetType(assetType: string, file: File) {
  const mimeType = file.type.toLowerCase();
  return assetType === "photo" || assetType === "scan" || assetType === "newspaper" || mimeType.startsWith("image/");
}

function buildTitle(baseTitle: string, file: File, index: number, total: number) {
  const fileTitle = humanizeFileName(file.name);
  if (baseTitle) {
    return total > 1 ? `${baseTitle} ${index + 1}` : baseTitle;
  }

  return total > 1 ? `${fileTitle} ${index + 1}` : fileTitle;
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

async function revalidateConnectedPaths(memoryItemId: string | null, editorialItemId: string | null) {
  if (memoryItemId) {
    const memory = await getInternalMemoryById(memoryItemId);
    if (memory) {
      revalidatePath(`/interno/memoria/${memory.id}`);
      revalidatePath(`/memoria/${memory.slug}`);
      revalidatePath("/interno/memoria");
      revalidatePath("/memoria");
    }
  }

  if (editorialItemId) {
    const editorial = await getInternalEditorialById(editorialItemId);
    if (editorial) {
      revalidatePath(`/interno/editorial/${editorial.id}`);
      revalidatePath("/interno/editorial");
      if (editorial.published) {
        revalidatePath(`/pautas/${editorial.slug}`);
        revalidatePath("/pautas");
      }
    }
  }
}

export async function saveArchiveAssetAction(
  _: ArchiveAssetActionState,
  formData: FormData,
): Promise<ArchiveAssetActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const titleInput = normalize(formData.get("title"));
  const assetType = normalize(formData.get("asset_type")) as ArchiveAssetType;
  const memoryItemId = normalize(formData.get("memory_item_id")) || null;
  const editorialItemId = normalize(formData.get("editorial_item_id")) || null;
  const sourceLabel = normalize(formData.get("source_label"));
  const sourceDateLabel = normalize(formData.get("source_date_label"));
  const approximateYear = parseNumber(normalize(formData.get("approximate_year")));
  const placeLabel = normalize(formData.get("place_label"));
  const rightsNote = normalize(formData.get("rights_note"));
  const description = normalize(formData.get("description"));
  const publicVisibility = toBool(formData.get("public_visibility"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = parseNumber(normalize(formData.get("sort_order"))) ?? 0;
  const files = getFiles(formData);

  const { supabase, user } = await ensureAdmin();

  if (!allowedAssetTypes.includes(assetType)) {
    return {
      ok: false,
      message: "Escolha um tipo de acervo válido.",
    };
  }

  if (!currentId && files.length === 0) {
    return {
      ok: false,
      message: "Envie ao menos um arquivo para criar o anexo.",
    };
  }

  if (currentId) {
    const { data: current, error: currentError } = await supabase
      .from("archive_assets")
      .select("id, file_path, file_url, thumb_path, thumb_url, memory_item_id, editorial_item_id, title")
      .eq("id", currentId)
      .maybeSingle();

    if (currentError) {
      console.error("Failed to load archive asset", currentError);
      return {
        ok: false,
        message: "Não foi possível abrir o anexo para edição.",
      };
    }

    if (!current) {
      return {
        ok: false,
        message: "Anexo não encontrado.",
      };
    }

    if (files.length > 1) {
      return {
        ok: false,
        message: "Na edição, envie apenas um arquivo por vez.",
      };
    }

    const nextFile = files[0] ?? null;
    const nextTitle = titleInput || humanizeFileName(nextFile?.name ?? current.title);
    let fileUrl = current.file_url;
    let filePath = current.file_path;
    let thumbUrl = current.thumb_url;
    let thumbPath = current.thumb_path;

    if (nextFile) {
      const uploaded = await uploadArchiveAsset(nextFile, currentId);
      fileUrl = uploaded.url;
      filePath = uploaded.path;
      const visual = isVisualAssetType(assetType, nextFile);
      thumbUrl = visual ? uploaded.url : null;
      thumbPath = visual ? uploaded.path : null;
    }

    const { error } = await supabase
      .from("archive_assets")
      .update({
        title: nextTitle,
        asset_type: assetType,
        memory_item_id: memoryItemId,
        editorial_item_id: editorialItemId,
        file_url: fileUrl,
        file_path: filePath,
        thumb_url: thumbUrl,
        thumb_path: thumbPath,
        source_label: sourceLabel || null,
        source_date_label: sourceDateLabel || null,
        approximate_year: approximateYear,
        place_label: placeLabel || null,
        rights_note: rightsNote || null,
        description: description || null,
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId);

    if (error) {
      console.error("Failed to update archive asset", error);
      return {
        ok: false,
        message: "Não foi possível salvar o anexo agora.",
      };
    }

    if (nextFile && current.file_path !== filePath) {
      try {
        await removeArchiveAsset(current.file_path);
      } catch (coverError) {
        console.error("Failed to remove previous archive asset file", coverError);
      }
    }

    await revalidateConnectedPaths(memoryItemId ?? current.memory_item_id, editorialItemId ?? current.editorial_item_id);
    revalidatePath("/interno/acervo");
    revalidatePath(`/interno/acervo/${currentId}`);

    return {
      ok: true,
      message: "Anexo salvo e atualizado.",
    };
  }

  const createdIds: string[] = [];
  const errors: string[] = [];
  const totalFiles = files.length;
  const baseTitle = titleInput;

  for (const [index, file] of files.entries()) {
    const assetId = randomUUID();

    try {
      const uploaded = await uploadArchiveAsset(file, assetId);
      const visual = isVisualAssetType(assetType, file);
      const nextTitle = buildTitle(baseTitle, file, index, totalFiles);

      const { error } = await supabase.from("archive_assets").insert({
        id: assetId,
        memory_item_id: memoryItemId,
        editorial_item_id: editorialItemId,
        title: nextTitle,
        asset_type: assetType,
        file_url: uploaded.url,
        file_path: uploaded.path,
        thumb_url: visual ? uploaded.url : null,
        thumb_path: visual ? uploaded.path : null,
        source_label: sourceLabel || null,
        source_date_label: sourceDateLabel || null,
        approximate_year: approximateYear,
        place_label: placeLabel || null,
        rights_note: rightsNote || null,
        description: description || null,
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder + index,
        created_by: user.email || null,
        updated_by: user.email || null,
      });

      if (error) {
        await removeArchiveAsset(uploaded.path).catch((cleanupError) => {
          console.error("Failed to remove failed archive upload", cleanupError);
        });
        errors.push(file.name);
        continue;
      }

      createdIds.push(assetId);
    } catch (fileError) {
      console.error("Failed to create archive asset", fileError);
      errors.push(file.name);
    }
  }

  if (createdIds.length === 0) {
    return {
      ok: false,
      message: errors.length ? `Nenhum anexo foi salvo. Falha em: ${errors.join(", ")}.` : "Não foi possível salvar o lote.",
    };
  }

  await revalidateConnectedPaths(memoryItemId, editorialItemId);
  revalidatePath("/interno/acervo");

  return {
    ok: true,
    message: errors.length > 0 ? `${createdIds.length} anexo(s) salvo(s). Falha em: ${errors.join(", ")}.` : `${createdIds.length} anexo(s) salvo(s) com sucesso.`,
  };
}
