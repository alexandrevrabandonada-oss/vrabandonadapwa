export const editorialStatuses = ["draft", "ready", "published", "archived"] as const;
export type EditorialStatus = (typeof editorialStatuses)[number];

export type EditorialItem = {
  id: string;
  intake_submission_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  editorial_status: EditorialStatus | string;
  featured: boolean;
  source_visibility_note: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export const editorialStatusLabels: Record<EditorialStatus, string> = {
  draft: "Rascunho",
  ready: "Pronto",
  published: "Publicado",
  archived: "Arquivado",
};
