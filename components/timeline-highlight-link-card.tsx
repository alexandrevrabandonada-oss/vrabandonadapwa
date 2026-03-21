import Link from "next/link";

import { removeTimelineHighlightLinkAction } from "@/app/interno/cronologia/marcos/actions";
import { getTimelineHighlightLinkRoleLabel, getTimelineHighlightLinkTypeLabel } from "@/lib/timeline/highlights";
import type { TimelineHighlightResolvedLink } from "@/lib/timeline/highlights";

type Props = {
  link: TimelineHighlightResolvedLink;
  compact?: boolean;
  removable?: boolean;
  highlightId?: string;
};

export function TimelineHighlightLinkCard({ link, compact = false, removable = false, highlightId }: Props) {
  return (
    <article className={`card place-hub-link-card ${compact ? "place-hub-link-card--compact" : ""}`.trim()}>
      <div className="meta-row">
        <span>{getTimelineHighlightLinkRoleLabel(link.link_role)}</span>
        <span>{getTimelineHighlightLinkTypeLabel(link.link_type)}</span>
        {link.timeline_label ? <span>{link.timeline_label}</span> : null}
      </div>
      <h3>{link.title}</h3>
      <p>{link.excerpt || link.timeline_note || "Sem resumo."}</p>
      {link.timeline_note ? <p>{link.timeline_note}</p> : null}
      <div className="stack-actions">
        <Link href={link.href} className="button-secondary">
          Abrir
        </Link>
        {removable && highlightId ? (
          <form action={removeTimelineHighlightLinkAction}>
            <input type="hidden" name="timeline_highlight_id" value={highlightId} />
            <input type="hidden" name="link_id" value={link.id} />
            <button className="button-secondary" type="submit">
              Remover
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
