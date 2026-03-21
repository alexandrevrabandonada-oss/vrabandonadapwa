import Link from "next/link";

import { editorialEntryStatusLabels, editorialEntryTargetLabels, editorialEntryTypeLabels, type EditorialEntry, type EditorialEntryStatus } from "@/lib/entrada/types";

type Props = {
  entries: EditorialEntry[];
  title: string;
  lead: string;
};

type PriorityBucket = {
  key: string;
  label: string;
  statusLabels: EditorialEntryStatus[];
  actionLabel: string;
  emptyLabel: string;
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

function getActionLabel(bucketKey: string) {
  switch (bucketKey) {
    case "urgent":
      return "Abrir e decidir";
    case "ready":
      return "Enriquecer agora";
    case "published":
      return "Abrir e revisar";
    default:
      return "Abrir";
  }
}

function getActionHref(bucketKey: string, entry: EditorialEntry) {
  if (bucketKey === "ready") {
    return `/interno/enriquecer?status=ready_for_enrichment&tipo=${entry.entry_type}`;
  }

  return `/interno/entrada/${entry.id}`;
}

const buckets: PriorityBucket[] = [
  {
    key: "urgent",
    label: "3 urgentes",
    statusLabels: ["draft", "stored"],
    actionLabel: "Abrir e decidir",
    emptyLabel: "Nada urgente agora.",
  },
  {
    key: "ready",
    label: "3 prontos para enriquecer",
    statusLabels: ["ready_for_enrichment"],
    actionLabel: "Enriquecer agora",
    emptyLabel: "Nada pronto para enriquecer.",
  },
  {
    key: "published",
    label: "3 publicados rápidos",
    statusLabels: ["enriched", "linked", "published"],
    actionLabel: "Abrir e revisar",
    emptyLabel: "Nada publicado rápido para descer.",
  },
];

export function InternalPriorityBoard({ entries, title, lead }: Props) {
  const grouped = buckets.map((bucket) => {
    const items = entries.filter((entry) => bucket.statusLabels.includes(entry.entry_status)).slice(0, 3);
    return { ...bucket, items };
  });

  return (
    <section className="section internal-panel internal-priority-board" aria-label={title}>
      <div className="grid-2">
        <div>
          <p className="eyebrow">prioridade do momento</p>
          <h2>{title}</h2>
        </div>
        <p className="section__lead">{lead}</p>
      </div>

      <div className="internal-priority-board__grid">
        {grouped.map((bucket) => (
          <article key={bucket.key} className={`card internal-priority-board__column internal-priority-board__column--${bucket.key}`}>
            <div className="internal-priority-board__column-head">
              <div>
                <p className="eyebrow">{bucket.label}</p>
                <h3>{bucket.items.length}</h3>
              </div>
              <span className="internal-priority-board__action-label">{bucket.actionLabel}</span>
            </div>

            {bucket.items.length > 0 ? (
              <div className="internal-priority-board__list">
                {bucket.items.map((entry) => (
                  <article key={entry.id} className={`internal-priority-board__item internal-priority-board__item--${getTone(entry.entry_status)}`}>
                    <div className="meta-row">
                      <span className="pill">{editorialEntryTypeLabels[entry.entry_type]}</span>
                      <span>{editorialEntryStatusLabels[entry.entry_status]}</span>
                      {entry.target_surface ? <span>{editorialEntryTargetLabels[entry.target_surface]}</span> : null}
                    </div>
                    <h4>{entry.title}</h4>
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
                      <Link href={getActionHref(bucket.key, entry)} className="button-secondary">
                        {getActionLabel(bucket.key)}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="internal-priority-board__empty">{bucket.emptyLabel}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
