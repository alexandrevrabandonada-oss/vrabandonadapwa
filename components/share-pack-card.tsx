import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getSharePackStatusLabel, getSharePackStatusTone } from "@/lib/share-packs/navigation";
import type { SharePackResolved } from "@/lib/share-packs/types";

type Props = {
  pack: SharePackResolved;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  compact?: boolean;
};

export function SharePackCard({ pack, primaryHref, primaryLabel, secondaryHref, secondaryLabel, compact = false }: Props) {
  return (
    <article className={`card share-pack-card ${compact ? "share-pack-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={pack.title}
        primaryTag={pack.typeLabel}
        seriesTitle={pack.summary}
        coverVariant={pack.coverVariantResolved}
        compact={compact}
      />
      <div className="share-pack-card__body">
        <div className="meta-row">
          <span className={getSharePackStatusTone(pack.share_status)}>{getSharePackStatusLabel(pack.share_status)}</span>
          <span>{pack.typeLabel}</span>
          <span>{pack.summary ? "Resumo pronto" : "Resumo a definir"}</span>
        </div>
        <h3>{pack.title}</h3>
        <p>{pack.caption}</p>
        <div className="stack-actions">
          <Link href={primaryHref} className="button-secondary">
            {primaryLabel}
          </Link>
          {secondaryHref ? (
            <Link href={secondaryHref} className="button-secondary">
              {secondaryLabel || "Abrir conteúdo"}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
