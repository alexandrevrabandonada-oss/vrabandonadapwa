export const editorialEntryTypes = ["post", "document", "image"] as const;
export type EditorialEntryType = (typeof editorialEntryTypes)[number];

export const editorialEntryStatuses = ["draft", "stored", "ready_for_enrichment", "enriched", "linked", "published", "archived"] as const;
export type EditorialEntryStatus = (typeof editorialEntryStatuses)[number];

export const editorialEntryTargets = ["agora", "acervo", "memoria", "dossie", "campaign", "impacto", "edition"] as const;
export type EditorialEntryTarget = (typeof editorialEntryTargets)[number];

export type EditorialEntry = {
  id: string;
  entry_type: EditorialEntryType;
  entry_status: EditorialEntryStatus;
  target_surface: EditorialEntryTarget | null;
  title: string;
  summary: string | null;
  details: string | null;
  file_url: string | null;
  file_path: string | null;
  file_name: string | null;
  source_label: string | null;
  year_label: string | null;
  approximate_year: number | null;
  place_label: string | null;
  territory_label: string | null;
  actor_label: string | null;
  axis_label: string | null;
  notes: string | null;
  featured: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export const editorialEntryTypeLabels: Record<EditorialEntryType, string> = {
  post: "Post do dia",
  document: "Documento / artigo / PDF",
  image: "Foto histórica / imagem de acervo",
};

export const editorialEntryStatusLabels: Record<EditorialEntryStatus, string> = {
  draft: "Rascunho",
  stored: "Guardado",
  ready_for_enrichment: "Pronto para enriquecer",
  enriched: "Enriquecido",
  linked: "Vinculado",
  published: "Publicado",
  archived: "Arquivado",
};

export const editorialEntryTargetLabels: Record<NonNullable<EditorialEntryTarget>, string> = {
  agora: "Agora",
  acervo: "Acervo",
  memoria: "Memória",
  dossie: "Dossiê",
  campaign: "Campanha",
  impacto: "Impacto",
  edition: "Edição",
};

export const editorialEntryTypeOrder: EditorialEntryType[] = ["post", "document", "image"];
export const editorialEntryStatusOrder: EditorialEntryStatus[] = ["published", "linked", "enriched", "ready_for_enrichment", "stored", "draft", "archived"];
