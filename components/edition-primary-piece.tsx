import Link from "next/link";

import type { EditorialEditionLink } from "@/lib/editions/types";
import { getEditionLinkRoleLabel, getEditionStatusLabel, getEditionTypeLabel } from "@/lib/editions/navigation";

type Props = {
  title: string;
  excerpt: string | null;
  description: string | null;
  status: string;
  editionType: string;
  periodLabel: string | null;
  publishedAt: string | null;
  href: string;
  linkCount: number;
  latestLink?: EditorialEditionLink | null;
};

export function EditionPrimaryPiece({
  title,
  excerpt,
  description,
  status,
  editionType,
  periodLabel,
  publishedAt,
  href,
  linkCount,
  latestLink,
}: Props) {
  return (
    <article className="support-box home-callout home-callout--accent edition-primary-piece">
      <p className="eyebrow">edição central</p>
      <h3>{title}</h3>
      <p className="edition-primary-piece__question">{excerpt || description || "Síntese editorial do momento."}</p>
      <p>{description || "Uma edição para condensar o radar, a campanha e a leitura estrutural do período."}</p>
      <div className="meta-row">
        <span>{getEditionStatusLabel(status)}</span>
        <span>{getEditionTypeLabel(editionType)}</span>
        {periodLabel ? <span>{periodLabel}</span> : null}
        {publishedAt ? <span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(publishedAt))}</span> : null}
      </div>
      <div className="meta-row">
        <span>{linkCount} vínculo{linkCount === 1 ? "" : "s"}</span>
        {latestLink ? <span>último passo: {getEditionLinkRoleLabel(latestLink.link_role)}</span> : null}
      </div>
      <div className="stack-actions">
        <Link href={href} className="button">
          Abrir edição
        </Link>
      </div>
    </article>
  );
}
