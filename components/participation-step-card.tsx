import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getParticipationItemRoleLabel, getParticipationItemTypeLabel } from "@/lib/participation/navigation";
import type { ParticipationResolvedItem } from "@/lib/participation/types";

type Props = {
  item: ParticipationResolvedItem;
};

export function ParticipationStepCard({ item }: Props) {
  return (
    <article className="card participation-step-card">
      <EditorialCover
        title={item.title}
        primaryTag={getParticipationItemRoleLabel(item.role)}
        seriesTitle={getParticipationItemTypeLabel(item.item_type)}
        coverImageUrl={null}
        coverVariant="concrete"
      />
      <div className="participation-step-card__body">
        <div className="meta-row">
          <span className={`tag-row__item ${item.roleTone}`.trim()}>{getParticipationItemRoleLabel(item.role)}</span>
          <span>{item.primaryLabel}</span>
          {item.secondaryLabel ? <span>{item.secondaryLabel}</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.excerpt || item.note || "Peça de participação."}</p>
        {item.note ? <p className="participation-step-card__note">{item.note}</p> : null}
        <Link href={item.href} className="button-secondary">
          Abrir
        </Link>
      </div>
    </article>
  );
}