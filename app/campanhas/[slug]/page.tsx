import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { CampaignLinkCard } from "@/components/campaign-link-card";
import { CampaignPrimaryPiece } from "@/components/campaign-primary-piece";
import { EditorialCover } from "@/components/editorial-cover";
import { SaveReadButton } from "@/components/save-read-button";
import { SharePanel } from "@/components/share-panel";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { getPublishedCampaignBySlug, getPublishedCampaignLinks } from "@/lib/campaigns/queries";
import { resolveCampaignLink } from "@/lib/campaigns/resolve";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getPublishedCampaignBySlug(slug);

  if (!campaign) {
    return { title: "Campanha" };
  }

  return {
    title: campaign.title,
    description: campaign.excerpt || campaign.description || "Campanha pública do VR Abandonada.",
  };
}

function getCampaignDateLabel(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getPublishedCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const links = await getPublishedCampaignLinks(campaign.id);
  const resolvedLinks = links.map((link) => resolveCampaignLink(link));
  const grouped = resolvedLinks.reduce<Record<string, typeof resolvedLinks>>((acc, link) => {
    const key = link.link_role;
    acc[key] = acc[key] ? [...acc[key], link] : [link];
    return acc;
  }, {} as Record<string, typeof resolvedLinks>);

  const leadLink = grouped.lead?.[0] ?? resolvedLinks[0] ?? null;
  const evidenceLinks = grouped.evidence ?? [];
  const contextLinks = grouped.context ?? [];
  const followupLinks = grouped.followup ?? [];
  const archiveLinks = grouped.archive ?? [];

  return (
    <Container className="intro-grid campaign-page">
      <section className="hero hero--split campaign-hero">
        <div className="hero__copy">
          <p className="eyebrow">campanha</p>
          <h1 className="hero__title">{campaign.title}</h1>
          <p className="hero__lead">
            {campaign.lead_question || campaign.excerpt || campaign.description || "Foco público do momento."}
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getCampaignStatusLabel(campaign.status)}</span>
            <span className="home-hero__signal">{getCampaignTypeLabel(campaign.campaign_type)}</span>
            {campaign.start_date ? <span className="home-hero__signal">desde {getCampaignDateLabel(campaign.start_date)}</span> : null}
          </div>
          <div className="hero__actions">
            <Link href="#como-ajudar" className="button">
              Como ajudar
            </Link>
            <SaveReadButton kind="campaign" keyValue={campaign.slug} title={campaign.title} summary={campaign.excerpt || campaign.description || campaign.title} href={`/campanhas/${campaign.slug}`} compact />
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </div>
        </div>

        <EditorialCover
          title={campaign.title}
          primaryTag={getCampaignStatusLabel(campaign.status)}
          seriesTitle={campaign.lead_question || campaign.excerpt || campaign.title}
          coverImageUrl={campaign.cover_image_url}
          coverVariant={campaign.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">compartilhar</p>
            <h2>Uma campanha precisa de circulação responsável.</h2>
          </div>
          <p className="section__lead">Leve o chamado fora do site sem perder o caminho de volta ao método e à participação.</p>
        </div>

        <SharePanel
          title={campaign.title}
          summary={campaign.lead_question || campaign.excerpt || campaign.description || "Foco público do momento."}
          caption={`Leia e compartilhe: ${campaign.title}. ${campaign.lead_question || campaign.excerpt || campaign.description || ""}`.trim()}
          shareHref={`/compartilhar/campanha/${campaign.slug}`}
          contentHref={`/campanhas/${campaign.slug}`}
          titleLabel="compartilhe esta campanha"
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que está em jogo</p>
            <h2>Uma frente pública condensada em um foco temporário.</h2>
          </div>
          <p className="section__lead">
            {campaign.description || "A campanha existe para reunir investigação, material de base, participação e apoio em um mesmo momento editorial."}
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>{getCampaignStatusLabel(campaign.status)}</h3>
            <p>Estado narrativo da campanha.</p>
          </article>
          <article className="card">
            <h3>{getCampaignTypeLabel(campaign.campaign_type)}</h3>
            <p>Tipo de mobilização e foco editorial.</p>
          </article>
          <article className="card">
            <h3>{links.length} vínculo{links.length === 1 ? "" : "s"}</h3>
            <p>Peças que sustentam este chamado.</p>
          </article>
        </div>
      </section>

      {leadLink ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">peça central</p>
              <h2>Por onde começar este foco.</h2>
            </div>
            <p className="section__lead">A campanha precisa de uma entrada clara para não virar cartaz vazio.</p>
          </div>

          <CampaignPrimaryPiece
            title={campaign.title}
            question={campaign.lead_question}
            description={campaign.excerpt || campaign.description}
            status={campaign.status}
            campaignType={campaign.campaign_type}
            startDate={campaign.start_date}
            endDate={campaign.end_date}
            href={leadLink.href}
            linkCount={links.length}
            latestLink={links[0] ?? null}
          />
        </section>
      ) : null}

      {evidenceLinks.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">provas e documentos</p>
              <h2>O que estamos reunindo agora.</h2>
            </div>
            <p className="section__lead">Documentos, acervo e peças de base que dão lastro à campanha.</p>
          </div>

          <div className="grid-2">
            {evidenceLinks.map((link) => (
              <CampaignLinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      ) : null}

      {contextLinks.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">contexto e leitura</p>
              <h2>O que precisa ser lembrado para ler o chamado.</h2>
            </div>
            <p className="section__lead">Pautas, eixos, memória e dossiê ajudam a entender a duração do problema.</p>
          </div>

          <div className="grid-2">
            {contextLinks.map((link) => (
              <CampaignLinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      ) : null}

      {archiveLinks.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">arquivo vivo</p>
              <h2>Documentos que sustentam a memória do foco.</h2>
            </div>
            <p className="section__lead">Quando a campanha toca história, o arquivo entra como parte do argumento público.</p>
          </div>

          <div className="grid-2">
            {archiveLinks.map((link) => (
              <CampaignLinkCard key={link.id} link={link} compact />
            ))}
          </div>
        </section>
      ) : null}

      {followupLinks.length ? (
        <section className="section" id="como-ajudar">
          <div className="grid-2">
            <div>
              <p className="eyebrow">como ajudar</p>
              <h2>O chamado público precisa de gesto concreto.</h2>
            </div>
            <p className="section__lead">Use o caminho certo para o que você tem em mãos: relato, documento, memória, circulação ou apoio.</p>
          </div>

          <div className="grid-2">
            {followupLinks.map((link) => (
              <CampaignLinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos passos</p>
            <h2>A campanha só faz sentido se continuar acionando o resto do projeto.</h2>
          </div>
          <p className="section__lead">Depois de ler o foco, siga o fio: participação, envio, método, radar e arquivo vivo.</p>
        </div>

        <div className="stack-actions">
          <Link href="/envie" className="button">
            Enviar pista ou documento
          </Link>
          <Link href="/participe" className="button-secondary">
            Ver participação
          </Link>
          <Link href="/metodo" className="button-secondary">
            Ler método
          </Link>
          <Link href="/apoie" className="button-secondary">
            Apoiar o projeto
          </Link>
        </div>
      </section>
    </Container>
  );
}



