export type SearchContentType =
  | "pauta"
  | "memoria"
  | "acervo"
  | "colecao"
  | "marco"
  | "dossie"
  | "campanha"
  | "impacto"
  | "eixo"
  | "territorio"
  | "ator"
  | "padrao"
  | "edicao"
  | "serie"
  | "rota"
  | "participacao";

export type SearchSortMode = "relevant" | "recent";

export type SearchFacet = {
  value: string;
  label: string;
  count: number;
};

export type SearchFilters = {
  query: string;
  contentType: string;
  territory: string;
  actor: string;
  sort: SearchSortMode;
};

export type SearchIndexEntry = {
  id: string;
  contentType: SearchContentType;
  contentKey: string;
  title: string;
  excerpt: string;
  href: string;
  kindLabel: string;
  labels: string[];
  territoryLabel: string | null;
  actorLabel: string | null;
  updatedAt: string | null;
  featured: boolean;
  searchableText: string;
  saveKind: string | null;
  followKind: string | null;
};

export type SearchResults = {
  query: string;
  filters: SearchFilters;
  results: SearchIndexEntry[];
  total: number;
  facets: {
    types: SearchFacet[];
    territories: SearchFacet[];
    actors: SearchFacet[];
  };
};
