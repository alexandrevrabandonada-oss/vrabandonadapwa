import type { ParticipationItemRole, ParticipationStatus } from "@/lib/participation/types";

export const participationStatusOrder: Record<ParticipationStatus, number> = {
  active: 1,
  archive: 2,
  draft: 3,
};

export const participationItemRoleOrder: Record<ParticipationItemRole, number> = {
  start: 1,
  context: 2,
  proof: 3,
  deepen: 4,
  follow: 5,
};

export function getParticipationStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "active":
      return "Ativa";
    case "archive":
      return "Arquivo";
    default:
      return status;
  }
}

export function getParticipationStatusTone(status: string) {
  switch (status) {
    case "active":
      return "status-tone--hot";
    case "archive":
      return "status-tone--calm";
    default:
      return "status-tone--draft";
  }
}

export function getParticipationItemRoleLabel(role: string) {
  switch (role) {
    case "start":
      return "Comece por aqui";
    case "context":
      return "Contexto";
    case "proof":
      return "Prova";
    case "deepen":
      return "Aprofunde";
    case "follow":
      return "Acompanhe";
    default:
      return role;
  }
}

export function getParticipationItemRoleTone(role: string) {
  switch (role) {
    case "start":
      return "status-tone--hot";
    case "context":
      return "status-tone--watch";
    case "proof":
      return "status-tone--calm";
    case "deepen":
      return "status-tone--muted";
    case "follow":
      return "status-tone--alert";
    default:
      return "status-tone--muted";
  }
}

export function getParticipationItemTypeLabel(type: string) {
  switch (type) {
    case "page":
      return "Página";
    case "editorial":
      return "Pauta";
    case "dossier":
      return "Dossiê";
    case "memory":
      return "Memória";
    case "archive":
      return "Acervo";
    case "collection":
      return "Coleção";
    case "hub":
      return "Eixo";
    case "series":
      return "Série";
    case "external":
      return "Link externo";
    default:
      return type;
  }
}