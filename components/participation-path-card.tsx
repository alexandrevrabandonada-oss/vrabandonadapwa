import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getParticipationStatusLabel, getParticipationStatusTone } from "@/lib/participation/navigation";
import type { ParticipationPath } from "@/lib/participation/types";

type Props = {
  path: ParticipationPath;
  href: string;
  itemCount?: number;
  compact?: boolean;
};

function trimText(value: string | null | undefined, max = 90) {
  if (!value) return "";
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

export function ParticipationPathCard({ path, href, itemCount = 0, compact = false }: Props) {
  return (
    <article className={`card participation-card ${compact ? "participation-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={path.title}
        primaryTag={getParticipationStatusLabel(path.status)}
        seriesTitle={path.audience_label || path.excerpt || path.title}
        coverImageUrl={null}
        coverVariant={path.featured ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="participation-card__body">
        <div className="meta-row">
          <span className={getParticipationStatusTone(path.status)}>{getParticipationStatusLabel(path.status)}</span>
          {path.audience_label ? <span>{path.audience_label}</span> : null}
          <span>{itemCount} passo{itemCount === 1 ? "" : "s"}</span>
        </div>
        <h3>{path.title}</h3>
        <p>{compact ? trimText(path.excerpt || path.description) : path.excerpt || path.description}</p>
        <Link href={href} className="button-secondary">
          {compact ? "Abrir" : "Abrir caminho"}
        </Link>
      </div>
    </article>
  );
}
