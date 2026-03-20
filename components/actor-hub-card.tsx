import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getActorHubActorTypeLabel, getActorHubStatusLabel, getActorHubStatusTone } from "@/lib/actors/navigation";
import type { ActorHub } from "@/lib/actors/types";

type Props = {
  actorHub: ActorHub;
  href: string;
  itemCount?: number;
  latestMovement?: string | null;
  compact?: boolean;
};

export function ActorHubCard({ actorHub, href, itemCount = 0, latestMovement, compact = false }: Props) {
  return (
    <article className={`card theme-hub-card ${compact ? "theme-hub-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={actorHub.title}
        primaryTag={getActorHubStatusLabel(actorHub.status)}
        seriesTitle={actorHub.lead_question || actorHub.excerpt || actorHub.title}
        coverImageUrl={actorHub.cover_image_url}
        coverVariant={actorHub.featured ? "ember" : "concrete"}
      />
      <div className="theme-hub-card__body">
        <div className="meta-row">
          <span className={getActorHubStatusTone(actorHub.status)}>{getActorHubStatusLabel(actorHub.status)}</span>
          <span>{getActorHubActorTypeLabel(actorHub.actor_type)}</span>
          <span>{itemCount} peça{itemCount === 1 ? "" : "s"}</span>
        </div>
        <h3>{actorHub.title}</h3>
        <p>{actorHub.excerpt || actorHub.description}</p>
        {latestMovement ? (
          <article className="support-box theme-hub-card__movement">
            <p className="eyebrow">última movimentação</p>
            <p>{latestMovement}</p>
          </article>
        ) : null}
        <Link href={href} className="button-secondary">
          Abrir ator
        </Link>
      </div>
    </article>
  );
}
