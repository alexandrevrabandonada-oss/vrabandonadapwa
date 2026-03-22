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

export async function uploadArchiveAsset(file: File, assetId: string) {
  const supabase = createSupabaseServiceClient();
  const storagePath = buildArchiveAssetPath(assetId, file.name);
  
  // Convert File to Buffer for server-side upload in Next.js Server Actions
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const { error } = await supabase.storage.from(ARCHIVE_ASSETS_BUCKET).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    path: storagePath,
    url: getArchiveAssetPublicUrl(storagePath),
  };
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
