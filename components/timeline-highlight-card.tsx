import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getTimelineHighlightStatusLabel, getTimelineHighlightStatusSortOrder, getTimelineHighlightTypeLabel } from "@/lib/timeline/highlights";
import type { TimelineHighlight } from "@/lib/timeline/highlights";
import { getTimelineHighlightHeroVariant } from "@/lib/timeline/highlight-resolve";

type Props = {
  highlight: TimelineHighlight;
  href: string;
  itemCount?: number;
  latestMovement?: string | null;
  compact?: boolean;
};

export function TimelineHighlightCard({ highlight, href, itemCount = 0, latestMovement, compact = false }: Props) {
  return (
    <article className={`card theme-hub-card ${compact ? "theme-hub-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={highlight.title}
        primaryTag={getTimelineHighlightStatusLabel(highlight.status)}
        seriesTitle={highlight.lead_question || highlight.excerpt || highlight.title}
        coverImageUrl={highlight.cover_image_url}
        coverVariant={getTimelineHighlightHeroVariant(String(highlight.highlight_type))}
      />
      <div className="theme-hub-card__body">
        <div className="meta-row">
          <span className={getTimelineHighlightStatusSortOrder(highlight.status) <= 1 ? "pill pill--accent" : "pill"}>{getTimelineHighlightStatusLabel(highlight.status)}</span>
          <span>{getTimelineHighlightTypeLabel(String(highlight.highlight_type))}</span>
          <span>{highlight.period_label || highlight.date_label || "Marco central"}</span>
          {itemCount ? <span>{itemCount} peça{itemCount === 1 ? "" : "s"}</span> : null}
          {highlight.featured ? <span>destaque</span> : null}
        </div>
        <h3>{highlight.title}</h3>
        <p>{highlight.excerpt || highlight.description}</p>
        {latestMovement ? (
          <article className="support-box theme-hub-card__movement">
            <p className="eyebrow">última leitura</p>
            <p>{latestMovement}</p>
          </article>
        ) : null}
        <Link href={href} className="button-secondary">
          Abrir marco
        </Link>
      </div>
    </article>
  );
}
