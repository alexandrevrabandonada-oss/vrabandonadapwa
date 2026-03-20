import Link from "next/link";

import { getPatternReadLinkRoleLabel, getPatternReadLinkTypeLabel } from "@/lib/patterns/navigation";
import type { PatternRead, PatternReadResolvedLink } from "@/lib/patterns/types";

type Props = {
  patternRead: PatternRead;
  leadLink: PatternReadResolvedLink | null;
};

export function PatternReadPrimaryPiece({ patternRead, leadLink }: Props) {
  if (!leadLink) {
    return (
      <article className="support-box home-callout home-callout--accent">
        <p className="eyebrow">por onde começar</p>
        <h3>{patternRead.title}</h3>
        <p>
          Ainda não há peça central definida para este padrão. Marque uma pauta, dossiê, território ou ator como entrada principal.
        </p>
        <div className="stack-actions">
          <Link href="/padroes" className="button-secondary">
            Ver mapa de padrões
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="support-box home-callout home-callout--accent">
      <p className="eyebrow">por onde começar</p>
      <h3>{leadLink.title}</h3>
      <p>{leadLink.excerpt || leadLink.timeline_note || patternRead.lead_question || patternRead.excerpt || patternRead.description || "Peça central do padrão."}</p>
      <div className="meta-row">
        <span>{getPatternReadLinkRoleLabel(leadLink.link_role)}</span>
        <span>{getPatternReadLinkTypeLabel(leadLink.link_type)}</span>
        {leadLink.timeline_label ? <span>{leadLink.timeline_label}</span> : null}
      </div>
      <div className="stack-actions">
        <Link href={leadLink.href} className="button">
          Abrir peça central
        </Link>
        <Link href="#padrao-vivo" className="button-secondary">
          Ver leitura estrutural
        </Link>
      </div>
    </article>
  );
}

