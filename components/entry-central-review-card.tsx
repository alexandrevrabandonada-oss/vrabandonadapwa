import Link from "next/link";

import { editorialEntryStatusLabels, editorialEntryTargetLabels, editorialEntryTypeLabels, type EditorialEntry, type EditorialEntryStatus } from "@/lib/entrada/types";

type Props = {
  entry: EditorialEntry;
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
    return "Ir para enriquecer";
  }

  if (status === "enriched" || status === "linked" || status === "published") {
    return "Abrir destino";
  }

  return "Rever arquivo";
}

export function EntryCentralReviewCard({ entry }: Props) {
  const tone = getTone(entry.entry_status);

  return (
    <article className={`card entry-central-review-card entry-central-review-card--${tone}`}>
      <div className="meta-row">
        <span className="pill">{editorialEntryTypeLabels[entry.entry_type]}</span>
        <span>{editorialEntryStatusLabels[entry.entry_status]}</span>
        {entry.target_surface ? <span>{editorialEntryTargetLabels[entry.target_surface]}</span> : null}
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.summary || entry.details || "Sem resumo ainda."}</p>
      <p className="meta-row">
        <span>{entry.territory_label || entry.place_label || "Sem território"}</span>
        <span>{entry.actor_label || entry.source_label || "Sem ator/fonte"}</span>
        <span>{formatDate(entry.updated_at)}</span>
      </p>
      <div className="stack-actions">
        <span className={`internal-next-step internal-next-step--${tone}`}>{getNextStep(entry.entry_status)}</span>
        <Link href={`/interno/entrada/${entry.id}`} className="button-secondary">
          Abrir
        </Link>
      </div>
    </article>
  );
}
