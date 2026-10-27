import path from "node:path";
import { randomUUID } from "node:crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { slugifyEditorialValue } from "@/lib/editorial/utils";

export const ARCHIVE_ASSETS_BUCKET = "archive-assets";

function assertSupabasePublicUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Supabase public URL is not configured.");
  }

  return supabaseUrl;
}

function sanitizeFileName(fileName: string) {
  const base = path.basename(fileName, path.extname(fileName));
  const extension = path.extname(fileName).toLowerCase();
  const slug = slugifyEditorialValue(base) || "asset";
  return `${slug}${extension || ".jpg"}`;
}

export function buildArchiveAssetPath(assetId: string, fileName: string) {
  return `archive-assets/${assetId}/${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function getArchiveAssetPublicUrl(storagePath: string) {
  return `${assertSupabasePublicUrl()}/storage/v1/object/public/${ARCHIVE_ASSETS_BUCKET}/${storagePath}`;
}

export async function uploadArchiveAsset(_file: File, _assetId: string): Promise<{ path: string; url: string }> {
  // O bucket legado pode ser público mesmo quando o registro é interno.
  // Mantenha esta barreira no servidor até validar o armazenamento privado.
  void _file;
  void _assetId;
  throw new Error("Envio de anexos temporariamente suspenso para proteger as fontes.");
}

export async function removeArchiveAsset(storagePath: string) {
  if (!storagePath) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.storage.from(ARCHIVE_ASSETS_BUCKET).remove([storagePath]);

  if (error) {
    throw error;
  }
}
