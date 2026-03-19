export const intakeStatuses = ["new", "reviewing", "archived", "published"] as const;
export const intakeCategories = [
  "denuncia",
  "memoria",
  "pauta",
  "apoio",
] as const;

export type IntakeStatus = (typeof intakeStatuses)[number];
export type IntakeCategory = (typeof intakeCategories)[number];

export type IntakeSubmission = {
  id: string;
  category: IntakeCategory | string;
  source_type: string | null;
  title: string;
  location: string | null;
  details: string;
  contact: string | null;
  anonymous: boolean;
  is_sensitive: boolean;
  contact_allowed: boolean;
  safe_public_summary: string | null;
  internal_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  status: IntakeStatus | string;
  created_at: string;
};

export const intakeStatusLabels: Record<IntakeStatus, string> = {
  new: "Novo",
  reviewing: "Em triagem",
  archived: "Arquivado",
  published: "Publicado",
};

export const intakeCategoryLabels: Record<IntakeCategory, string> = {
  denuncia: "Denúncia",
  memoria: "Memória",
  pauta: "Pauta",
  apoio: "Apoio",
};
