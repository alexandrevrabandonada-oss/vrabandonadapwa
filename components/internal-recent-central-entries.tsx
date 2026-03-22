import Link from "next/link";

import type { ArchiveAsset } from "@/lib/archive/types";
import {
  editorialEntryStatusLabels,
  editorialEntryTypeLabels,
  type EditorialEntry,
} from "@/lib/entrada/types";

type InternalRecentCentralEntriesProps = {
  title: string;
  lead: string;
  entries: EditorialEntry[];
  archiveAssets: ArchiveAsset[];
  emptyTitle: string;
  emptyDescription: string;
  fallbackLabel: string;
  fallbackHref: (entry: EditorialEntry) => string;
  linkedLabel?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InternalRecentCentralEntries({
  title,
  lead,
  entries,
  archiveAssets,
  emptyTitle,
  emptyDescription,
  fallbackLabel,
  fallbackHref,
  linkedLabel = "Abrir no acervo",
}: InternalRecentCentralEntriesProps) {
  const archiveByPath = new Map(archiveAssets.filter((asset) => asset.file_path).map((asset) => [asset.file_path, asset]));

  return (
    <div className="section internal-panel">
      <div className="grid-2">
        <div>
          <p className="eyebrow">recentes da central</p>
          <h2>{title}</h2>
        </div>
        <p className="section__lead">{lead}</p>
      </div>

      <div className="grid-3">
        {entries.length ? (
          entries.map((entry) => {
            const linkedAsset = entry.file_path ? archiveByPath.get(entry.file_path) ?? null : null;

            return (
              <article
                key={entry.id}
                className={`card entry-central-review-card entry-central-review-card--${linkedAsset ? "calm" : "watch"}`}
              >
                <div className="meta-row">
                  <span className="pill">{editorialEntryTypeLabels[entry.entry_type]}</span>
                  <span>{editorialEntryStatusLabels[entry.entry_status]}</span>
                  {entry.target_surface ? <span>{entry.target_surface}</span> : null}
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
                    Abrir entrada
                  </Link>
                  {linkedAsset ? (
                    <Link href={`/interno/acervo/${linkedAsset.id}`} className="button-secondary">
                      {linkedLabel}
                    </Link>
                  ) : (
                    <Link href={fallbackHref(entry)} className="button-secondary">
                      {fallbackLabel}
                    </Link>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="support-box">
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
