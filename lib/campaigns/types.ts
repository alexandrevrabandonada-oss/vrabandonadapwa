export const campaignStatuses = ["upcoming", "active", "monitoring", "closed", "archived"] as const;
export type CampaignStatus = (typeof campaignStatuses)[number];

export const campaignTypes = ["call", "collection", "pressure", "memory", "support", "investigation"] as const;
export type CampaignType = (typeof campaignTypes)[number];

export const campaignLinkTypes = ["editorial", "memory", "archive", "collection", "dossier", "series", "hub", "page", "external"] as const;
export type CampaignLinkType = (typeof campaignLinkTypes)[number];

export const campaignLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type CampaignLinkRole = (typeof campaignLinkRoles)[number];

export type PublicCampaign = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  status: CampaignStatus;
  campaign_type: CampaignType;
  lead_question: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type PublicCampaignLink = {
  id: string;
  campaign_id: string;
  link_type: CampaignLinkType;
  link_key: string;
  link_role: CampaignLinkRole;
  note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CampaignLinkResolved = PublicCampaignLink & {
  href: string;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};
