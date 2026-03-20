import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getThemeHubLinkRoleLabel, getThemeHubLinkTypeLabel } from "@/lib/hubs/navigation";
import type { ThemeHub, ThemeHubResolvedLink } from "@/lib/hubs/types";

type Props = {
  hub: ThemeHub;
  leadLink?: ThemeHubResolvedLink | null;
};

export function ThemeHubLeadPiece({ hub, leadLink }: Props) {
  if (!leadLink) {
    return (
      <article className="support-box theme-hub-primary-piece">
        <p className="eyebrow">por onde começar</p>
        <h3>{hub.lead_question || hub.title}</h3>
        <p>{hub.excerpt || hub.description || "Eixo sem peça central definida ainda."}</p>
      </article>
    );
  }

  return (
    <article className="support-box theme-hub-primary-piece">
      <p className="eyebrow">peça central</p>
      <EditorialCover
        title={leadLink.title}
        primaryTag={getThemeHubLinkRoleLabel(leadLink.link_role)}
        seriesTitle={getThemeHubLinkTypeLabel(leadLink.link_type)}
        coverImageUrl={null}
        coverVariant="ember"
      />
      <div className="theme-hub-primary-piece__body">
        <div className="meta-row">
          <span>{getThemeHubLinkRoleLabel(leadLink.link_role)}</span>
          <span>{getThemeHubLinkTypeLabel(leadLink.link_type)}</span>
          {leadLink.timeline_label || leadLink.timeline_year ? <span>{leadLink.timeline_label || String(leadLink.timeline_year)}</span> : null}
        </div>
        <h3>{leadLink.title}</h3>
        <p>{leadLink.excerpt || hub.lead_question || hub.description}</p>
        {leadLink.timeline_note ? <p>{leadLink.timeline_note}</p> : null}
        <Link href={leadLink.href} className="button-secondary">
          Abrir peça central
        </Link>
      </div>
    </article>
  );
}
