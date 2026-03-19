import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import type { InvestigationDossier } from "@/lib/dossiers/types";

type Props = {
  dossier: InvestigationDossier;
  href: string;
  itemCount?: number;
  compact?: boolean;
};

export function DossierCard({ dossier, href, itemCount, compact = false }: Props) {
  return (
    <article className={`card dossier-card ${compact ? "dossier-card--compact" : ""}`}>
      <EditorialCover
        title={dossier.title}
        primaryTag="dossiê"
        seriesTitle={dossier.title}
        coverImageUrl={dossier.cover_image_url}
        coverVariant={dossier.featured ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="dossier-card__body">
        <div className="editorial-card__kicker">
          <span>{dossier.period_label || "linha investigativa"}</span>
          {dossier.territory_label ? <span>{dossier.territory_label}</span> : null}
          {typeof itemCount === "number" ? <span>{itemCount} peças</span> : null}
        </div>
        <h3>{dossier.title}</h3>
        <p>{dossier.excerpt || dossier.description || "Linha de investigação pública."}</p>
        <Link href={href} className="button-secondary">
          Abrir dossiê
        </Link>
      </div>
    </article>
  );
}
