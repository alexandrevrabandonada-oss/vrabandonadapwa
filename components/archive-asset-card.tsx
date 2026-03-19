import Image from "next/image";
import Link from "next/link";

import type { ArchiveAsset } from "@/lib/archive/types";
import {
  getArchiveAssetDisplayUrl,
  getArchiveAssetLinkLabel,
  getArchiveAssetPeriodLabel,
  getArchiveAssetTypeLabel,
  isArchiveVisualAsset,
} from "@/lib/archive/navigation";

type Props = {
  asset: ArchiveAsset;
  href?: string;
  compact?: boolean;
  memoryLabel?: string | null;
  editorialLabel?: string | null;
  collectionLabel?: string | null;
  collectionHref?: string | null;
  actionLabel?: string;
};

export function ArchiveAssetCard({
  asset,
  href,
  compact = false,
  memoryLabel,
  editorialLabel,
  collectionLabel,
  collectionHref,
  actionLabel,
}: Props) {
  const displayUrl = getArchiveAssetDisplayUrl(asset);
  const visual = isArchiveVisualAsset(asset);

  return (
    <article className={`card archive-card ${compact ? "archive-card--compact" : ""}`}>
      <div className={`archive-card__media archive-card__media--${asset.asset_type}`}>
        {visual ? (
          <Image
            src={displayUrl}
            alt={asset.title}
            className="archive-card__image"
            width={960}
            height={720}
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="archive-card__fallback">
            <span>{getArchiveAssetTypeLabel(asset.asset_type)}</span>
            <strong>{asset.title}</strong>
            <p>Fonte documental sem prévia visual.</p>
          </div>
        )}
      </div>

      <div className="archive-card__body">
        <div className="archive-card__meta">
          <span>{getArchiveAssetTypeLabel(asset.asset_type)}</span>
          {asset.public_visibility ? <span>público</span> : <span>interno</span>}
          {asset.featured ? <span>destaque</span> : null}
        </div>
        <h3>{asset.title}</h3>
        <p>{asset.description || asset.source_label || "Anexo de arquivo vivo."}</p>
        <div className="archive-card__labels">
          {collectionLabel ? (
            collectionHref ? (
              <Link href={collectionHref} className="tag-row__item">
                {collectionLabel}
              </Link>
            ) : (
              <span className="tag-row__item">{collectionLabel}</span>
            )
          ) : null}
          {memoryLabel ? <span className="tag-row__item">{memoryLabel}</span> : null}
          {editorialLabel ? <span className="tag-row__item">{editorialLabel}</span> : null}
          {asset.source_date_label ? <span className="tag-row__item">{asset.source_date_label}</span> : null}
        </div>
        <div className="meta-row">
          {asset.place_label ? <span>{asset.place_label}</span> : null}
          {asset.approximate_year ? <span>{asset.approximate_year}</span> : null}
          {!asset.source_date_label ? <span>{getArchiveAssetPeriodLabel(asset)}</span> : null}
          {asset.rights_note ? <span>{asset.rights_note}</span> : null}
        </div>
        {href ? (
          href.startsWith("/") ? (
            <Link href={href} className="button-secondary archive-card__action">
              {actionLabel || getArchiveAssetLinkLabel(asset)}
            </Link>
          ) : (
            <a href={href} className="button-secondary archive-card__action" target="_blank" rel="noreferrer">
              {actionLabel || getArchiveAssetLinkLabel(asset)}
            </a>
          )
        ) : null}
      </div>
    </article>
  );
}
