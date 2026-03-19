export const memoryArchiveStatuses = ["featured", "active", "archived"] as const;
export type MemoryArchiveStatus = (typeof memoryArchiveStatuses)[number];

export const memoryEditorialStatuses = ["draft", "ready", "published", "archived"] as const;
export type MemoryEditorialStatus = (typeof memoryEditorialStatuses)[number];

export const memoryTypes = ["story", "photo", "document", "landmark", "event"] as const;
export type MemoryType = (typeof memoryTypes)[number];

export type MemoryItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  memory_type: MemoryType | string;
  memory_collection: string;
  collection_slug: string | null;
  collection_title: string | null;
  period_label: string;
  year_start: number | null;
  year_end: number | null;
  place_label: string | null;
  source_note: string | null;
  archive_status: MemoryArchiveStatus | string;
  editorial_status: MemoryEditorialStatus | string;
  published: boolean;
  published_at: string | null;
  featured: boolean;
  highlight_in_memory: boolean;
  timeline_rank: number | null;
  related_editorial_slug: string | null;
  related_series_slug: string | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type MemoryCollection = {
  slug: string;
  title: string;
  description: string;
  display_order?: number;
  featured?: boolean;
  coverImageUrl?: string | null;
};

export type MemoryTimelineEntry = {
  label: string;
  year: string;
  detail: string;
  slug: string | null;
};
