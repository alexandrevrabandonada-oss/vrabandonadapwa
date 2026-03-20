"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ImpactState = {
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

function revalidateImpactPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/agora");
  revalidatePath("/impacto");
  revalidatePath(`/impacto/${slug}`);
  revalidatePath("/participe");
  revalidatePath("/metodo");
}

export async function saveImpactAction(_: ImpactState, formData: FormData): Promise<ImpactState> {
  const id = normalize(formData.get("id"));
  const title = normalize(formData.get("title"));
  const slug = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const impactType = normalize(formData.get("impact_type"));
  const status = normalize(formData.get("status"));
  const dateLabel = normalize(formData.get("date_label"));
  const happenedAt = parseDateTime(normalize(formData.get("happened_at")));
  const territoryLabel = normalize(formData.get("territory_label"));
  const coverImageUrl = normalize(formData.get("cover_image_url"));
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
    lead_question: leadQuestion || null,
    impact_type: impactType || "public_pressure",
    status: status || "observed",
    date_label: dateLabel || null,
    happened_at: happenedAt,
    territory_label: territoryLabel || null,
    cover_image_url: coverImageUrl || null,
    featured,
    public_visibility: publicVisibility,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("public_impacts").update(payload).eq("id", id).select("id, slug").maybeSingle()
    : await supabase.from("public_impacts").insert(payload).select("id, slug").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save impact", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar o impacto agora.",
    };
  }

  revalidateImpactPaths(slug);
  revalidatePath("/interno/impacto");
  revalidatePath(`/interno/impacto/${result.data.id}`);
  redirect(`/interno/impacto/${result.data.id}`);
}

export async function saveImpactLinkAction(_: ImpactState, formData: FormData): Promise<ImpactState> {
  const id = normalize(formData.get("id"));
  const impactId = normalize(formData.get("impact_id"));
  const impactSlug = normalize(formData.get("impact_slug"));
  const linkType = normalize(formData.get("link_type"));
  const linkKey = normalize(formData.get("link_key"));
  const linkRole = normalize(formData.get("link_role"));
  const note = normalize(formData.get("note"));
  const intent = normalize(formData.get("intent")) || "save";
  const sortOrder = parseSortOrder(formData.get("sort_order"));
  const featured = parseBoolean(formData.get("featured"));

  if (!impactId) {
    return {
      ok: false,
      message: "Impacto ausente.",
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

    const { error } = await supabase.from("public_impact_links").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete impact link", error);
      return {
        ok: false,
        message: "Não foi possível remover o vínculo.",
      };
    }

    revalidateImpactPaths(impactSlug);
    revalidatePath("/interno/impacto");
    revalidatePath(`/interno/impacto/${impactId}`);
    redirect(`/interno/impacto/${impactId}`);
  }

  if (!linkType || !linkKey || !linkRole) {
    return {
      ok: false,
      message: "Preencha tipo, chave e papel do vínculo.",
    };
  }

  const payload = {
    impact_id: impactId,
    link_type: linkType,
    link_key: linkKey,
    link_role: linkRole,
    note: note || null,
    featured,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("public_impact_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("public_impact_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save impact link", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar o vínculo.",
    };
  }

  revalidateImpactPaths(impactSlug);
  revalidatePath("/interno/impacto");
  revalidatePath(`/interno/impacto/${impactId}`);
  redirect(`/interno/impacto/${impactId}`);
}

