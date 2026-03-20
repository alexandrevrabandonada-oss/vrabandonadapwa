import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getPatternReadStatusLabel, getPatternReadStatusTone, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import type { PatternRead } from "@/lib/patterns/types";

type Props = {
  patternRead: PatternRead;
  href: string;
  itemCount?: number;
  latestMovement?: string | null;
  compact?: boolean;
};

export function PatternReadCard({ patternRead, href, itemCount = 0, latestMovement, compact = false }: Props) {
  return (
    <article className={`card theme-hub-card ${compact ? "theme-hub-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={patternRead.title}
        primaryTag={getPatternReadStatusLabel(patternRead.status)}
        seriesTitle={patternRead.lead_question || patternRead.excerpt || patternRead.title}
        coverImageUrl={patternRead.cover_image_url}
        coverVariant={patternRead.featured ? "ember" : "concrete"}
      />
      <div className="theme-hub-card__body">
        <div className="meta-row">
          <span className={getPatternReadStatusTone(patternRead.status)}>{getPatternReadStatusLabel(patternRead.status)}</span>
          <span>{getPatternReadTypeLabel(patternRead.pattern_type)}</span>
          <span>{itemCount} peça{itemCount === 1 ? "" : "s"}</span>
          {patternRead.featured ? <span>destaque</span> : null}
        </div>
        <h3>{patternRead.title}</h3>
        <p>{patternRead.excerpt || patternRead.description}</p>
        {latestMovement ? (
          <article className="support-box theme-hub-card__movement">
            <p className="eyebrow">última leitura</p>
            <p>{latestMovement}</p>
          </article>
        ) : null}
        <Link href={href} className="button-secondary">
          Abrir padrão
        </Link>
      </div>
    </article>
  );
}
