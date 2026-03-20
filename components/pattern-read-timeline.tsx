import Link from "next/link";

import { getPatternReadLinkRoleLabel, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import type { PatternReadTimelineEntry } from "@/lib/patterns/types";

type Props = {
  entry: PatternReadTimelineEntry;
  compact?: boolean;
};

export function PatternReadTimeline({ entry, compact = false }: Props) {
  return (
    <article className={`card place-hub-link-card ${compact ? "place-hub-link-card--compact" : ""}`.trim()}>
      <div className="meta-row">
        <span>{entry.yearLabel}</span>
        <span>{getPatternReadLinkRoleLabel(entry.link_role)}</span>
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.excerpt || entry.timeline_note || "Sem nota disponível."}</p>
      <div className="meta-row">
        <span>{getPatternReadTypeLabel(entry.link_type)}</span>
        {entry.timeline_label ? <span>{entry.timeline_label}</span> : null}
      </div>
      {entry.timeline_note ? <p>{entry.timeline_note}</p> : null}
      <Link href={entry.href} className="button-secondary">
        Abrir
      </Link>
    </article>
  );
}


