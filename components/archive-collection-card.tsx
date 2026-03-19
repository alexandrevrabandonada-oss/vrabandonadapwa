import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import type { ArchiveCollection } from "@/lib/archive/types";

type Props = {
  collection: ArchiveCollection;
  href: string;
  assetCount?: number;
  compact?: boolean;
};

export function ArchiveCollectionCard({ collection, href, assetCount, compact = false }: Props) {
  return (
    <article className={`card archive-collection-card ${compact ? "archive-collection-card--compact" : ""}`}>
      <EditorialCover
        title={collection.title}
        primaryTag="coleção"
        seriesTitle={collection.title}
        coverImageUrl={collection.cover_image_url}
        coverVariant={collection.featured ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="archive-collection-card__body">
        <div className="editorial-card__kicker">
          <span>{collection.featured ? "destaque" : "coleção"}</span>
          {typeof assetCount === "number" ? <span>{assetCount} materiais</span> : null}
        </div>
        <h3>{collection.title}</h3>
        <p>{collection.excerpt || collection.description || "Recorte editorial do arquivo vivo."}</p>
        <Link href={href} className="button-secondary">
          Abrir coleção
        </Link>
      </div>
    </article>
  );
}
