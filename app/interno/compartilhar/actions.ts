"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSharePackContentHref } from "@/lib/share-packs/navigation";
import { splitSharePackReference } from "@/lib/share-packs/navigation";

type SharePackState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBoolean(value: FormDataEntryValue | null) {
  const normalized = normalize(value).toLowerCase();
  return normalized === "on" || normalized === "true";
}

function parseSortOrder(value: FormDataEntryValue | null) {
  const parsed = Number(normalize(value));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function revalidateSharePaths(contentType: string, contentKey: string) {
  revalidatePath("/");
  revalidatePath("/agora");
  revalidatePath("/edicoes");
  revalidatePath("/campanhas");
  revalidatePath("/impacto");
  revalidatePath("/dossies");
  revalidatePath("/padroes");
  revalidatePath("/pautas");
  revalidatePath("/compartilhar");
  revalidatePath(`/compartilhar/${contentType}/${contentKey}`);
  revalidatePath(getSharePackContentHref(contentType, contentKey));
}

export async function saveSharePackAction(_: SharePackState, formData: FormData): Promise<SharePackState> {
  const id = normalize(formData.get("id"));
  const contentRef = normalize(formData.get("content_ref"));
  const titleOverride = normalize(formData.get("title_override"));
  const shortSummary = normalize(formData.get("short_summary"));
  const shareCaption = normalize(formData.get("share_caption"));
  const shareStatus = normalize(formData.get("share_status")) || "draft";
  const coverVariant = normalize(formData.get("cover_variant"));
  const featured = parseBoolean(formData.get("featured"));
  const publicVisibility = parseBoolean(formData.get("public_visibility"));
  const sortOrder = parseSortOrder(formData.get("sort_order"));

  const { contentType, contentKey } = splitSharePackReference(contentRef);

  if (!contentType || !contentKey) {
    return {
      ok: false,
      message: "Preencha o conteúdo de origem no formato tipo:chave.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    content_type: contentType,
    content_key: contentKey,
    title_override: titleOverride || null,
    short_summary: shortSummary || null,
    share_caption: shareCaption || null,
    share_status: shareStatus || "draft",
    cover_variant: coverVariant || null,
    featured,
    public_visibility: publicVisibility,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("share_packs").update(payload).eq("id", id).select("id, content_type, content_key").maybeSingle()
    : await supabase.from("share_packs").insert(payload).select("id, content_type, content_key").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save share pack", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar o pacote de circulação agora.",
    };
  }

  const targetType = result.data.content_type || contentType;
  const targetKey = result.data.content_key || contentKey;
  revalidateSharePaths(targetType, targetKey);
  revalidatePath("/interno/compartilhar");
  revalidatePath(`/interno/compartilhar/${result.data.id}`);
  redirect(`/interno/compartilhar/${result.data.id}`);
}
