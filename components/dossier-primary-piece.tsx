import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getDossierLinkRoleLabel, getDossierLinkTypeLabel } from "@/lib/dossiers/navigation";
import type { DossierResolvedLink, InvestigationDossier } from "@/lib/dossiers/types";

type Props = {
  dossier: InvestigationDossier;
  leadLink?: DossierResolvedLink | null;
};

export function DossierPrimaryPiece({ dossier, leadLink }: Props) {
  if (!leadLink) {
    return (
      <article className="support-box dossier-primary-piece">
        <p className="eyebrow">por onde começar</p>
        <h3>{dossier.lead_question || dossier.title}</h3>
        <p>{dossier.excerpt || dossier.description || "Dossiê sem peça central definida ainda."}</p>
      </article>
    );
  }

  return (
    <article className="support-box dossier-primary-piece">
      <p className="eyebrow">peça central</p>
      <EditorialCover
        title={leadLink.title}
        primaryTag={getDossierLinkRoleLabel(leadLink.link_role)}
        seriesTitle={getDossierLinkTypeLabel(leadLink.link_type)}
        coverImageUrl={null}
        coverVariant="ember"
      />
      <div className="dossier-primary-piece__body">
        <div className="meta-row">
          <span>{getDossierLinkRoleLabel(leadLink.link_role)}</span>
          <span>{getDossierLinkTypeLabel(leadLink.link_type)}</span>
          {leadLink.timeline_label || leadLink.timeline_year ? <span>{leadLink.timeline_label || String(leadLink.timeline_year)}</span> : null}
        </div>
        <h3>{leadLink.title}</h3>
        <p>{leadLink.excerpt || dossier.lead_question || dossier.description}</p>
        {leadLink.timeline_note ? <p>{leadLink.timeline_note}</p> : null}
        <Link href={leadLink.href} className="button-secondary">
          Abrir peça central
        </Link>
      </div>
    </article>
  );
}

