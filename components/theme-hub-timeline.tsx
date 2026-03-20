import Link from "next/link";

import type { ThemeHubTimelineEntry } from "@/lib/hubs/types";

type Props = {
  entries: ThemeHubTimelineEntry[];
};

export function ThemeHubTimeline({ entries }: Props) {
  return (
    <div className="theme-hub-timeline">
      {entries.length ? (
        entries.map((entry) => (
          <article className="theme-hub-timeline__entry" key={entry.id}>
            <div className="theme-hub-timeline__rail" />
            <div className="theme-hub-timeline__content">
              <div className="meta-row">
                <span>{entry.yearLabel}</span>
                <span>{entry.roleLabel}</span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.excerpt || entry.timeline_note || "Marco do eixo temático."}</p>
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
