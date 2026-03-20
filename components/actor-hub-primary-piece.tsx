import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getActorHubLinkRoleLabel, getActorHubLinkTypeLabel } from "@/lib/actors/navigation";
import type { ActorHub, ActorHubResolvedLink } from "@/lib/actors/types";

type Props = {
  actorHub: ActorHub;
  leadLink?: ActorHubResolvedLink | null;
};

export function ActorHubPrimaryPiece({ actorHub, leadLink }: Props) {
  if (!leadLink) {
    return (
      <article className="support-box theme-hub-primary-piece">
        <p className="eyebrow">por onde começar</p>
        <h3>{actorHub.lead_question || actorHub.title}</h3>
        <p>{actorHub.excerpt || actorHub.description || "Ator sem peça central definida ainda."}</p>
      </article>
    );
  }

  return (
    <article className="support-box theme-hub-primary-piece">
      <p className="eyebrow">peça central</p>
      <EditorialCover
        title={leadLink.title}
        primaryTag={getActorHubLinkRoleLabel(leadLink.link_role)}
        seriesTitle={getActorHubLinkTypeLabel(leadLink.link_type)}
        coverImageUrl={null}
        coverVariant="ember"
      />
      <div className="theme-hub-primary-piece__body">
        <div className="meta-row">
          <span>{getActorHubLinkRoleLabel(leadLink.link_role)}</span>
          <span>{getActorHubLinkTypeLabel(leadLink.link_type)}</span>
          {leadLink.timeline_label || leadLink.timeline_year ? <span>{leadLink.timeline_label || String(leadLink.timeline_year)}</span> : null}
        </div>
        <h3>{leadLink.title}</h3>
        <p>{leadLink.excerpt || actorHub.lead_question || actorHub.description}</p>
        {leadLink.timeline_note ? <p>{leadLink.timeline_note}</p> : null}
        <Link href={leadLink.href} className="button-secondary">
          Abrir peça central
        </Link>
      </div>
    </article>
  );
}
