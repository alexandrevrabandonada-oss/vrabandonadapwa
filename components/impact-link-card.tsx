import Link from "next/link";

import type { ImpactLinkResolved } from "@/lib/impact/types";

type Props = {
  link: ImpactLinkResolved;
  compact?: boolean;
};

export function ImpactLinkCard({ link, compact = false }: Props) {
  return (
    <article className={`card impact-link-card ${compact ? "impact-link-card--compact" : ""}`.trim()}>
      <div className="meta-row">
        <span>{link.roleLabel}</span>
        <span>{link.typeLabel}</span>
        {link.featured ? <span>destaque</span> : null}
        {link.external ? <span>externo</span> : null}
      </div>
      <h3>{link.note || link.link_key}</h3>
      <p>{link.note || "Peça conectada ao impacto."}</p>
      <Link href={link.href} className="button-secondary">
        Abrir vínculo
      </Link>
    </article>
  );
}
