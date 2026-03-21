"use client";

import Link from "next/link";

import { FollowButton } from "@/components/follow-button";
import { SaveReadButton } from "@/components/save-read-button";
import type { TimelineEntry } from "@/lib/timeline/types";
import { getTimelineDateBasisLabel, getTimelineDateBasisTone } from "@/lib/timeline/navigation";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text: string, query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const tokens = Array.from(new Set(trimmedQuery.split(/\s+/).map((token) => token.trim()).filter(Boolean)));
  if (!tokens.length) return text;

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
  const pieces = text.split(pattern);

  if (pieces.length === 1) return text;

  return pieces.map((piece, index) => {
    const isMatch = tokens.some((token) => normalize(piece) === normalize(token));
    if (isMatch) {
      return <mark key={`${piece}-${index}`}>{piece}</mark>;
    }

    return <span key={`${piece}-${index}`}>{piece}</span>;
  });
}

type Props = {
  entry: TimelineEntry;
  query?: string;
  compact?: boolean;
};

export function TimelineEntryCard({ entry, query = "", compact = false }: Props) {
  const labels = entry.labels.slice(0, 3);

  return (
    <article className={`card timeline-entry-card${compact ? " timeline-entry-card--compact" : ""}`}>
      <div className="timeline-entry-card__meta meta-row">
        <span className="pill">{entry.kindLabel}</span>
        <span>{entry.periodLabel}</span>
        {entry.dateLabel ? <span>{entry.dateLabel}</span> : null}
      </div>

      <div className="timeline-entry-card__body">
        <h3>{renderHighlightedText(entry.title, query)}</h3>
        <p className="timeline-entry-card__excerpt">{renderHighlightedText(entry.excerpt || entry.title, query)}</p>
        <div className="timeline-entry-card__signals meta-row">
          {entry.territoryLabel ? <span>{entry.territoryLabel}</span> : null}
          {entry.actorLabel ? <span>{entry.actorLabel}</span> : null}
          <span className={getTimelineDateBasisTone(entry.dateBasis)}>{getTimelineDateBasisLabel(entry.dateBasis)}</span>
        </div>
        {labels.length ? (
          <div className="tag-row">
            {labels.map((label) => (
              <span key={label} className="tag-row__item">
                {label}
              </span>
            ))}
          </div>
        ) : null}
        {entry.sourceNote ? <p className="timeline-entry-card__note">{entry.sourceNote}</p> : null}
      </div>

      <div className="timeline-entry-card__actions stack-actions">
        <Link href={entry.timelineHref} className="button">
          Ver no tempo
        </Link>
        <Link href={entry.contentHref} className="button-secondary">
          Abrir conteúdo
        </Link>
        {entry.saveKind ? (
          <SaveReadButton kind={entry.saveKind} keyValue={entry.contentKey} title={entry.title} summary={entry.excerpt || entry.title} href={entry.contentHref} compact />
        ) : null}
        {entry.followKind ? (
          <FollowButton kind={entry.followKind} keyValue={entry.contentKey} title={entry.title} summary={entry.excerpt || entry.title} href={entry.contentHref} compact />
        ) : null}
      </div>
    </article>
  );
}
