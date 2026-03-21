"use client";

import Link from "next/link";

import { prepareEntryEnrichmentAction, storeEntryAction } from "@/app/interno/enriquecer/actions";
import { editorialEntryStatusLabels, editorialEntryTargetLabels, editorialEntryTypeLabels, type EditorialEntry, type EditorialEntryStatus } from "@/lib/entrada/types";
import { buildEnrichmentDestinationHref } from "@/lib/enriquecimento/resolve";
import { enrichmentDestinationLabels, type EnrichmentDestination } from "@/lib/enriquecimento/types";

type Props = {
  entry: EditorialEntry;
  returnUrl: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTone(status: EditorialEntryStatus) {
  if (status === "draft" || status === "stored") {
    return "hot";
  }

  if (status === "ready_for_enrichment") {
    return "watch";
  }

  if (status === "enriched" || status === "linked" || status === "published") {
    return "calm";
  }

  return "muted";
}

function getNextStep(status: EditorialEntryStatus) {
  if (status === "draft" || status === "stored") {
    return "Abrir e decidir";
  }

  if (status === "ready_for_enrichment") {
    return "Enriquecer agora";
  }

  if (status === "enriched" || status === "linked" || status === "published") {
    return "Abrir destino";
  }

  return "Rever arquivo";
}

const primaryDestinations: EnrichmentDestination[] = ["memoria", "acervo", "editorial"];
const secondaryDestinations: EnrichmentDestination[] = ["dossie", "campaign", "impacto", "edition"];

export function EnrichmentQueueCard({ entry, returnUrl }: Props) {
  const hasFile = Boolean(entry.file_url || entry.file_path);
  const hasCoreLabels = [entry.territory_label || entry.place_label, entry.actor_label || entry.source_label, entry.axis_label].filter(Boolean).length;
  const tone = getTone(entry.entry_status as EditorialEntryStatus);

  return (
    <article className={`card enrichment-queue-card enrichment-queue-card--${tone}`}>
      <div className="meta-row">
        <span className="pill">{editorialEntryTypeLabels[entry.entry_type]}</span>
        <span>{editorialEntryStatusLabels[entry.entry_status]}</span>
        {entry.target_surface ? <span>{editorialEntryTargetLabels[entry.target_surface]}</span> : null}
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.summary || entry.details || "Sem resumo ainda."}</p>
      <p className="meta-row">
        <span>{formatDate(entry.updated_at)}</span>
        <span>{hasFile ? "Tem arquivo" : "Sem arquivo"}</span>
        <span>{hasCoreLabels} campos-base</span>
      </p>
      <p className="meta-row">
        <span>{entry.territory_label || entry.place_label || "Sem território"}</span>
        <span>{entry.actor_label || entry.source_label || "Sem ator/fonte"}</span>
        <span>{entry.axis_label || "Sem eixo"}</span>
      </p>

      <div className="stack-actions">
        <span className={`internal-next-step internal-next-step--${tone}`}>{getNextStep(entry.entry_status as EditorialEntryStatus)}</span>
        <Link href={`/interno/entrada/${entry.id}`} className="button-secondary">
          Abrir
        </Link>
        {primaryDestinations.map((destination) => (
          <form key={destination} action={prepareEntryEnrichmentAction}>
            <input type="hidden" name="entry_id" value={entry.id} />
            <input type="hidden" name="destination" value={destination} />
            <input type="hidden" name="return_url" value={returnUrl} />
            <button type="submit" className="button-secondary">
              {enrichmentDestinationLabels[destination]}
            </button>
          </form>
        ))}
      </div>

      <div className="stack-actions">
        {secondaryDestinations.map((destination) => (
          <form key={destination} action={prepareEntryEnrichmentAction}>
            <input type="hidden" name="entry_id" value={entry.id} />
            <input type="hidden" name="destination" value={destination} />
            <input type="hidden" name="return_url" value={returnUrl} />
            <button type="submit" className="button-secondary">
              {enrichmentDestinationLabels[destination]}
            </button>
          </form>
        ))}
      </div>

      <div className="stack-actions">
        <form action={storeEntryAction}>
          <input type="hidden" name="entry_id" value={entry.id} />
          <input type="hidden" name="return_url" value={returnUrl} />
          <button type="submit" className="button-secondary">
            Guardar sem mudar
          </button>
        </form>
        <Link href={buildEnrichmentDestinationHref("memoria", entry.id)} className="button-secondary">
          Abrir memória
        </Link>
        <Link href={buildEnrichmentDestinationHref("acervo", entry.id)} className="button-secondary">
          Abrir acervo
        </Link>
      </div>
    </article>
  );
}
