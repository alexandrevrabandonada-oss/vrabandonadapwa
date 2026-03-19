import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import type { EditorialItem } from "@/lib/editorial/types";

type Props = {
  item: EditorialItem;
};

export function EditorialHero({ item }: Props) {
  return (
    <section className="section editorial-hero">
      <div className="editorial-hero__copy">
        <p className="eyebrow">destaque editorial</p>
        <h1>{item.title}</h1>
        <p className="hero__lead">{item.excerpt}</p>
        <div className="meta-row">
          <span>{item.series_title || item.category}</span>
          <span>{item.primary_tag || item.category}</span>
          <span>{item.reading_time} min</span>
          <span>{item.neighborhood || "Volta Redonda"}</span>
        </div>
        <div className="tag-row">
          {item.secondary_tags.slice(0, 4).map((tag) => (
            <span className="tag-row__item" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
        <div className="stack-actions">
          <Link href={`/pautas/${item.slug}`} className="button">
            Ler destaque
          </Link>
        </div>
      </div>
      <EditorialCover
        title={item.title}
        primaryTag={item.primary_tag ?? item.category}
        seriesTitle={item.series_title}
        coverImageUrl={item.cover_image_url}
        coverVariant={item.cover_variant}
      />
    </section>
  );
}
