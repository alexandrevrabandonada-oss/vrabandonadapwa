import Link from "next/link";

import type { PublicCampaignLink } from "@/lib/campaigns/types";
import { getCampaignLinkRoleLabel, getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";

type Props = {
  title: string;
  question: string | null;
  description: string | null;
  status: string;
  campaignType: string;
  startDate: string | null;
  endDate: string | null;
  href: string;
  linkCount: number;
  latestLink?: PublicCampaignLink | null;
};

export function CampaignPrimaryPiece({
  title,
  question,
  description,
  status,
  campaignType,
  startDate,
  endDate,
  href,
  linkCount,
  latestLink,
}: Props) {
  return (
    <article className="support-box home-callout home-callout--accent campaign-primary-piece">
      <p className="eyebrow">peça central</p>
      <h3>{title}</h3>
      {question ? <p className="campaign-primary-piece__question">{question}</p> : null}
      <p>{description || "O foco do momento condensado como chamado público."}</p>
      <div className="meta-row">
        <span>{getCampaignStatusLabel(status)}</span>
        <span>{getCampaignTypeLabel(campaignType)}</span>
        {startDate ? <span>desde {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(startDate))}</span> : null}
        {endDate ? <span>até {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(endDate))}</span> : null}
      </div>
      <div className="meta-row">
        <span>{linkCount} vínculo{linkCount === 1 ? "" : "s"}</span>
        {latestLink ? <span>último passo: {getCampaignLinkRoleLabel(latestLink.link_role)}</span> : null}
      </div>
      <div className="stack-actions">
        <Link href={href} className="button">
          Abrir campanha
        </Link>
      </div>
    </article>
  );
}
