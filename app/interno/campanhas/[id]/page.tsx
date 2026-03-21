import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { CampaignCard } from "@/components/campaign-card";
import { CampaignForm } from "@/components/campaign-form";
import { CampaignLinkForm } from "@/components/campaign-link-form";
import { CampaignLinkCard } from "@/components/campaign-link-card";
import { getCampaignLinkRoleLabel, getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { getInternalCampaignById, getInternalCampaignLinks } from "@/lib/campaigns/queries";
import { resolveCampaignLink } from "@/lib/campaigns/resolve";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getInternalCampaignById(id);

  if (!campaign) {
    return { title: "Campanha interna" };
  }

  return {
    title: campaign.title,
    description: campaign.excerpt || campaign.description || "Campanha interna do VR Abandonada.",
  };
}

export default async function InternalCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const { id } = await params;
  const campaign = await getInternalCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const links = await getInternalCampaignLinks(campaign.id);
  const resolvedLinks = links.map((link) => resolveCampaignLink(link));

  return (
    <Container className="intro-grid internal-page campaign-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">campanhas internas</p>
        <h1 className="hero__title">{campaign.title}</h1>
        <p className="hero__lead">
          {campaign.lead_question || campaign.excerpt || campaign.description || "Foco público do momento."}
        </p>
        <div className="hero__actions">`r`n          <Link href="/interno/campanhas" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/campanhas/${campaign.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <article className="support-box">
            <p className="eyebrow">estado atual</p>
            <h3>{getCampaignStatusLabel(campaign.status)}</h3>
            <p>{getCampaignTypeLabel(campaign.campaign_type)}</p>
            <p>{campaign.public_visibility ? "Campanha pública" : "Campanha interna"}</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">resumo</p>
            <h3>O que esta campanha condensa</h3>
            <p>{campaign.description || "Sem descrição cadastrada."}</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Dados da campanha</h2>
          </div>
          <p className="section__lead">Ajuste status, visibilidade, destaque e pergunta central sem sair do fluxo.</p>
        </div>

        <CampaignForm campaign={campaign} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">previsão pública</p>
            <h2>Como a campanha aparece para o público.</h2>
          </div>
          <p className="section__lead">O preview ajuda a conferir o impacto antes de publicar ou atualizar o foco temporário.</p>
        </div>

        <div className="grid-2">
          <CampaignCard campaign={campaign} href={`/campanhas/${campaign.slug}`} itemCount={resolvedLinks.length} />
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{resolvedLinks.length} peças conectadas</h3>
            <p>Entrada, prova, contexto, desdobramento e arquivo entram na mesma linha editorial.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">novo vínculo</p>
            <h2>Conectar peça à campanha</h2>
          </div>
          <p className="section__lead">Escolha a peça, o papel e a ordem de leitura para montar o percurso temporário.</p>
        </div>

        <CampaignLinkForm campaignId={campaign.id} campaignSlug={campaign.slug} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos existentes</p>
            <h2>Percurso já montado</h2>
          </div>
          <p className="section__lead">As peças abaixo podem ser ajustadas ou removidas conforme a campanha muda de foco.</p>
        </div>

        <div className="grid-2">
          {resolvedLinks.length ? (
            resolvedLinks.map((link) => (
              <article className="support-box" key={link.id}>
                <div className="meta-row">
                  <span>{getCampaignLinkRoleLabel(link.link_role)}</span>
                  <span>{link.typeLabel}</span>
                  {link.featured ? <span>destaque</span> : null}
                </div>
                <CampaignLinkCard link={link} compact />
                <CampaignLinkForm campaignId={campaign.id} campaignSlug={campaign.slug} link={links.find((item) => item.id === link.id) ?? null} compact />
              </article>
            ))
          ) : (
            <div className="support-box">
              <h3>Sem vínculos ainda</h3>
              <p>Adicione a primeira peça para criar a leitura pública do foco temporário.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}


