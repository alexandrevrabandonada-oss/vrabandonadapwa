import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import type { MemoryItem } from "@/lib/memory/types";

type Props = {
  item: MemoryItem;
  href: string;
  compact?: boolean;
};

export function MemoryCard({ item, href, compact = false }: Props) {
  return (
    <article className={`entry memory-card ${compact ? "memory-card--compact" : ""}`}>
      <EditorialCover
        title={item.title}
        primaryTag={item.memory_type}
        seriesTitle={item.collection_title || item.memory_collection}
        coverImageUrl={item.cover_image_url}
        coverVariant={item.highlight_in_memory ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="memory-card__body">
        <div className="editorial-card__kicker">
          <span>{item.period_label}</span>
          <span>{item.place_label || "Volta Redonda"}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        <div className="meta-row">
          <span>{item.collection_title || item.memory_collection}</span>
          <span>{item.year_start ? String(item.year_start) : "data aberta"}</span>
        </div>
        <Link href={href} className="button-secondary">
          Ler memória
        </Link>
      </div>
    </article>
  );
}

