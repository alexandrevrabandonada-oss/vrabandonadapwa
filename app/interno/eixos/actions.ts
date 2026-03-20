"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalThemeHubById } from "@/lib/hubs/queries";
import { parseThemeHubLinkRef } from "@/lib/hubs/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ThemeHubActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function revalidateThemeHubRoutes(hubSlug: string, hubId: string) {
  revalidatePath("/eixos");
  revalidatePath(`/eixos/${hubSlug}`);
  revalidatePath("/interno/eixos");
  revalidatePath("/interno/eixos/novo");
  revalidatePath(`/interno/eixos/${hubId}`);
}

export async function saveThemeHubAction(_: ThemeHubActionState, formData: FormData): Promise<ThemeHubActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
  const status = normalize(formData.get("status")) || "draft";
  const publicVisibility = toBool(formData.get("public_visibility"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase, user } = await ensureAdmin();

  if (!title) {
    return { ok: false, message: "Título é obrigatório." };
  }

  const normalizedSlug = slugify(slugInput || title);
  if (!normalizedSlug) {
    return { ok: false, message: "Slug inválido." };
  }

  if (currentId) {
    const current = await getInternalThemeHubById(currentId);
    if (!current) {
      return { ok: false, message: "Eixo não encontrado." };
    }

    const { error } = await supabase
      .from("theme_hubs")
      .update({
        title,
        excerpt: excerpt || null,
        description: description || null,
        lead_question: leadQuestion || null,
        cover_image_url: coverImageUrl || null,
        status,
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId);

    if (error) {
      return { ok: false, message: "Não foi possível salvar o eixo." };
    }

    revalidateThemeHubRoutes(current.slug, current.id);
    return { ok: true, message: "Eixo atualizado." };
  }

  const { error } = await supabase.from("theme_hubs").insert({
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    lead_question: leadQuestion || null,
    cover_image_url: coverImageUrl || null,
    status,
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o eixo." };
  }

  revalidateThemeHubRoutes(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Eixo criado." };
}

export async function saveThemeHubLinkAction(_: ThemeHubActionState, formData: FormData): Promise<ThemeHubActionState> {
  const themeHubId = normalize(formData.get("theme_hub_id"));
  const linkRef = normalize(formData.get("link_ref"));
  const linkRole = normalize(formData.get("link_role")) || "context";
  const timelineYearRaw = normalize(formData.get("timeline_year"));
  const timelineYear = timelineYearRaw ? Number.parseInt(timelineYearRaw, 10) : null;
  const timelineLabel = normalize(formData.get("timeline_label"));
  const timelineNote = normalize(formData.get("timeline_note"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase } = await ensureAdmin();

  if (!themeHubId) {
    return { ok: false, message: "Eixo inválido." };
  }

  const parsed = parseThemeHubLinkRef(linkRef);
  if (!parsed) {
    return { ok: false, message: "Escolha uma peça relacionada válida." };
  }

  const { error } = await supabase.from("theme_hub_links").insert({
    theme_hub_id: themeHubId,
    link_type: parsed.type,
    link_key: parsed.key,
    link_role: linkRole,
    timeline_year: Number.isNaN(timelineYear) ? null : timelineYear,
    timeline_label: timelineLabel || null,
    timeline_note: timelineNote || null,
    featured,
    sort_order: sortOrder,
  });

  if (error) {
    return { ok: false, message: "Não foi possível vincular a peça." };
  }

  const hub = await getInternalThemeHubById(themeHubId);
  if (hub) {
    revalidateThemeHubRoutes(hub.slug, hub.id);
  }

  return { ok: true, message: "Peça vinculada ao eixo." };
}

export async function removeThemeHubLinkAction(formData: FormData): Promise<void> {
  const themeHubId = normalize(formData.get("theme_hub_id"));
  const linkId = normalize(formData.get("link_id"));

  const { supabase } = await ensureAdmin();

  if (!themeHubId || !linkId) {
    return;
  }

  const { error } = await supabase.from("theme_hub_links").delete().eq("id", linkId).eq("theme_hub_id", themeHubId);

  if (error) {
    return;
  }

  const hub = await getInternalThemeHubById(themeHubId);
  if (hub) {
    revalidateThemeHubRoutes(hub.slug, hub.id);
  }
}
