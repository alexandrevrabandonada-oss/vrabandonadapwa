import Link from "next/link";

import type { MemoryTimelineEntry } from "@/lib/memory/types";

type Props = {
  entry: MemoryTimelineEntry;
};

export function MemoryTimelineEntryCard({ entry }: Props) {
  return (
    <article className="timeline-item">
      <div className="timeline-item__marker" aria-hidden="true" />
      <div className="timeline-item__body">
        <div className="meta-row">
          <span>{entry.year}</span>
          <span>{entry.label}</span>
        </div>
        <p>{entry.detail}</p>
        {entry.slug ? (
          <Link href={`/memoria/${entry.slug}`} className="button-secondary">
            Abrir recorte
          </Link>
        ) : null}
      </div>
    </article>
  );
}
