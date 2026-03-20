export const actorHubStatuses = ["active", "monitoring", "archive", "draft"] as const;
export type ActorHubStatus = (typeof actorHubStatuses)[number];

export const actorHubActorTypes = [
  "empresa",
  "orgao_publico",
  "hospital",
  "escola",
  "universidade",
  "secretaria",
  "autarquia",
  "grupo_economico",
  "equipamento",
  "outro",
] as const;
export type ActorHubActorType = (typeof actorHubActorTypes)[number];

export const actorHubLinkTypes = [
  "editorial",
  "memory",
  "archive",
  "collection",
  "dossier",
  "campaign",
  "impact",
  "hub",
  "territory",
  "actor",
  "page",
  "external",
] as const;
export type ActorHubLinkType = (typeof actorHubLinkTypes)[number];

export const actorHubLinkRoles = ["lead", "evidence", "context", "followup", "archive"] as const;
export type ActorHubLinkRole = (typeof actorHubLinkRoles)[number];

export const actorHubStatusLabels: Record<ActorHubStatus, string> = {
  active: "Ativo",
  monitoring: "Monitoramento",
  archive: "Arquivo",
  draft: "Rascunho",
};

export const actorHubActorTypeLabels: Record<ActorHubActorType, string> = {
  empresa: "Empresa",
  orgao_publico: "Órgão público",
  hospital: "Hospital",
  escola: "Escola",
  universidade: "Universidade",
  secretaria: "Secretaria",
  autarquia: "Autarquia",
  grupo_economico: "Grupo econômico",
  equipamento: "Equipamento",
  outro: "Outro",
};

export const actorHubLinkTypeLabels: Record<ActorHubLinkType, string> = {
  editorial: "Pauta",
  memory: "Memória",
  archive: "Acervo",
  collection: "Coleção",
  dossier: "Dossiê",
  campaign: "Campanha",
  impact: "Impacto",
  hub: "Eixo",
  territory: "Território",
  actor: "Ator",
  page: "Página",
  external: "Externo",
};

export const actorHubLinkRoleLabels: Record<ActorHubLinkRole, string> = {
  lead: "Peça central",
  evidence: "Evidência",
  context: "Contexto",
  followup: "Desdobramento",
  archive: "Arquivo de base",
};

export type ActorHub = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  lead_question: string | null;
  actor_type: ActorHubActorType | string;
  territory_label: string | null;
  cover_image_url: string | null;
  featured: boolean;
  public_visibility: boolean;
  status: ActorHubStatus | string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ActorHubLink = {
  id: string;
  actor_hub_id: string;
  link_type: ActorHubLinkType | string;
  link_key: string;
  link_role: ActorHubLinkRole | string;
  timeline_year: number | null;
  timeline_label: string | null;
  timeline_note: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ActorHubResolvedLink = ActorHubLink & {
  href: string;
  title: string;
  excerpt: string | null;
  typeLabel: string;
  roleLabel: string;
  external: boolean;
};

export type ActorHubTimelineEntry = ActorHubResolvedLink & {
  yearLabel: string;
};
