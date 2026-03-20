"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBoolean(value: FormDataEntryValue | null) {
  return normalize(value) === "on" || normalize(value).toLowerCase() === "true";
}

function parseSortOrder(value: FormDataEntryValue | null) {
  const parsed = Number(normalize(value));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function parseDateTime(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function revalidateEditionPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/agora");
  revalidatePath("/edicoes");
  revalidatePath(`/edicoes/${slug}`);
  revalidatePath("/campanhas");
  revalidatePath("/impacto");
  revalidatePath("/padroes");
  revalidatePath("/dossies");
  revalidatePath("/participe");
  revalidatePath("/metodo");
}

export async function saveEditionAction(_: EditionState, formData: FormData): Promise<EditionState> {
  const id = normalize(formData.get("id"));
  const title = normalize(formData.get("title"));
  const slug = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const editionType = normalize(formData.get("edition_type"));
  const periodLabel = normalize(formData.get("period_label"));
  const publishedAt = parseDateTime(normalize(formData.get("published_at")));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
  const status = normalize(formData.get("status"));
  const publicVisibility = parseBoolean(formData.get("public_visibility"));
  const featured = parseBoolean(formData.get("featured"));
  const sortOrder = parseSortOrder(formData.get("sort_order"));

  if (!title || !slug || !description) {
    return {
      ok: false,
      message: "Preencha título, slug e descrição antes de salvar.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    title,
    slug,
    excerpt: excerpt || null,
    description,
    edition_type: editionType || "city_pulse",
    period_label: periodLabel || null,
    published_at: publishedAt,
    cover_image_url: coverImageUrl || null,
    status: status || "draft",
    featured,
    public_visibility: publicVisibility,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("editorial_editions").update(payload).eq("id", id).select("id, slug").maybeSingle()
    : await supabase.from("editorial_editions").insert(payload).select("id, slug").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save edition", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar a edição agora.",
    };
  }

  revalidateEditionPaths(slug);
  revalidatePath("/interno/edicoes");
  revalidatePath(`/interno/edicoes/${result.data.id}`);
  redirect(`/interno/edicoes/${result.data.id}`);
}

export async function saveEditionLinkAction(_: EditionState, formData: FormData): Promise<EditionState> {
  const id = normalize(formData.get("id"));
  const editionId = normalize(formData.get("edition_id"));
  const editionSlug = normalize(formData.get("edition_slug"));
  const linkType = normalize(formData.get("link_type"));
  const linkKey = normalize(formData.get("link_key"));
  const linkRole = normalize(formData.get("link_role"));
  const note = normalize(formData.get("note"));
  const intent = normalize(formData.get("intent")) || "save";
  const sortOrder = parseSortOrder(formData.get("sort_order"));
  const featured = parseBoolean(formData.get("featured"));

  if (!editionId) {
    return {
      ok: false,
      message: "Edição ausente.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (intent === "delete") {
    if (!id) {
      return {
        ok: false,
        message: "Selecione um vínculo existente para remover.",
      };
    }

    const { error } = await supabase.from("editorial_edition_links").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete edition link", error);
      return {
        ok: false,
        message: "Não foi possível remover o vínculo.",
      };
    }

    revalidateEditionPaths(editionSlug);
    revalidatePath("/interno/edicoes");
    revalidatePath(`/interno/edicoes/${editionId}`);
    redirect(`/interno/edicoes/${editionId}`);
  }

  if (!linkType || !linkKey || !linkRole) {
    return {
      ok: false,
      message: "Preencha tipo, chave e papel do vínculo.",
    };
  }

  const payload = {
    edition_id: editionId,
    link_type: linkType,
    link_key: linkKey,
    link_role: linkRole,
    note: note || null,
    featured,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("editorial_edition_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("editorial_edition_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save edition link", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar o vínculo.",
    };
  }

  revalidateEditionPaths(editionSlug);
  revalidatePath("/interno/edicoes");
  revalidatePath(`/interno/edicoes/${editionId}`);
  redirect(`/interno/edicoes/${editionId}`);
}
