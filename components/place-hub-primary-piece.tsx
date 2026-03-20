import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getPlaceHubLinkRoleLabel, getPlaceHubLinkTypeLabel } from "@/lib/territories/navigation";
import type { PlaceHub, PlaceHubResolvedLink } from "@/lib/territories/types";

type Props = {
  placeHub: PlaceHub;
  leadLink?: PlaceHubResolvedLink | null;
};

export function PlaceHubPrimaryPiece({ placeHub, leadLink }: Props) {
  if (!leadLink) {
    return (
      <article className="support-box theme-hub-primary-piece">
        <p className="eyebrow">por onde começar</p>
        <h3>{placeHub.lead_question || placeHub.title}</h3>
        <p>{placeHub.excerpt || placeHub.description || "Lugar sem peça central definida ainda."}</p>
      </article>
    );
  }

  return (
    <article className="support-box theme-hub-primary-piece">
      <p className="eyebrow">peça central</p>
      <EditorialCover
        title={leadLink.title}
        primaryTag={getPlaceHubLinkRoleLabel(leadLink.link_role)}
        seriesTitle={getPlaceHubLinkTypeLabel(leadLink.link_type)}
        coverImageUrl={null}
        coverVariant="ember"
      />
      <div className="theme-hub-primary-piece__body">
        <div className="meta-row">
          <span>{getPlaceHubLinkRoleLabel(leadLink.link_role)}</span>
          <span>{getPlaceHubLinkTypeLabel(leadLink.link_type)}</span>
          {leadLink.timeline_label || leadLink.timeline_year ? <span>{leadLink.timeline_label || String(leadLink.timeline_year)}</span> : null}
        </div>
        <h3>{leadLink.title}</h3>
        <p>{leadLink.excerpt || placeHub.lead_question || placeHub.description}</p>
        {leadLink.timeline_note ? <p>{leadLink.timeline_note}</p> : null}
        <Link href={leadLink.href} className="button-secondary">
          Abrir peça central
        </Link>
      </div>
    </article>
  );
}
