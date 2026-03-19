import path from "node:path";
import { randomUUID } from "node:crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { slugifyEditorialValue } from "@/lib/editorial/utils";

export const MEMORY_COVERS_BUCKET = "memory-covers";

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

export function buildMemoryCoverPath(itemId: string, fileName: string) {
  return `memory-covers/${itemId}/${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function getMemoryCoverPublicUrl(storagePath: string) {
  return `${assertSupabasePublicUrl()}/storage/v1/object/public/${MEMORY_COVERS_BUCKET}/${storagePath}`;
}

export async function uploadMemoryCover(file: File, itemId: string) {
  const supabase = createSupabaseServiceClient();
  const storagePath = buildMemoryCoverPath(itemId, file.name);
  const { error } = await supabase.storage.from(MEMORY_COVERS_BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    path: storagePath,
    url: getMemoryCoverPublicUrl(storagePath),
  };
}

export async function removeMemoryCover(storagePath: string) {
  if (!storagePath) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.storage.from(MEMORY_COVERS_BUCKET).remove([storagePath]);

  if (error) {
    throw error;
  }
}
