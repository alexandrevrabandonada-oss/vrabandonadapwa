import Link from "next/link";

import { getDossierUpdateNarrativeLabel, getDossierUpdatePreviewText, getDossierUpdateTone, getDossierUpdateTypeLabel, getDossierUpdateYearLabel } from "@/lib/dossiers/updates";
import type { InvestigationDossierUpdate } from "@/lib/dossiers/types";

type Props = {
  update: InvestigationDossierUpdate;
  href?: string;
  actionLabel?: string;
  compact?: boolean;
};

export function DossierUpdateCard({ update, href, actionLabel = "Abrir update", compact = false }: Props) {
  return (
    <article className={`card dossier-update-card ${compact ? "dossier-update-card--compact" : ""}`.trim()}>
      <p className={`pill ${getDossierUpdateTone(update.update_type)}`}>{getDossierUpdateNarrativeLabel(update.update_type)}</p>
      <div className="meta-row">
        <span>{getDossierUpdateYearLabel(update)}</span>
        <span>{getDossierUpdateTypeLabel(update.update_type)}</span>
        {update.featured ? <span>Destaque</span> : null}
      </div>
      <h3>{update.title}</h3>
      <p>{getDossierUpdatePreviewText(update)}</p>
      {!compact ? <p>{update.body}</p> : null}
      {href ? (
        <Link href={href} className="button-secondary">
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
