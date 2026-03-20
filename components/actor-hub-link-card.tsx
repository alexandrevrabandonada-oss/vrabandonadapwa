import Link from "next/link";

import type { ActorHubResolvedLink } from "@/lib/actors/types";

type Props = {
  link: ActorHubResolvedLink;
  compact?: boolean;
};

export function ActorHubLinkCard({ link, compact = false }: Props) {
  return (
    <article className={`card place-hub-link-card ${compact ? "place-hub-link-card--compact" : ""}`.trim()}>
      <p className="eyebrow">{link.roleLabel}</p>
      <h3>{link.title}</h3>
      <p>{link.excerpt || link.timeline_note || "Sem resumo."}</p>
      <div className="meta-row">
        <span>{link.typeLabel}</span>
        {link.timeline_label ? <span>{link.timeline_label}</span> : null}
        {link.timeline_year ? <span>{link.timeline_year}</span> : null}
      </div>
      {link.timeline_note ? <p>{link.timeline_note}</p> : null}
      <Link href={link.href} className="button-secondary">
        Abrir
      </Link>
    </article>
  );
}
