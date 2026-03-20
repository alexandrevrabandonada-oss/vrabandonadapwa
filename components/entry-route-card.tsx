import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getEntryRouteStatusLabel, getEntryRouteStatusTone } from "@/lib/entry-routes/navigation";
import type { EntryRoute } from "@/lib/entry-routes/types";

type Props = {
  route: EntryRoute;
  href: string;
  itemCount?: number;
  compact?: boolean;
};

export function EntryRouteCard({ route, href, itemCount = 0, compact = false }: Props) {
  return (
    <article className={`card entry-route-card ${compact ? "entry-route-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={route.title}
        primaryTag={getEntryRouteStatusLabel(route.status)}
        seriesTitle={route.audience_label || route.excerpt || route.title}
        coverImageUrl={null}
        coverVariant={route.featured ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="entry-route-card__body">
        <div className="meta-row">
          <span className={getEntryRouteStatusTone(route.status)}>{getEntryRouteStatusLabel(route.status)}</span>
          {route.audience_label ? <span>{route.audience_label}</span> : null}
          <span>{itemCount} passo{itemCount === 1 ? "" : "s"}</span>
        </div>
        <h3>{route.title}</h3>
        <p>{route.excerpt || route.description}</p>
        <Link href={href} className="button-secondary">
          Abrir rota
        </Link>
      </div>
    </article>
  );
}
