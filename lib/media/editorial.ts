import path from "node:path";
import { randomUUID } from "node:crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { slugifyEditorialValue } from "@/lib/editorial/utils";

export const EDITORIAL_COVERS_BUCKET = "editorial-covers";

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
  const slug = slugifyEditorialValue(base) || "cover";
  return `${slug}${extension || ".jpg"}`;
}

export function buildEditorialCoverPath(itemId: string, fileName: string) {
  return `editorial-covers/${itemId}/${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function getEditorialCoverPublicUrl(storagePath: string) {
  return `${assertSupabasePublicUrl()}/storage/v1/object/public/${EDITORIAL_COVERS_BUCKET}/${storagePath}`;
}

export async function uploadEditorialCover(file: File, itemId: string) {
  const supabase = createSupabaseServiceClient();
  const storagePath = buildEditorialCoverPath(itemId, file.name);
  const { error } = await supabase.storage.from(EDITORIAL_COVERS_BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    path: storagePath,
    url: getEditorialCoverPublicUrl(storagePath),
  };
}

export async function removeEditorialCover(storagePath: string) {
  if (!storagePath) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.storage.from(EDITORIAL_COVERS_BUCKET).remove([storagePath]);

  if (error) {
    throw error;
  }
}
