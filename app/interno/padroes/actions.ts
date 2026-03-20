"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalPatternReadById } from "@/lib/patterns/queries";
import { parsePatternReadLinkRef } from "@/lib/patterns/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PatternReadActionState = {
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

function revalidatePatternReadRoutes(slug: string, id: string) {
  revalidatePath("/");
  revalidatePath("/padroes");
  revalidatePath(`/padroes/${slug}`);
  revalidatePath("/interno/padroes");
  revalidatePath("/interno/padroes/novo");
  revalidatePath(`/interno/padroes/${id}`);
}

export async function savePatternReadAction(_: PatternReadActionState, formData: FormData): Promise<PatternReadActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const patternType = normalize(formData.get("pattern_type")) || "thematic_pattern";
  const leadQuestion = normalize(formData.get("lead_question"));
  const status = normalize(formData.get("status")) || "draft";
  const coverImageUrl = normalize(formData.get("cover_image_url"));
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
    const current = await getInternalPatternReadById(currentId);
    if (!current) {
      return { ok: false, message: "Padrão não encontrado." };
    }

    const { error } = await supabase
      .from("pattern_reads")
      .update({
        title,
        slug: normalizedSlug,
        excerpt: excerpt || null,
        description: description || null,
        pattern_type: patternType,
        lead_question: leadQuestion || null,
        status,
        cover_image_url: coverImageUrl || null,
        public_visibility: publicVisibility,
        featured,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
        updated_by: user.email || null,
      })
      .eq("id", currentId);

    if (error) {
      return { ok: false, message: "Não foi possível salvar o padrão." };
    }

    revalidatePatternReadRoutes(current.slug, current.id);
    if (current.slug !== normalizedSlug) {
      revalidatePatternReadRoutes(normalizedSlug, current.id);
    }

    return { ok: true, message: "Padrão atualizado." };
  }

  const { error } = await supabase.from("pattern_reads").insert({
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    pattern_type: patternType,
    lead_question: leadQuestion || null,
    status,
    cover_image_url: coverImageUrl || null,
    public_visibility: publicVisibility,
    featured,
    sort_order: sortOrder,
    created_by: user.email || null,
    updated_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o padrão." };
  }

  revalidatePatternReadRoutes(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Padrão criado." };
}

export async function savePatternReadLinkAction(_: PatternReadActionState, formData: FormData): Promise<PatternReadActionState> {
  const id = normalize(formData.get("id"));
  const patternReadId = normalize(formData.get("pattern_read_id"));
  const patternReadSlug = normalize(formData.get("pattern_read_slug"));
  const linkRef = normalize(formData.get("link_ref"));
  const linkRole = normalize(formData.get("link_role")) || "context";
  const timelineYearRaw = normalize(formData.get("timeline_year"));
  const timelineYear = timelineYearRaw ? Number.parseInt(timelineYearRaw, 10) : null;
  const timelineLabel = normalize(formData.get("timeline_label"));
  const timelineNote = normalize(formData.get("timeline_note"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase } = await ensureAdmin();

  if (!patternReadId) {
    return { ok: false, message: "Padrão inválido." };
  }

  const parsed = parsePatternReadLinkRef(linkRef);
  if (!parsed) {
    return { ok: false, message: "Escolha uma peça relacionada válida." };
  }

  const payload = {
    pattern_read_id: patternReadId,
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
    ? await supabase.from("pattern_read_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("pattern_read_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    return { ok: false, message: "Não foi possível salvar o vínculo." };
  }

  const patternRead = await getInternalPatternReadById(patternReadId);
  if (patternRead) {
    revalidatePatternReadRoutes(patternRead.slug, patternRead.id);
  } else if (patternReadSlug) {
    revalidatePatternReadRoutes(patternReadSlug, patternReadId);
  }

  return { ok: true, message: "Peça vinculada ao padrão." };
}

export async function removePatternReadLinkAction(formData: FormData): Promise<void> {
  const patternReadId = normalize(formData.get("pattern_read_id"));
  const linkId = normalize(formData.get("link_id"));

  const { supabase } = await ensureAdmin();

  if (!patternReadId || !linkId) {
    return;
  }

  const { error } = await supabase.from("pattern_read_links").delete().eq("id", linkId).eq("pattern_read_id", patternReadId);

  if (error) {
    return;
  }

  const patternRead = await getInternalPatternReadById(patternReadId);
  if (patternRead) {
    revalidatePatternReadRoutes(patternRead.slug, patternRead.id);
  }
}
