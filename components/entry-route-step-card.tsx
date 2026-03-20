import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getEntryRouteItemRoleLabel, getEntryRouteItemRoleTone, getEntryRouteItemTypeLabel } from "@/lib/entry-routes/navigation";
import type { EntryRouteResolvedItem } from "@/lib/entry-routes/types";

type Props = {
  item: EntryRouteResolvedItem;
};

export function EntryRouteStepCard({ item }: Props) {
  return (
    <article className="card entry-route-step-card">
      <EditorialCover
        title={item.title}
        primaryTag={getEntryRouteItemRoleLabel(item.role)}
        seriesTitle={getEntryRouteItemTypeLabel(item.item_type)}
        coverImageUrl={item.coverImageUrl}
        coverVariant={item.coverVariant}
      />
      <div className="entry-route-step-card__body">
        <div className="meta-row">
          <span className={getEntryRouteItemRoleTone(item.role)}>{getEntryRouteItemRoleLabel(item.role)}</span>
          <span>{item.primaryLabel}</span>
          {item.secondaryLabel ? <span>{item.secondaryLabel}</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.excerpt || item.note || "Peça de entrada do percurso."}</p>
        {item.note ? <p className="entry-route-step-card__note">{item.note}</p> : null}
        <Link href={item.href} className="button-secondary">
          Abrir peça
        </Link>
      </div>
    </article>
  );
}
