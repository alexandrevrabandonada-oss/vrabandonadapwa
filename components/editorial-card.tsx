import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import type { EditorialItem } from "@/lib/editorial/types";

type Props = {
  item: EditorialItem;
  href: string;
  compact?: boolean;
  ctaLabel?: string;
};

export function EditorialCard({ item, href, compact = false, ctaLabel = "Ler pauta" }: Props) {
  return (
    <article className={`entry editorial-card ${compact ? "editorial-card--compact" : ""}`}>
      <EditorialCover
        title={item.title}
        primaryTag={item.primary_tag ?? item.category}
        seriesTitle={item.series_title}
        coverImageUrl={item.cover_image_url}
        coverVariant={item.cover_variant}
        compact={compact}
      />
      <div className="editorial-card__body">
        <div className="editorial-card__kicker">
          <span>{item.series_title || "Linha editorial"}</span>
          <span>{item.reading_time} min</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        <div className="meta-row">
          <span>{item.primary_tag || item.category}</span>
          <span>{item.neighborhood || "Volta Redonda"}</span>
        </div>
        <div className="tag-row">
          {item.secondary_tags.slice(0, 3).map((tag) => (
            <span className="tag-row__item" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
        <Link href={href} className="button-secondary">
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
