export const editorialStatuses = ["draft", "in_review", "ready", "published", "archived"] as const;
export type EditorialStatus = (typeof editorialStatuses)[number];

export const editorialReviewStatuses = ["pending", "in_review", "reviewed", "blocked"] as const;
export type EditorialReviewStatus = (typeof editorialReviewStatuses)[number];

export const editorialAuditEventTypes = [
  "draft_created",
  "content_updated",
  "sent_to_review",
  "returned_to_draft",
  "published",
  "unpublished",
  "archived",
] as const;
export type EditorialAuditEventType = (typeof editorialAuditEventTypes)[number];

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
  review_status: EditorialReviewStatus | string;
  featured: boolean;
  publication_reason: string | null;
  sensitivity_check_passed: boolean;
  fact_check_note: string | null;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
  published_by: string | null;
  archived_reason: string | null;
  source_visibility_note: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type EditorialAuditLogEntry = {
  id: string;
  editorial_item_id: string;
  actor_email: string | null;
  event_type: EditorialAuditEventType | string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
};

export const editorialStatusLabels: Record<EditorialStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  ready: "Pronto",
  published: "Publicado",
  archived: "Arquivado",
};

export const editorialReviewStatusLabels: Record<EditorialReviewStatus, string> = {
  pending: "Pendente",
  in_review: "Em revisão",
  reviewed: "Revisado",
  blocked: "Bloqueado",
};

export const editorialAuditEventLabels: Record<EditorialAuditEventType, string> = {
  draft_created: "Rascunho criado",
  content_updated: "Conteúdo atualizado",
  sent_to_review: "Enviado para revisão",
  returned_to_draft: "Devolvido ao rascunho",
  published: "Publicado",
  unpublished: "Despublicado",
  archived: "Arquivado",
};
