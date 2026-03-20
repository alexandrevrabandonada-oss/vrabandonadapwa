import Link from "next/link";

import type { DossierTimelineEntry } from "@/lib/dossiers/types";

type Props = {
  entries: DossierTimelineEntry[];
};

export function DossierTimeline({ entries }: Props) {
  return (
    <div className="dossier-timeline">
      {entries.length ? (
        entries.map((entry) => (
          <article className="dossier-timeline__entry" key={entry.id}>
            <div className="dossier-timeline__rail" />
            <div className="dossier-timeline__content">
              <div className="meta-row">
                <span>{entry.yearLabel}</span>
                <span>{entry.roleLabel}</span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.excerpt || entry.timeline_note || "Marco da investigação pública."}</p>
              {entry.href ? (
                <Link href={entry.href} className="button-secondary">
                  Abrir peça
                </Link>
              ) : null}
            </div>
          </article>
        ))
      ) : (
        <article className="support-box">
          <p>Sem timeline publicada ainda.</p>
        </article>
      )}
    </div>
  );
}
