import Link from "next/link";

import { FollowButton } from "@/components/follow-button";
import { SaveReadButton } from "@/components/save-read-button";
import { getTimelineEntryHref } from "@/lib/timeline/navigation";
import type { SearchIndexEntry } from "@/lib/search/types";

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
  if (!trimmedQuery) {
    return text;
  }

  const tokens = Array.from(new Set(trimmedQuery.split(/\s+/).map((token) => token.trim()).filter(Boolean)));
  if (!tokens.length) {
    return text;
  }

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
  const pieces = text.split(pattern);

  if (pieces.length === 1) {
    return text;
  }

  return pieces.map((piece, index) => {
    const isMatch = tokens.some((token) => normalize(piece) === normalize(token));

    if (isMatch) {
      return <mark key={`${piece}-${index}`}>{piece}</mark>;
    }

    return <span key={`${piece}-${index}`}>{piece}</span>;
  });
}

type Props = {
  item: SearchIndexEntry;
  query: string;
};

export function SearchResultCard({ item, query }: Props) {
  const labels = item.labels.slice(0, 3);
  const timelineHref = getTimelineEntryHref(item.contentType, item.contentKey);

  return (
    <article className="card search-result-card">
      <div className="search-result-card__meta meta-row">
        <span className="pill">{item.kindLabel}</span>
        {item.territoryLabel ? <span>{item.territoryLabel}</span> : null}
        {item.actorLabel ? <span>{item.actorLabel}</span> : null}
      </div>

      <div className="search-result-card__body">
        <h3>{renderHighlightedText(item.title, query)}</h3>
        <p className="search-result-card__snippet">{renderHighlightedText(item.excerpt, query)}</p>
        {labels.length ? (
          <div className="tag-row">
            {labels.map((label) => (
              <span className="tag-row__item" key={label}>
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="search-result-card__actions stack-actions">
        <Link href={item.href} className="button" aria-label={`Abrir ${item.kindLabel}: ${item.title}`}>
          Abrir
        </Link>
        <Link href={timelineHref} className="button-secondary" aria-label={`Ver linha do tempo de ${item.title}`}>
          Linha do tempo
        </Link>
        {item.saveKind ? (
          <SaveReadButton kind={item.saveKind} keyValue={item.contentKey} title={item.title} summary={item.excerpt} href={item.href} compact />
        ) : null}
        {item.followKind ? (
          <FollowButton kind={item.followKind} keyValue={item.contentKey} title={item.title} summary={item.excerpt} href={item.href} compact />
        ) : null}
      </div>
    </article>
  );
}
