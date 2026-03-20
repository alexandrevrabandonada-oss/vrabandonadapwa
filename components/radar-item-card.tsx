import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getRadarSectionLabel, getRadarSectionTone } from "@/lib/radar/navigation";
import type { RadarItem } from "@/lib/radar/types";

type Props = {
  item: RadarItem;
  compact?: boolean;
};

export function RadarItemCard({ item, compact = false }: Props) {
  return (
    <article className={`card radar-item-card ${compact ? "radar-item-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={item.title}
        primaryTag={getRadarSectionLabel(item.section)}
        seriesTitle={item.primaryLabel}
        coverImageUrl={item.coverImageUrl}
        coverVariant={item.coverVariant}
        compact={compact}
      />
      <div className="radar-item-card__body">
        <div className="meta-row">
          <span className={getRadarSectionTone(item.section)}>{getRadarSectionLabel(item.section)}</span>
          <span>{item.primaryLabel}</span>
          {item.secondaryLabel ? <span>{item.secondaryLabel}</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.excerpt || "Sem resumo disponível."}</p>
        <div className="meta-row">
          {item.dateLabel ? <span>{item.dateLabel}</span> : null}
          {item.featured ? <span>destaque</span> : null}
        </div>
        <Link href={item.href} className="button-secondary">
          {item.actionLabel}
        </Link>
      </div>
    </article>
  );
}
