import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { CampaignForm } from "@/components/campaign-form";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { buildEntrySeed } from "@/lib/enriquecimento/resolve";

export const metadata: Metadata = {
  title: "Nova campanha",
  description: "Criação de chamado público do VR Abandonada.",
};

type PageProps = {
  searchParams?: Promise<{ entry_id?: string }>;
};

export default async function NewCampaignPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const entry = resolvedSearchParams.entry_id ? await getInternalEditorialEntryById(resolvedSearchParams.entry_id) : null;
  const seed = entry ? buildEntrySeed(entry) : null;

  return (
    <Container className="intro-grid internal-page campaign-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">campanhas internas</p>
        <h1 className="hero__title">Nova campanha</h1>
        <p className="hero__lead">
          Crie um foco temporário para condensar investigação, participação e mobilização pública sem virar marketing genérico.
        </p>
        <div className="hero__actions">
          <Link href="/interno/campanhas" className="button-secondary">
            Voltar para a lista
          </Link>
          <Link href="/campanhas" className="button">
            Ver público
          </Link>
        </div>
      </section>

      {entry && seed ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <article className="support-box">
              <p className="eyebrow">entrada de origem</p>
              <h3>{entry.title}</h3>
              <p>{seed.excerpt}</p>
            </article>
            <article className="support-box">
              <p className="eyebrow">sinal rápido</p>
              <ul>
                <li>Território: {seed.territoryLabel || "não informado"}</li>
                <li>Eixo: {seed.axisLabel || "não informado"}</li>
                <li>Ano: {seed.yearLabel || "não informado"}</li>
              </ul>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">formulário</p>
            <h2>Dados da campanha</h2>
          </div>
          <p className="section__lead">Defina título, pergunta central, status, tipo e a visibilidade pública antes de montar os vínculos.</p>
        </div>

        <CampaignForm
          initialValues={
            seed
              ? {
                  title: seed.title,
                  slug: seed.slug,
                  excerpt: seed.excerpt,
                  description: seed.description,
                  lead_question: seed.leadQuestion,
                  campaign_type: entry?.entry_type === "document" ? "investigation" : "call",
                  status: "upcoming",
                  start_date: "",
                  end_date: "",
                  cover_image_url: "",
                  sort_order: 0,
                  public_visibility: false,
                  featured: false,
                }
              : undefined
          }
        />
      </section>
    </Container>
  );
}
