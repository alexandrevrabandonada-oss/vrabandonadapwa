import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel, getPlaceHubStatusTone } from "@/lib/territories/navigation";
import type { PlaceHub } from "@/lib/territories/types";

type Props = {
  placeHub: PlaceHub;
  href: string;
  itemCount?: number;
  latestMovement?: string | null;
  compact?: boolean;
};

export function PlaceHubCard({ placeHub, href, itemCount = 0, latestMovement, compact = false }: Props) {
  return (
    <article className={`card theme-hub-card ${compact ? "theme-hub-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={placeHub.title}
        primaryTag={getPlaceHubStatusLabel(placeHub.status)}
        seriesTitle={placeHub.lead_question || placeHub.excerpt || placeHub.title}
        coverImageUrl={placeHub.cover_image_url}
        coverVariant={placeHub.featured ? "ember" : "concrete"}
      />
      <div className="theme-hub-card__body">
        <div className="meta-row">
          <span className={getPlaceHubStatusTone(placeHub.status)}>{getPlaceHubStatusLabel(placeHub.status)}</span>
          <span>{getPlaceHubPlaceTypeLabel(placeHub.place_type)}</span>
          <span>{itemCount} peça{itemCount === 1 ? "" : "s"}</span>
        </div>
        <h3>{placeHub.title}</h3>
        <p>{placeHub.excerpt || placeHub.description}</p>
        {latestMovement ? (
          <article className="support-box theme-hub-card__movement">
            <p className="eyebrow">última movimentação</p>
            <p>{latestMovement}</p>
          </article>
        ) : null}
        <Link href={href} className="button-secondary">
          Abrir lugar
        </Link>
      </div>
    </article>
  );
}
