"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CampaignState = {
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

function revalidateCampaignPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/agora");
  revalidatePath("/campanhas");
  revalidatePath(`/campanhas/${slug}`);
  revalidatePath("/participe");
  revalidatePath("/metodo");
}

export async function saveCampaignAction(_: CampaignState, formData: FormData): Promise<CampaignState> {
  const id = normalize(formData.get("id"));
  const title = normalize(formData.get("title"));
  const slug = normalize(formData.get("slug"));
  const excerpt = normalize(formData.get("excerpt"));
  const description = normalize(formData.get("description"));
  const leadQuestion = normalize(formData.get("lead_question"));
  const campaignType = normalize(formData.get("campaign_type"));
  const status = normalize(formData.get("status"));
  const startDate = normalize(formData.get("start_date"));
  const endDate = normalize(formData.get("end_date"));
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
    status: status || "upcoming",
    campaign_type: campaignType || "call",
    lead_question: leadQuestion || null,
    start_date: startDate || null,
    end_date: endDate || null,
    cover_image_url: coverImageUrl || null,
    featured,
    public_visibility: publicVisibility,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("public_campaigns").update(payload).eq("id", id).select("id, slug").maybeSingle()
    : await supabase.from("public_campaigns").insert(payload).select("id, slug").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save campaign", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar a campanha agora.",
    };
  }

  revalidateCampaignPaths(slug);
  revalidatePath("/interno/campanhas");
  revalidatePath(`/interno/campanhas/${result.data.id}`);
  redirect(`/interno/campanhas/${result.data.id}`);
}

export async function saveCampaignLinkAction(_: CampaignState, formData: FormData): Promise<CampaignState> {
  const id = normalize(formData.get("id"));
  const campaignId = normalize(formData.get("campaign_id"));
  const campaignSlug = normalize(formData.get("campaign_slug"));
  const linkType = normalize(formData.get("link_type"));
  const linkKey = normalize(formData.get("link_key"));
  const linkRole = normalize(formData.get("link_role"));
  const note = normalize(formData.get("note"));
  const intent = normalize(formData.get("intent")) || "save";
  const sortOrder = parseSortOrder(formData.get("sort_order"));
  const featured = parseBoolean(formData.get("featured"));

  if (!campaignId) {
    return {
      ok: false,
      message: "Campanha ausente.",
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

    const { error } = await supabase.from("public_campaign_links").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete campaign link", error);
      return {
        ok: false,
        message: "Não foi possível remover o vínculo.",
      };
    }

    revalidateCampaignPaths(campaignSlug);
    revalidatePath("/interno/campanhas");
    revalidatePath(`/interno/campanhas/${campaignId}`);
    redirect(`/interno/campanhas/${campaignId}`);
  }

  if (!linkType || !linkKey || !linkRole) {
    return {
      ok: false,
      message: "Preencha tipo, chave e papel do vínculo.",
    };
  }

  const payload = {
    campaign_id: campaignId,
    link_type: linkType,
    link_key: linkKey,
    link_role: linkRole,
    note: note || null,
    featured,
    sort_order: sortOrder,
  };

  const result = id
    ? await supabase.from("public_campaign_links").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("public_campaign_links").insert(payload).select("id").maybeSingle();

  if (result.error || !result.data) {
    console.error("Failed to save campaign link", result.error);
    return {
      ok: false,
      message: "Não foi possível salvar o vínculo.",
    };
  }

  revalidateCampaignPaths(campaignSlug);
  revalidatePath("/interno/campanhas");
  revalidatePath(`/interno/campanhas/${campaignId}`);
  redirect(`/interno/campanhas/${campaignId}`);
}
