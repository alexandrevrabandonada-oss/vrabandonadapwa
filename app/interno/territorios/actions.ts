"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalPlaceHubById } from "@/lib/territories/queries";
import { parsePlaceHubLinkRef } from "@/lib/territories/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlaceHubActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return normalize(value) === "true" || normalize(value) === "on";
}

function parseNumber(value: FormDataEntryValue | null) {
  const text = normalize(value);
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
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

function revalidatePlaceHubRoutes(slug: string, id: string) {
  revalidatePath("/");
  revalidatePath("/territorios");
  revalidatePath(`/territorios/${slug}`);
  revalidatePath("/interno/territorios");
  revalidatePath("/interno/territorios/novo");
  revalidatePath(`/interno/territorios/${id}`);
}

export async function savePlaceHubAction(_: PlaceHubActionState, formData: FormData): Promise<PlaceHubActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const placeType = normalize(formData.get("place_type")) || "bairro";
  const parentPlaceSlug = normalize(formData.get("parent_place_slug"));
  const territoryLabel = normalize(formData.get("territory_label"));
  const addressLabel = normalize(formData.get("address_label"));
  const latitude = parseNumber(formData.get("latitude"));
  const longitude = parseNumber(formData.get("longitude"));
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
    const current = await getInternalPlaceHubById(currentId);
    if (!current) {
      return { ok: false, message: "Lugar não encontrado." };
    }

    const { error } = await supabase
      .from("place_hubs")
      .update({
        title,
        excerpt: excerpt || null,
        description: description || null,
        lead_question: leadQuestion || null,
        place_type: placeType,
        parent_place_slug: parentPlaceSlug || null,
        territory_label: territoryLabel || null,
        address_label: addressLabel || null,
        latitude,
        longitude,
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
      return { ok: false, message: "Não foi possível salvar o lugar." };
    }

    revalidatePlaceHubRoutes(current.slug, current.id);
    return { ok: true, message: "Lugar atualizado." };
  }

  const { error } = await supabase.from("place_hubs").insert({
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    lead_question: leadQuestion || null,
    place_type: placeType,
    parent_place_slug: parentPlaceSlug || null,
    territory_label: territoryLabel || null,
    address_label: addressLabel || null,
    latitude,
    longitude,
    cover_image_url: coverImageUrl || null,
    status,
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o lugar." };
  }

  revalidatePlaceHubRoutes(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Lugar criado." };
}

export async function savePlaceHubLinkAction(_: PlaceHubActionState, formData: FormData): Promise<PlaceHubActionState> {
  const id = normalize(formData.get("id"));
  const placeHubId = normalize(formData.get("place_hub_id"));
  const placeHubSlug = normalize(formData.get("place_hub_slug"));
  const linkRef = normalize(formData.get("link_ref"));
  const linkRole = normalize(formData.get("link_role")) || "context";
  const timelineYearRaw = normalize(formData.get("timeline_year"));
  const timelineYear = timelineYearRaw ? Number.parseInt(timelineYearRaw, 10) : null;
  const timelineLabel = normalize(formData.get("timeline_label"));
  const timelineNote = normalize(formData.get("timeline_note"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase } = await ensureAdmin();

  if (!placeHubId) {
    return { ok: false, message: "Lugar inválido." };
  }

  const parsed = parsePlaceHubLinkRef(linkRef);
  if (!parsed) {
    return { ok: false, message: "Escolha uma peça relacionada válida." };
  }

  const payload = {
    place_hub_id: placeHubId,
    link_type: parsed.type,
    link_key: parsed.key,
    link_role: linkRole,
    timeline_year: Number.isNaN(timelineYear) ? null : timelineYear,
    timeline_label: timelineLabel || null,
    timeline_note: timelineNote || null,
    featured,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("place_hub_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("place_hub_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    return { ok: false, message: "Não foi possível salvar o vínculo." };
  }

  const placeHub = await getInternalPlaceHubById(placeHubId);
  if (placeHub) {
    revalidatePlaceHubRoutes(placeHub.slug, placeHub.id);
  } else if (placeHubSlug) {
    revalidatePlaceHubRoutes(placeHubSlug, placeHubId);
  }

  return { ok: true, message: "Peça vinculada ao lugar." };
}

export async function removePlaceHubLinkAction(formData: FormData): Promise<void> {
  const placeHubId = normalize(formData.get("place_hub_id"));
  const linkId = normalize(formData.get("link_id"));

  const { supabase } = await ensureAdmin();

  if (!placeHubId || !linkId) {
    return;
  }

  const { error } = await supabase.from("place_hub_links").delete().eq("id", linkId).eq("place_hub_id", placeHubId);

  if (error) {
    return;
  }

  const placeHub = await getInternalPlaceHubById(placeHubId);
  if (placeHub) {
    revalidatePlaceHubRoutes(placeHub.slug, placeHub.id);
  }
}
