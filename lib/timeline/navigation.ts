import type { SearchContentType } from "@/lib/search/types";
import { getSearchContentTypeLabel, getSearchFollowKind, getSearchSaveKind } from "@/lib/search/navigation";

import type { TimelineDateBasis, TimelinePeriodKey } from "@/lib/timeline/types";

export const timelineContentTypeOrder: SearchContentType[] = [
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

export const timelinePeriodLabels: Record<TimelinePeriodKey, string> = {
  origens: "Origens (até 1989)",
  formacao: "Formação (1990–2003)",
  reconfiguracao: "Reconfiguração (2004–2014)",
  presente: "Presente (2015–2019)",
  agora: "Agora (2020+)",
  sem_data: "Sem data forte",
};

export const timelineDateBasisLabels: Record<TimelineDateBasis, string> = {
  historical: "Data histórica",
  approximate: "Data aproximada",
  editorial: "Data editorial",
  operational: "Data operacional",
  unknown: "Sem data forte",
};

export const timelineDateBasisTone: Record<TimelineDateBasis, string> = {
  historical: "timeline-basis timeline-basis--historical",
  approximate: "timeline-basis timeline-basis--approximate",
  editorial: "timeline-basis timeline-basis--editorial",
  operational: "timeline-basis timeline-basis--operational",
  unknown: "timeline-basis timeline-basis--unknown",
};

export function getTimelineContentTypeLabel(type: SearchContentType) {
  return getSearchContentTypeLabel(type);
}

export function getTimelineSaveKind(type: SearchContentType) {
  return getSearchSaveKind(type);
}

export function getTimelineFollowKind(type: SearchContentType) {
  return getSearchFollowKind(type);
}

export function getTimelineContentTypeSortOrder(type: SearchContentType) {
  const index = timelineContentTypeOrder.indexOf(type);
  return index >= 0 ? index : timelineContentTypeOrder.length;
}

export function getTimelinePeriodKey(year: number | null) {
  if (year === null || Number.isNaN(year)) {
    return "sem_data";
  }

  if (year <= 1989) {
    return "origens";
  }

  if (year <= 2003) {
    return "formacao";
  }

  if (year <= 2014) {
    return "reconfiguracao";
  }

  if (year <= 2019) {
    return "presente";
  }

  return "agora";
}

export function getTimelinePeriodLabel(periodKey: TimelinePeriodKey) {
  return timelinePeriodLabels[periodKey];
}

export function getTimelineDateBasisLabel(basis: TimelineDateBasis) {
  return timelineDateBasisLabels[basis];
}

export function getTimelineDateBasisTone(basis: TimelineDateBasis) {
  return timelineDateBasisTone[basis];
}

export function getTimelineEntryHref(contentType: SearchContentType, contentKey: string) {
  if (contentType === "marco") {
    return `/linha-do-tempo/marcos/${contentKey}`;
  }

  return `/linha-do-tempo/${contentType}/${contentKey}`;
}
