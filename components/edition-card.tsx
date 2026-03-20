import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getEditionCoverVariant, getEditionStatusLabel, getEditionStatusTone, getEditionTypeLabel } from "@/lib/editions/navigation";
import type { EditorialEdition } from "@/lib/editions/types";

type Props = {
  edition: EditorialEdition;
  href: string;
  itemCount: number;
  compact?: boolean;
};

export function EditionCard({ edition, href, itemCount, compact = false }: Props) {
  return (
    <article className={`card edition-card ${compact ? "edition-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={edition.title}
        primaryTag={getEditionStatusLabel(edition.status)}
        seriesTitle={edition.period_label || getEditionTypeLabel(edition.edition_type)}
        coverImageUrl={edition.cover_image_url}
        coverVariant={getEditionCoverVariant(edition.edition_type)}
        compact={compact}
      />
      <div className="series-card__body">
        <div className="meta-row">
          <span className={getEditionStatusTone(edition.status)}>{getEditionStatusLabel(edition.status)}</span>
          <span>{getEditionTypeLabel(edition.edition_type)}</span>
          {edition.period_label ? <span>{edition.period_label}</span> : null}
        </div>
        <h3>{edition.title}</h3>
        <p>{edition.excerpt || edition.description}</p>
        <p className="series-card__count">
          {itemCount} peça{itemCount === 1 ? "" : "s"} relacionada{itemCount === 1 ? "" : "s"}
        </p>
        <Link href={href} className="button-secondary">
          Abrir edição
        </Link>
      </div>
    </article>
  );
}
