import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { CampaignCard } from "@/components/campaign-card";
import { CampaignPrimaryPiece } from "@/components/campaign-primary-piece";
import { getPublishedCampaignLinks, getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Chamados públicos, focos temporários e mobilizações editoriais do VR Abandonada.",
};

function getCampaignStartDateLabel(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CampaignsPage() {
  const campaigns = await getPublishedCampaigns();
  const linkPairs = await Promise.all(campaigns.map(async (campaign) => [campaign.id, await getPublishedCampaignLinks(campaign.id)] as const));
  const linksByCampaignId = new Map(linkPairs);
  const featuredCampaign =
    campaigns.find((campaign) => campaign.featured && campaign.status === "active") ??
    campaigns.find((campaign) => campaign.status === "active") ??
    campaigns[0] ??
    null;

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");
  const monitoringCampaigns = campaigns.filter((campaign) => campaign.status === "monitoring");
  const closedCampaigns = campaigns.filter((campaign) => campaign.status === "closed");
  const archivedCampaigns = campaigns.filter((campaign) => campaign.status === "archived");
  const spotlightLinks = featuredCampaign ? linksByCampaignId.get(featuredCampaign.id) ?? [] : [];
  const spotlightLead = spotlightLinks[0] ?? null;

  return (
    <Container className="intro-grid campaigns-page">
      <section className="hero hero--split campaigns-hero">
        <div className="hero__copy">
          <p className="eyebrow">campanhas</p>
          <h1 className="hero__title">Focos públicos do momento.</h1>
          <p className="hero__lead">
            Chamados temporários condensam investigação, participação, método e apoio quando o projeto precisa puxar um tema com mais força.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">urgência editorial</span>
            <span className="home-hero__signal">mobilização responsável</span>
            <span className="home-hero__signal">foco temporário</span>
          </div>
          <div className="hero__actions">
            <Link href="/participe" className="button-secondary">
              Ver como participar
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ler método
            </Link>
          </div>
        </div>

        {featuredCampaign ? (
          <CampaignPrimaryPiece
            title={featuredCampaign.title}
            question={featuredCampaign.lead_question}
            description={featuredCampaign.excerpt || featuredCampaign.description}
            status={featuredCampaign.status}
            campaignType={featuredCampaign.campaign_type}
            startDate={featuredCampaign.start_date}
            endDate={featuredCampaign.end_date}
            href={`/campanhas/${featuredCampaign.slug}`}
            linkCount={spotlightLinks.length}
            latestLink={spotlightLead}
          />
        ) : (
          <article className="support-box home-callout home-callout--accent">
            <p className="eyebrow">sem foco ativo</p>
            <h2>As campanhas entram quando o projeto precisa condensar atenção pública.</h2>
            <p>O sistema está pronto para destacar investigações, chamadas e focos temporários conforme a necessidade editorial.</p>
            <Link href="/participe" className="button">
              Ver participação
            </Link>
          </article>
        )}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que são</p>
            <h2>Campanhas reúnem o que está sendo puxado agora.</h2>
          </div>
          <p className="section__lead">
            O foco temporário não substitui dossiê, eixo ou pauta. Ele os condensa quando há um gesto público a fazer, uma reunião de materiais ou uma frente que pede retorno coletivo.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>{activeCampaigns.length}</h3>
            <p>Campanhas ativas pedindo atenção agora.</p>
          </article>
          <article className="card">
            <h3>{monitoringCampaigns.length}</h3>
            <p>Campanhas em monitoramento e observação pública.</p>
          </article>
          <article className="card">
            <h3>{closedCampaigns.length + archivedCampaigns.length}</h3>
            <p>Campanhas encerradas ou em arquivo.</p>
          </article>
          <article className="card">
            <h3>{campaigns.length}</h3>
            <p>Total de focos temporários cadastrados.</p>
          </article>
        </div>
      </section>

      {featuredCampaign ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">campanha em destaque</p>
              <h2>{featuredCampaign.title}</h2>
            </div>
            <p className="section__lead">
              {featuredCampaign.lead_question || featuredCampaign.excerpt || featuredCampaign.description || "Foco público do momento."}
            </p>
          </div>

          <div className="grid-2">
            <CampaignCard campaign={featuredCampaign} href={`/campanhas/${featuredCampaign.slug}`} itemCount={spotlightLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa agora</p>
              <h3>O chamado público organiza leitura e ação sem virar marketing.</h3>
              <p>
                A campanha reúne materiais, aponta o que está em jogo e oferece caminhos responsáveis para participação, envio, método e apoio.
              </p>
              <div className="stack-actions">
                <Link href={`/campanhas/${featuredCampaign.slug}`} className="button">
                  Abrir campanha
                </Link>
                <Link href="/envie" className="button-secondary">
                  Enviar material
                </Link>
              </div>
              <p className="meta-row">
                <span>{getCampaignStatusLabel(featuredCampaign.status)}</span>
                <span>{getCampaignTypeLabel(featuredCampaign.campaign_type)}</span>
                {featuredCampaign.start_date ? <span>desde {getCampaignStartDateLabel(featuredCampaign.start_date)}</span> : null}
              </p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">ativas</p>
            <h2>Chamados que pedem continuidade.</h2>
          </div>
          <p className="section__lead">As campanhas ativas condensam o que o projeto está puxando agora e funcionam como porta de entrada para a mobilização pública.</p>
        </div>

        <div className="grid-2">
          {activeCampaigns.length ? activeCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} href={`/campanhas/${campaign.slug}`} itemCount={linksByCampaignId.get(campaign.id)?.length ?? 0} compact />
          )) : (
            <div className="support-box">
              <h3>Sem campanha ativa no momento</h3>
              <p>Quando houver um foco temporário em curso, ele entra aqui com destaque editorial.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">monitoramento</p>
            <h2>O que ainda está sendo acompanhado.</h2>
          </div>
          <p className="section__lead">Campanhas em monitoramento pedem observação pública sem prometer fechamento rápido.</p>
        </div>

        <div className="grid-2">
          {monitoringCampaigns.length ? monitoringCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} href={`/campanhas/${campaign.slug}`} itemCount={linksByCampaignId.get(campaign.id)?.length ?? 0} compact />
          )) : (
            <div className="support-box">
              <h3>Sem campanha em monitoramento</h3>
              <p>Quando a frente estiver em observação, ela aparece aqui com o mesmo cuidado visual.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">arquivo</p>
            <h2>Chamados encerrados ou guardados como referência.</h2>
          </div>
          <p className="section__lead">Mesmo quando um foco termina, ele segue útil como referência de percurso, memória e método.</p>
        </div>

        <div className="grid-2">
          {[...closedCampaigns, ...archivedCampaigns].length ? (
            [...closedCampaigns, ...archivedCampaigns].map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} href={`/campanhas/${campaign.slug}`} itemCount={linksByCampaignId.get(campaign.id)?.length ?? 0} compact />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem campanhas no arquivo</h3>
              <p>Quando um foco se encerra, ele pode seguir visível como memória editorial do projeto.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhar e participar</p>
            <h2>A campanha conecta foco público a gesto concreto.</h2>
          </div>
          <p className="section__lead">Se você quer continuar, use o caminho certo: ler método, enviar material, acompanhar o radar ou apoiar a continuidade.</p>
        </div>

        <div className="stack-actions">
          <Link href="/participe" className="button-secondary">
            Ver participação
          </Link>
          <Link href="/envie" className="button-secondary">
            Abrir envio
          </Link>
          <Link href="/metodo" className="button-secondary">
            Ler o método
          </Link>
          <Link href="/agora" className="button-secondary">
            Ver o radar
          </Link>
        </div>
      </section>
    </Container>
  );
}
