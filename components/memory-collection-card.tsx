import Link from "next/link";

import type { MemoryCollection } from "@/lib/memory/types";

type Props = {
  collection: MemoryCollection;
  count: number;
};

export function MemoryCollectionCard({ collection, count }: Props) {
  return (
    <article className="card memory-collection-card">
      <span className="pill">Recorte</span>
      <h3>{collection.title}</h3>
      <p>{collection.description}</p>
      <p className="series-card__count">
        {count} item{count === 1 ? "" : "s"}
      </p>
      <Link href={`/memoria?collection=${collection.slug}`} className="button-secondary">
        Ver recorte
      </Link>
    </article>
  );
}
