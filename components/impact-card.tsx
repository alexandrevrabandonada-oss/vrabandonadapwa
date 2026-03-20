import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getImpactStatusLabel, getImpactStatusTone, getImpactTypeLabel } from "@/lib/impact/navigation";
import type { PublicImpact } from "@/lib/impact/types";

type Props = {
  impact: PublicImpact;
  href: string;
  itemCount?: number;
  compact?: boolean;
};

export function ImpactCard({ impact, href, itemCount = 0, compact = false }: Props) {
  return (
    <article className={`card impact-card ${compact ? "impact-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={impact.title}
        primaryTag={getImpactStatusLabel(impact.status)}
        seriesTitle={impact.lead_question || impact.excerpt || impact.title}
        coverImageUrl={impact.cover_image_url}
        coverVariant={impact.featured ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="impact-card__body">
        <div className="meta-row">
          <span className={getImpactStatusTone(impact.status)}>{getImpactStatusLabel(impact.status)}</span>
          <span>{getImpactTypeLabel(impact.impact_type)}</span>
          <span>{itemCount} vínculo{itemCount === 1 ? "" : "s"}</span>
        </div>
        <h3>{impact.title}</h3>
        <p>{impact.excerpt || impact.description}</p>
        <Link href={href} className="button-secondary">
          Abrir impacto
        </Link>
      </div>
    </article>
  );
}
