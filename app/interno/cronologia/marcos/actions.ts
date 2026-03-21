"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getInternalTimelineHighlightById } from "@/lib/timeline/highlight-queries";
import { parseTimelineHighlightLinkRef } from "@/lib/timeline/highlight-resolve";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TimelineHighlightActionState = {
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

function revalidateHighlightRoutes(slug: string, id: string) {
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/agora");
  revalidatePath("/linha-do-tempo");
  revalidatePath(`/linha-do-tempo/marcos/${slug}`);
  revalidatePath("/interno/cronologia");
  revalidatePath("/interno/cronologia/marcos");
  revalidatePath("/interno/cronologia/marcos/novo");
  revalidatePath(`/interno/cronologia/marcos/${id}`);
}

export async function saveTimelineHighlightAction(_: TimelineHighlightActionState, formData: FormData): Promise<TimelineHighlightActionState> {
  const currentId = normalize(formData.get("id")) || null;
  const title = normalize(formData.get("title"));
  const slugInput = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const highlightType = normalize(formData.get("highlight_type")) || "investigation_marker";
  const dateLabel = normalize(formData.get("date_label"));
  const periodLabel = normalize(formData.get("period_label"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
  const status = normalize(formData.get("status")) || "draft";
  const publicVisibility = toBool(formData.get("public_visibility"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;
  const yearStartRaw = normalize(formData.get("year_start"));
  const yearEndRaw = normalize(formData.get("year_end"));
  const yearStart = yearStartRaw ? Number.parseInt(yearStartRaw, 10) : null;
  const yearEnd = yearEndRaw ? Number.parseInt(yearEndRaw, 10) : null;

  const { supabase, user } = await ensureAdmin();

  if (!title) {
    return { ok: false, message: "Título é obrigatório." };
  }

  const normalizedSlug = slugify(slugInput || title);
  if (!normalizedSlug) {
    return { ok: false, message: "Slug inválido." };
  }

  const payload = {
    title,
    slug: normalizedSlug,
    excerpt: excerpt || null,
    description: description || null,
    highlight_type: highlightType,
    date_label: dateLabel || null,
    year_start: Number.isNaN(yearStart) ? null : yearStart,
    year_end: Number.isNaN(yearEnd) ? null : yearEnd,
    period_label: periodLabel || null,
    lead_question: leadQuestion || null,
    cover_image_url: coverImageUrl || null,
    featured,
    public_visibility: publicVisibility,
    status,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
    updated_by: user.email || null,
  };

  if (currentId) {
    const current = await getInternalTimelineHighlightById(currentId);
    if (!current) {
      return { ok: false, message: "Marco não encontrado." };
    }

    const { error } = await supabase.from("timeline_highlights").update(payload).eq("id", currentId);
    if (error) {
      return { ok: false, message: "Não foi possível salvar o marco." };
    }

    revalidateHighlightRoutes(current.slug, current.id);
    if (current.slug !== normalizedSlug) {
      revalidateHighlightRoutes(normalizedSlug, current.id);
    }

    return { ok: true, message: "Marco atualizado." };
  }

  const { error } = await supabase.from("timeline_highlights").insert({
    ...payload,
    created_by: user.email || null,
  });

  if (error) {
    return { ok: false, message: "Não foi possível criar o marco." };
  }

  revalidateHighlightRoutes(normalizedSlug, normalizedSlug);
  return { ok: true, message: "Marco criado." };
}

export async function saveTimelineHighlightLinkAction(_: TimelineHighlightActionState, formData: FormData): Promise<TimelineHighlightActionState> {
  const id = normalize(formData.get("id")) || null;
  const highlightId = normalize(formData.get("timeline_highlight_id"));
  const highlightSlug = normalize(formData.get("timeline_highlight_slug"));
  const linkRef = normalize(formData.get("link_ref"));
  const linkRole = normalize(formData.get("link_role")) || "context";
  const timelineYearRaw = normalize(formData.get("timeline_year"));
  const timelineYear = timelineYearRaw ? Number.parseInt(timelineYearRaw, 10) : null;
  const timelineLabel = normalize(formData.get("timeline_label"));
  const timelineNote = normalize(formData.get("timeline_note"));
  const featured = toBool(formData.get("featured"));
  const sortOrder = Number.parseInt(normalize(formData.get("sort_order")), 10) || 0;

  const { supabase } = await ensureAdmin();

  if (!highlightId) {
    return { ok: false, message: "Marco inválido." };
  }

  const parsed = parseTimelineHighlightLinkRef(linkRef);
  if (!parsed) {
    return { ok: false, message: "Escolha uma peça relacionada válida." };
  }

  const payload = {
    timeline_highlight_id: highlightId,
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
    ? await supabase.from("timeline_highlight_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("timeline_highlight_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    return { ok: false, message: "Não foi possível salvar o vínculo." };
  }

  const highlight = await getInternalTimelineHighlightById(highlightId);
  if (highlight) {
    revalidateHighlightRoutes(highlight.slug, highlight.id);
  } else if (highlightSlug) {
    revalidateHighlightRoutes(highlightSlug, highlightId);
  }

  return { ok: true, message: "Peça vinculada ao marco." };
}

export async function removeTimelineHighlightLinkAction(formData: FormData): Promise<void> {
  const highlightId = normalize(formData.get("timeline_highlight_id"));
  const linkId = normalize(formData.get("link_id"));

  const { supabase } = await ensureAdmin();

  if (!highlightId || !linkId) {
    return;
  }

  const { error } = await supabase.from("timeline_highlight_links").delete().eq("id", linkId).eq("timeline_highlight_id", highlightId);

  if (error) {
    return;
  }

  const highlight = await getInternalTimelineHighlightById(highlightId);
  if (highlight) {
    revalidateHighlightRoutes(highlight.slug, highlight.id);
  }
}
