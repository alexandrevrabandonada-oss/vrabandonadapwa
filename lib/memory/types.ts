export const memoryArchiveStatuses = ["featured", "active", "archived"] as const;
export type MemoryArchiveStatus = (typeof memoryArchiveStatuses)[number];

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
  period_label: string;
  year_start: number | null;
  year_end: number | null;
  place_label: string | null;
  source_note: string | null;
  archive_status: MemoryArchiveStatus | string;
  highlight_in_memory: boolean;
  related_editorial_slug: string | null;
  related_series_slug: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type MemoryCollection = {
  slug: string;
  title: string;
  description: string;
};

export type MemoryTimelineEntry = {
  label: string;
  year: string;
  detail: string;
  slug: string | null;
};
