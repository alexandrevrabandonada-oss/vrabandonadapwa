import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getDossierStatusLabel, getDossierStatusTone } from "@/lib/dossiers/navigation";
import { getDossierUpdatePreviewText, getDossierUpdateTypeLabel, getDossierUpdateYearLabel } from "@/lib/dossiers/updates";
import type { InvestigationDossier, InvestigationDossierUpdate } from "@/lib/dossiers/types";

type Props = {
  dossier: InvestigationDossier;
  href: string;
  itemCount: number;
  latestUpdate?: InvestigationDossierUpdate | null;
};

export function DossierCard({ dossier, href, itemCount, latestUpdate }: Props) {
  return (
    <article className="card dossier-card">
      <EditorialCover
        title={dossier.title}
        primaryTag={getDossierStatusLabel(dossier.status)}
        seriesTitle={dossier.lead_question || dossier.period_label || dossier.title}
        coverImageUrl={dossier.cover_image_url}
        coverVariant={dossier.featured ? "ember" : "concrete"}
      />
      <div className="dossier-card__body">
        <div className="meta-row">
          <span className={getDossierStatusTone(dossier.status)}>{getDossierStatusLabel(dossier.status)}</span>
          {dossier.period_label ? <span>{dossier.period_label}</span> : null}
          {dossier.territory_label ? <span>{dossier.territory_label}</span> : null}
        </div>
        <h3>{dossier.title}</h3>
        <p>{dossier.excerpt || dossier.description}</p>
        <div className="dossier-card__metrics">
          <span>{itemCount} peça{itemCount === 1 ? "" : "s"} conectada{itemCount === 1 ? "" : "s"}</span>
          <span>{dossier.featured ? "destaque" : "linha aberta"}</span>
        </div>
        {latestUpdate ? (
          <article className="support-box dossier-card__update">
            <p className="eyebrow">Última atualização</p>
            <h4>{latestUpdate.title}</h4>
            <p>{getDossierUpdatePreviewText(latestUpdate)}</p>
            <div className="meta-row">
              <span>{getDossierUpdateYearLabel(latestUpdate)}</span>
              <span>{getDossierUpdateTypeLabel(latestUpdate.update_type)}</span>
            </div>
          </article>
        ) : null}
        <Link href={href} className="button-secondary">
          Abrir dossiê
        </Link>
      </div>
    </article>
  );
}
