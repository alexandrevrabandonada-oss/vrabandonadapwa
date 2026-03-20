import Link from "next/link";

import { getPatternReadLinkRoleLabel, getPatternReadLinkTypeLabel } from "@/lib/patterns/navigation";
import type { PatternReadResolvedLink } from "@/lib/patterns/types";
import { removePatternReadLinkAction } from "@/app/interno/padroes/actions";

type Props = {
  link: PatternReadResolvedLink;
  compact?: boolean;
  removable?: boolean;
  patternReadId?: string;
};

export function PatternReadLinkCard({ link, compact = false, removable = false, patternReadId }: Props) {
  return (
    <article className={`card place-hub-link-card ${compact ? "place-hub-link-card--compact" : ""}`.trim()}>
      <div className="meta-row">
        <span>{getPatternReadLinkRoleLabel(link.link_role)}</span>
        <span>{getPatternReadLinkTypeLabel(link.link_type)}</span>
        {link.timeline_label ? <span>{link.timeline_label}</span> : null}
      </div>
      <h3>{link.title}</h3>
      <p>{link.excerpt || link.timeline_note || "Sem resumo."}</p>
      {link.timeline_note ? <p>{link.timeline_note}</p> : null}
      <div className="stack-actions">
        <Link href={link.href} className="button-secondary">
          Abrir
        </Link>
        {removable && patternReadId ? (
          <form action={removePatternReadLinkAction}>
            <input type="hidden" name="pattern_read_id" value={patternReadId} />
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
