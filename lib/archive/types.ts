export const archiveAssetTypes = ["photo", "scan", "newspaper", "document", "pdf", "audio", "other"] as const;
export type ArchiveAssetType = (typeof archiveAssetTypes)[number];

export type ArchiveCollection = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  cover_image_url: string | null;
  public_visibility: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ArchiveAsset = {
  id: string;
  memory_item_id: string | null;
  editorial_item_id: string | null;
  collection_slug: string | null;
  title: string;
  asset_type: ArchiveAssetType | string;
  file_url: string;
  file_path: string;
  thumb_url: string | null;
  thumb_path: string | null;
  source_label: string | null;
  source_date_label: string | null;
  approximate_year: number | null;
  place_label: string | null;
  rights_note: string | null;
  description: string | null;
  public_visibility: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};
