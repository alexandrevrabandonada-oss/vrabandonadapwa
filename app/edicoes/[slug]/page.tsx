import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EditionLinkCard } from "@/components/edition-link-card";
import { EditionPrimaryPiece } from "@/components/edition-primary-piece";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { groupEditionLinksByType, resolveEditionLinks } from "@/lib/editions/resolve";
import { getPublishedEditorialEditionBySlug, getPublishedEditorialEditionLinks, getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getEditionCoverVariant, getEditionStatusLabel, getEditionStatusTone, getEditionTypeLabel } from "@/lib/editions/navigation";
import { getEditionOpenGraphImagePath } from "@/lib/editions/share";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const editions = await getPublishedEditorialEditions();
  return editions.map((edition) => ({ slug: edition.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getPublishedEditorialEditionBySlug(slug);

  if (!edition) {
    return {
      title: "Edição",
      description: "Síntese editorial do VR Abandonada.",
    };
  }

  return {
    title: `${edition.title} | Edições`,
    description: edition.excerpt || edition.description || "Síntese editorial do VR Abandonada.",
    openGraph: {
      title: `${edition.title} | VR Abandonada`,
      description: edition.excerpt || edition.description || "Síntese editorial do VR Abandonada.",
      type: "website",
      images: [getEditionOpenGraphImagePath(edition.slug)],
    },
    twitter: {
      card: "summary_large_image",
      title: `${edition.title} | VR Abandonada`,
      description: edition.excerpt || edition.description || "Síntese editorial do VR Abandonada.",
      images: [getEditionOpenGraphImagePath(edition.slug)],
    },
  };
}

export default async function EditionPage({ params }: PageProps) {
  const { slug } = await params;
  const edition = await getPublishedEditorialEditionBySlug(slug);

  if (!edition) {
    notFound();
  }

  const links = await getPublishedEditorialEditionLinks(edition.id);
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const dossiers = await getPublishedDossiers();
  const campaigns = await getPublishedCampaigns();
  const impacts = await getPublishedImpacts();
  const themeHubs = await getPublishedThemeHubs();
  const placeHubs = await getPublishedPlaceHubs();
  const actorHubs = await getPublishedActorHubs();
  const patternReads = await getPublishedPatternReads();

  const resolvedLinks = resolveEditionLinks(links, {
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    dossiers,
    campaigns,
    impacts,
    themeHubs,
    placeHubs,
    actorHubs,
    patternReads,
  });
  const latestMovement = resolvedLinks[0]?.note || resolvedLinks[0]?.excerpt || null;
  const linksByType = groupEditionLinksByType(resolvedLinks);

  const typeSections = [
    { type: "radar", title: "Radar" },
    { type: "campaign", title: "Campanhas" },
    { type: "impact", title: "Impactos" },
    { type: "pattern", title: "Padrões" },
    { type: "dossier", title: "Dossiês" },
    { type: "editorial", title: "Pautas" },
    { type: "memory", title: "Memória" },
    { type: "archive", title: "Acervo" },
    { type: "collection", title: "Coleções" },
    { type: "territory", title: "Territórios" },
    { type: "actor", title: "Atores" },
    { type: "hub", title: "Eixos" },
    { type: "page", title: "Páginas" },
    { type: "external", title: "Externos" },
  ] as const;

  return (
    <Container className="intro-grid editions-page">
      <section className="hero hero--split editions-hero">
        <div className="hero__copy">
          <p className="eyebrow">edição pública</p>
          <h1 className="hero__title">{edition.title}</h1>
          <p className="hero__lead">{edition.excerpt || edition.description}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getEditionStatusLabel(edition.status)}</span>
            <span className="home-hero__signal">{getEditionTypeLabel(edition.edition_type)}</span>
            <span className="home-hero__signal">caderno vivo</span>
          </div>
          <div className="hero__actions">
            <Link href="#edicao-viva" className="button">
              Ver síntese
            </Link>
            <Link href="#edicao-relacionada" className="button-secondary">
              Ver vínculos
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">estado público</p>
          <h2 className={getEditionStatusTone(edition.status)}>{getEditionStatusLabel(edition.status)}</h2>
          <p>{edition.description}</p>
          {latestMovement ? (
            <article className="support-box">
              <p className="eyebrow">último fio</p>
              <p>{latestMovement}</p>
            </article>
          ) : null}
          <div className="stack-actions">
            <Link href="/agora" className="button-secondary">
              Ver radar
            </Link>
            <Link href="/participe" className="button-secondary">
              Participar
            </Link>
          </div>
        </article>
      </section>

      <section className="section" id="edicao-viva">
        <div className="grid-2">
          <div>
            <p className="eyebrow">abertura</p>
            <h2>Por que esta edição existe.</h2>
          </div>
          <p className="section__lead">
            A edição recolhe o que o site inteiro está dizendo agora e transforma isso em uma leitura curta, compartilhável e memorável.
          </p>
        </div>

        <div className="grid-2">
          <article className="card">
            <EditorialCover
              title={edition.title}
              primaryTag={getEditionStatusLabel(edition.status)}
              seriesTitle={edition.period_label || getEditionTypeLabel(edition.edition_type)}
              coverImageUrl={edition.cover_image_url}
              coverVariant={getEditionCoverVariant(edition.edition_type)}
            />
            <div className="meta-row">
              <span className={getEditionStatusTone(edition.status)}>{getEditionStatusLabel(edition.status)}</span>
              <span>{getEditionTypeLabel(edition.edition_type)}</span>
              {edition.period_label ? <span>{edition.period_label}</span> : null}
            </div>
            <p>{edition.description}</p>
          </article>

          <EditionPrimaryPiece
            title={edition.title}
            excerpt={edition.excerpt}
            description={edition.description}
            status={edition.status}
            editionType={edition.edition_type}
            periodLabel={edition.period_label}
            publishedAt={edition.published_at}
            href={`/edicoes/${edition.slug}`}
            linkCount={resolvedLinks.length}
            latestLink={links[0] ?? null}
          />
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que mudou</p>
            <h2>Peças principais do momento.</h2>
          </div>
          <p className="section__lead">A edição não é um bloco de links soltos. Ela distribui a leitura entre tese, evidência, contexto e acompanhamento.</p>
        </div>

        <div className="grid-2">
          {resolvedLinks.slice(0, 4).map((link) => (
            <EditionLinkCard key={link.id} link={link} compact />
          ))}
        </div>
      </section>

      <section className="section" id="edicao-relacionada">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos por tipo</p>
            <h2>Do radar à consequência, passando por memória e arquivo.</h2>
          </div>
          <p className="section__lead">Os blocos abaixo mostram como a edição conversa com o resto do ecossistema sem perder a hierarquia editorial.</p>
        </div>

        <div className="grid-2">
          {typeSections.map((section) => {
            const linksForSection = linksByType[section.type];

            if (!linksForSection?.length) {
              return null;
            }

            return (
              <article className="support-box" key={section.type}>
                <p className="eyebrow">{section.title}</p>
                <div className="stack-cards">
                  {linksForSection.map((link) => (
                    <EditionLinkCard key={link.id} link={link} compact />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos caminhos</p>
            <h2>Continuar em radar, campanhas e método.</h2>
          </div>
          <p className="section__lead">A edição funciona melhor quando leva de volta ao pulso do projeto e à participação pública responsável.</p>
        </div>

        <div className="stack-actions">
          <Link href="/agora" className="button-secondary">
            Ver radar
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver campanhas
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
          </Link>
          <Link href="/padroes" className="button-secondary">
            Ver padrões
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
          <Link href="/participe" className="button-secondary">
            Participar
          </Link>
        </div>
      </section>
    </Container>
  );
}


