import type { SearchContentType } from "@/lib/search/types";

export const timelineDateBasisValues = ["historical", "approximate", "editorial", "operational", "unknown"] as const;
export type TimelineDateBasis = (typeof timelineDateBasisValues)[number];

export const timelinePeriodKeys = ["origens", "formacao", "reconfiguracao", "presente", "agora", "sem_data"] as const;
export type TimelinePeriodKey = (typeof timelinePeriodKeys)[number];

export const timelineSortModes = ["chronological", "recent"] as const;
export type TimelineSortMode = (typeof timelineSortModes)[number];

export type TimelineEntry = {
  id: string;
  contentType: SearchContentType;
  contentKey: string;
  title: string;
  excerpt: string | null;
  contentHref: string;
  timelineHref: string;
  kindLabel: string;
  labels: string[];
  territoryLabel: string | null;
  actorLabel: string | null;
  yearValue: number | null;
  yearLabel: string | null;
  dateLabel: string | null;
  dateBasis: TimelineDateBasis;
  periodKey: TimelinePeriodKey;
  periodLabel: string;
  featured: boolean;
  sortDate: string;
  sortOrder: number;
  saveKind: string | null;
  followKind: string | null;
  sourceNote: string | null;
};

export type TimelineFacet = {
  value: string;
  label: string;
  count: number;
};

export type TimelineFilters = {
  query: string;
  contentType: string;
  territory: string;
  actor: string;
  period: string;
  sort: TimelineSortMode;
};

export type TimelinePageData = {
  entries: TimelineEntry[];
  spotlight: TimelineEntry | null;
  total: number;
  facets: {
    types: TimelineFacet[];
    territories: TimelineFacet[];
    actors: TimelineFacet[];
    periods: TimelineFacet[];
  };
};
