"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalActorHubById } from "@/lib/actors/queries";
import { parseActorHubLinkRef } from "@/lib/actors/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActorHubActionState = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: FormDataEntryValue | null) {
  return normalize(value) === "true" || normalize(value) === "on";
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

function revalidateActorHubRoutes(slug: string, id: string) {
  revalidatePath("/");
  revalidatePath("/atores");
  revalidatePath(`/atores/${slug}`);
  revalidatePath("/interno/atores");
  revalidatePath("/interno/atores/novo");
  revalidatePath(`/interno/atores/${id}`);
}

export async function saveActorHubAction(_: ActorHubActionState, formData: FormData): Promise<ActorHubActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const actorType = normalize(formData.get("actor_type")) || "empresa";
  const territoryLabel = normalize(formData.get("territory_label"));
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
    const current = await getInternalActorHubById(currentId);
    if (!current) {
      return { ok: false, message: "Ator não encontrado." };
    }

    const { error } = await supabase
      .from("actor_hubs")
      .update({
        title,
        excerpt: excerpt || null,
        description: description || null,
        lead_question: leadQuestion || null,
        actor_type: actorType,
        territory_label: territoryLabel || null,
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
      return { ok: false, message: "Não foi possível salvar o ator." };
    }

    revalidateActorHubRoutes(current.slug, current.id);
    return { ok: true, message: "Ator atualizado." };
  }

  const { error } = await supabase.from("actor_hubs").insert({
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    lead_question: leadQuestion || null,
    actor_type: actorType,
    territory_label: territoryLabel || null,
    cover_image_url: coverImageUrl || null,
    status,
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o ator." };
  }

  revalidateActorHubRoutes(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Ator criado." };
}

export async function saveActorHubLinkAction(_: ActorHubActionState, formData: FormData): Promise<ActorHubActionState> {
  const id = normalize(formData.get("id"));
  const actorHubId = normalize(formData.get("actor_hub_id"));
  const actorHubSlug = normalize(formData.get("actor_hub_slug"));
  const linkRef = normalize(formData.get("link_ref"));
  const linkRole = normalize(formData.get("link_role")) || "context";
  const timelineYearRaw = normalize(formData.get("timeline_year"));
  const timelineYear = timelineYearRaw ? Number.parseInt(timelineYearRaw, 10) : null;
  const timelineLabel = normalize(formData.get("timeline_label"));
  const timelineNote = normalize(formData.get("timeline_note"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase } = await ensureAdmin();

  if (!actorHubId) {
    return { ok: false, message: "Ator inválido." };
  }

  const parsed = parseActorHubLinkRef(linkRef);
  if (!parsed) {
    return { ok: false, message: "Escolha uma peça relacionada válida." };
  }

  const payload = {
    actor_hub_id: actorHubId,
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
    ? await supabase.from("actor_hub_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("actor_hub_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    return { ok: false, message: "Não foi possível salvar o vínculo." };
  }

  const actorHub = await getInternalActorHubById(actorHubId);
  if (actorHub) {
    revalidateActorHubRoutes(actorHub.slug, actorHub.id);
  } else if (actorHubSlug) {
    revalidateActorHubRoutes(actorHubSlug, actorHubId);
  }

  return { ok: true, message: "Peça vinculada ao ator." };
}

export async function removeActorHubLinkAction(formData: FormData): Promise<void> {
  const actorHubId = normalize(formData.get("actor_hub_id"));
  const linkId = normalize(formData.get("link_id"));

  const { supabase } = await ensureAdmin();

  if (!actorHubId || !linkId) {
    return;
  }

  const { error } = await supabase.from("actor_hub_links").delete().eq("id", linkId).eq("actor_hub_id", actorHubId);

  if (error) {
    return;
  }

  const actorHub = await getInternalActorHubById(actorHubId);
  if (actorHub) {
    revalidateActorHubRoutes(actorHub.slug, actorHub.id);
  }
}
