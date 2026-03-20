import Link from "next/link";

import type { PublicImpactLink } from "@/lib/impact/types";
import { getImpactLinkRoleLabel, getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";

type Props = {
  title: string;
  question: string | null;
  description: string | null;
  status: string;
  impactType: string;
  dateLabel: string | null;
  happenedAt: string | null;
  territoryLabel: string | null;
  href: string;
  linkCount: number;
  latestLink?: PublicImpactLink | null;
};

export function ImpactPrimaryPiece({
  title,
  question,
  description,
  status,
  impactType,
  dateLabel,
  happenedAt,
  territoryLabel,
  href,
  linkCount,
  latestLink,
}: Props) {
  return (
    <article className="support-box home-callout home-callout--accent impact-primary-piece">
      <p className="eyebrow">peça central</p>
      <h3>{title}</h3>
      {question ? <p className="impact-primary-piece__question">{question}</p> : null}
      <p>{description || "O efeito público condensado como consequência editorial."}</p>
      <div className="meta-row">
        <span>{getImpactStatusLabel(status)}</span>
        <span>{getImpactTypeLabel(impactType)}</span>
        {dateLabel ? <span>{dateLabel}</span> : null}
        {happenedAt ? <span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(happenedAt))}</span> : null}
      </div>
      <div className="meta-row">
        {territoryLabel ? <span>{territoryLabel}</span> : null}
        <span>{linkCount} vínculo{linkCount === 1 ? "" : "s"}</span>
        {latestLink ? <span>último passo: {getImpactLinkRoleLabel(latestLink.link_role)}</span> : null}
      </div>
      <div className="stack-actions">
        <Link href={href} className="button">
          Abrir impacto
        </Link>
      </div>
    </article>
  );
}
