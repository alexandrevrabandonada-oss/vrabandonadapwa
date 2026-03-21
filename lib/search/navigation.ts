import type { SearchContentType } from "@/lib/search/types";

export const searchContentTypeLabels: Record<SearchContentType, string> = {
  pauta: "Pauta",
  memoria: "Memória",
  acervo: "Acervo",
  colecao: "Coleção",
  marco: "Marco",
  dossie: "Dossiê",
  campanha: "Campanha",
  impacto: "Impacto",
  eixo: "Eixo",
  territorio: "Território",
  ator: "Ator",
  padrao: "Padrão",
  edicao: "Edição",
  serie: "Série",
  rota: "Rota",
  participacao: "Participação",
};

export const searchContentTypeOrder: SearchContentType[] = [
  "marco",
  "dossie",
  "campanha",
  "impacto",
  "eixo",
  "territorio",
  "ator",
  "edicao",
  "padrao",
  "pauta",
  "memoria",
  "acervo",
  "colecao",
  "serie",
  "rota",
  "participacao",
];

export const searchFollowKindByContentType: Partial<Record<SearchContentType, string>> = {
  marco: "marco",
  eixo: "hub",
  territorio: "territory",
  ator: "actor",
  dossie: "dossier",
  campanha: "campaign",
  impacto: "impact",
  edicao: "edition",
  padrao: "pattern",
};

export const searchSaveKindByContentType: Partial<Record<SearchContentType, string>> = {
  marco: "marco",
  pauta: "pauta",
  memoria: "memory",
  acervo: "archive",
  colecao: "collection",
  dossie: "dossier",
  campanha: "campaign",
  impacto: "impact",
  eixo: "hub",
  territorio: "territory",
  ator: "actor",
  padrao: "pattern",
  edicao: "edition",
  serie: "series",
  rota: "route",
  participacao: "participation",
};

export function getSearchContentTypeLabel(type: string) {
  return searchContentTypeLabels[type as SearchContentType] ?? type;
}

export function getSearchSaveKind(type: SearchContentType) {
  return searchSaveKindByContentType[type] ?? null;
}

export function getSearchFollowKind(type: SearchContentType) {
  return searchFollowKindByContentType[type] ?? null;
}
