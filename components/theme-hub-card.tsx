import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getThemeHubStatusLabel, getThemeHubStatusTone } from "@/lib/hubs/navigation";
import type { ThemeHub } from "@/lib/hubs/types";

type Props = {
  hub: ThemeHub;
  href: string;
  itemCount?: number;
  latestMovement?: string | null;
  compact?: boolean;
};

export function ThemeHubCard({ hub, href, itemCount = 0, latestMovement, compact = false }: Props) {
  return (
    <article className={`card theme-hub-card ${compact ? "theme-hub-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={hub.title}
        primaryTag={getThemeHubStatusLabel(hub.status)}
        seriesTitle={hub.lead_question || hub.excerpt || hub.title}
        coverImageUrl={hub.cover_image_url}
        coverVariant={hub.featured ? "ember" : "concrete"}
      />
      <div className="theme-hub-card__body">
        <div className="meta-row">
          <span className={getThemeHubStatusTone(hub.status)}>{getThemeHubStatusLabel(hub.status)}</span>
          <span>{itemCount} peça{itemCount === 1 ? "" : "s"}</span>
          {hub.featured ? <span>destaque</span> : null}
        </div>
        <h3>{hub.title}</h3>
        <p>{hub.excerpt || hub.description}</p>
        {latestMovement ? (
          <article className="support-box theme-hub-card__movement">
            <p className="eyebrow">última movimentação</p>
            <p>{latestMovement}</p>
          </article>
        ) : null}
        <Link href={href} className="button-secondary">
          Abrir eixo
        </Link>
      </div>
    </article>
  );
}
