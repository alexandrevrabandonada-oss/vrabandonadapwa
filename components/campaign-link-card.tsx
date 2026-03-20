import Link from "next/link";

import type { CampaignLinkResolved } from "@/lib/campaigns/types";

type Props = {
  link: CampaignLinkResolved;
  compact?: boolean;
};

export function CampaignLinkCard({ link, compact = false }: Props) {
  return (
    <article className={`card campaign-link-card ${compact ? "campaign-link-card--compact" : ""}`.trim()}>
      <div className="meta-row">
        <span>{link.roleLabel}</span>
        <span>{link.typeLabel}</span>
        {link.featured ? <span>destaque</span> : null}
        {link.external ? <span>externo</span> : null}
      </div>
      <h3>{link.note || link.link_key}</h3>
      <p>{link.note || "Peça conectada à campanha."}</p>
      <Link href={link.href} className="button-secondary">
        Abrir vínculo
      </Link>
    </article>
  );
}
