import Link from "next/link";

import { editorialEntryStatusLabels, editorialEntryTargetLabels, editorialEntryTypeLabels, type EditorialEntry } from "@/lib/entrada/types";

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

export function EntryCentralReviewCard({ entry }: Props) {
  return (
    <article className="card entry-central-review-card">
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
        <Link href={`/interno/entrada/${entry.id}`} className="button-secondary">
          Abrir
        </Link>
      </div>
    </article>
  );
}
