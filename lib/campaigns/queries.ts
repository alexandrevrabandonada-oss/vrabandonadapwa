import { campaignMockItems, campaignLinkMockItems } from "@/lib/campaigns/mock";
import { getCampaignStatusSortOrder } from "@/lib/campaigns/navigation";
import type { PublicCampaign, PublicCampaignLink } from "@/lib/campaigns/types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicFields =
  "id, title, slug, excerpt, description, status, campaign_type, lead_question, start_date, end_date, cover_image_url, featured, public_visibility, sort_order, created_at, updated_at, created_by, updated_by";
const internalFields = publicFields;
const linkFields = "id, campaign_id, link_type, link_key, link_role, note, featured, sort_order, created_at, updated_at";

function sortCampaigns(items: PublicCampaign[]) {
  return [...items].sort((a, b) => {
    const aStatus = getCampaignStatusSortOrder(a.status);
    const bStatus = getCampaignStatusSortOrder(b.status);

    if (aStatus !== bStatus) {
      return aStatus - bStatus;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function sortLinks(items: PublicCampaignLink[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getFallbackCampaigns() {
  return sortCampaigns(campaignMockItems.filter((campaign) => campaign.public_visibility));
}

function getFallbackLinks(campaignId: string) {
  return sortLinks(campaignLinkMockItems.filter((link) => link.campaign_id === campaignId));
}

export async function getPublishedCampaigns() {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackCampaigns();
  }

  const { data, error } = await supabase
    .from("public_campaigns")
    .select(publicFields)
    .eq("public_visibility", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return getFallbackCampaigns();
  }

  return sortCampaigns(data as PublicCampaign[]);
}

export async function getPublishedCampaignBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedCampaigns()).find((campaign) => campaign.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("public_campaigns")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedCampaigns()).find((campaign) => campaign.slug === slug) ?? null;
  }

  return data as PublicCampaign;
}

export async function getPublishedCampaignById(id: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return (await getPublishedCampaigns()).find((campaign) => campaign.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("public_campaigns")
    .select(publicFields)
    .eq("public_visibility", true)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (await getPublishedCampaigns()).find((campaign) => campaign.id === id) ?? null;
  }

  return data as PublicCampaign;
}

export async function getPublishedCampaignLinks(campaignId: string) {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return getFallbackLinks(campaignId);
  }

  const { data, error } = await supabase
    .from("public_campaign_links")
    .select(linkFields)
    .eq("campaign_id", campaignId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getFallbackLinks(campaignId);
  }

  return sortLinks(data as PublicCampaignLink[]);
}

export async function getInternalCampaigns(filters?: { status?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("public_campaigns").select(internalFields).order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortCampaigns((data ?? []) as PublicCampaign[]);
}

export async function getInternalCampaignById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("public_campaigns").select(internalFields).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PublicCampaign | null) ?? null;
}

export async function getInternalCampaignBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("public_campaigns").select(internalFields).eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PublicCampaign | null) ?? null;
}

export async function getInternalCampaignLinks(campaignId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("public_campaign_links")
    .select(linkFields)
    .eq("campaign_id", campaignId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortLinks((data ?? []) as PublicCampaignLink[]);
}
