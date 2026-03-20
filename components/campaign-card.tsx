import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { getCampaignStatusLabel, getCampaignStatusTone, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import type { PublicCampaign } from "@/lib/campaigns/types";

type Props = {
  campaign: PublicCampaign;
  href: string;
  itemCount?: number;
  compact?: boolean;
};

export function CampaignCard({ campaign, href, itemCount = 0, compact = false }: Props) {
  return (
    <article className={`card campaign-card ${compact ? "campaign-card--compact" : ""}`.trim()}>
      <EditorialCover
        title={campaign.title}
        primaryTag={getCampaignStatusLabel(campaign.status)}
        seriesTitle={campaign.lead_question || campaign.excerpt || campaign.title}
        coverImageUrl={campaign.cover_image_url}
        coverVariant={campaign.featured ? "ember" : "concrete"}
        compact={compact}
      />
      <div className="campaign-card__body">
        <div className="meta-row">
          <span className={getCampaignStatusTone(campaign.status)}>{getCampaignStatusLabel(campaign.status)}</span>
          <span>{getCampaignTypeLabel(campaign.campaign_type)}</span>
          <span>{itemCount} vínculo{itemCount === 1 ? "" : "s"}</span>
        </div>
        <h3>{campaign.title}</h3>
        <p>{campaign.excerpt || campaign.description}</p>
        <Link href={href} className="button-secondary">
          Abrir campanha
        </Link>
      </div>
    </article>
  );
}
