import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedDossierLinks, getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";

export const metadata: Metadata = {
  title: "Dossiês",
  description: "Linhas de investigação viva que conectam pauta, memória e acervo.",
  openGraph: {
    title: "Dossiês | VR Abandonada",
    description: "Linhas de investigação viva que conectam pauta, memória e acervo.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossiês | VR Abandonada",
    description: "Linhas de investigação viva que conectam pauta, memória e acervo.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function DossiersPage() {
  const dossiers = await getPublishedDossiers();
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const seriesCards = getEditorialSeriesCards(editorialItems);
  const dossierLinkPairs = await Promise.all(dossiers.map(async (dossier) => [dossier.id, await getPublishedDossierLinks(dossier.id)] as const));
  const linkCountByDossierId = new Map(dossierLinkPairs.map(([id, links]) => [id, links.length]));

  const featured = dossiers.find((dossier) => dossier.featured) ?? dossiers[0] ?? null;
  const secondary = featured ? dossiers.filter((dossier) => dossier.id !== featured.id) : dossiers;
  const featuredSeries = seriesCards.slice(0, 3);

  return (
    <Container className="intro-grid dossier-page">
      <section className="hero hero--split dossier-hero">
        <div className="hero__copy">
          <p className="eyebrow">dossiês vivos</p>
          <h1 className="hero__title">Linhas de investigação em andamento.</h1>
          <p className="hero__lead">
            O VR Abandonada reúne pauta, memória, acervo e coleção em recortes investigativos que mostram o que a cidade tenta esconder.
          </p>
          <div className="hero__actions">
            <Link href="/pautas" className="button">
              Ver pautas
            </Link>
            <Link href="/memoria" className="button-secondary">
              Entrar na memória
            </Link>
            <Link href="/acervo" className="button-secondary">
              Abrir acervo
            </Link>
          </div>
        </div>

        {featured ? (
          <article className="support-box dossier-highlight">
            <p className="eyebrow">em destaque</p>
            <EditorialCover
              title={featured.title}
              primaryTag="Dossiê"
              seriesTitle={featured.title}
              coverImageUrl={featured.cover_image_url}
              coverVariant={featured.featured ? "ember" : "concrete"}
            />
            <p>{featured.excerpt || featured.description}</p>
            <Link href={`/dossies/${featured.slug}`} className="button-secondary">
              Abrir dossiê
            </Link>
          </article>
        ) : null}
      </section>

      <section className="section dossier-intro">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que é um dossiê</p>
            <h2>Uma linha de leitura, não uma página de links.</h2>
          </div>
          <p className="section__lead">
            Cada dossiê costura uma pergunta, um território e um período para juntar documentos, memória e pauta numa mesma investigação pública.
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Pergunta</h3>
            <p>O ponto de partida da investigação que organiza a leitura pública.</p>
          </article>
          <article className="card">
            <h3>Prova</h3>
            <p>Arquivos, documentos e materiais-base que sustentam o caso.</p>
          </article>
          <article className="card">
            <h3>Desdobramento</h3>
            <p>Memória, pauta e coleção voltam a puxar o fio do mesmo conflito.</p>
          </article>
        </div>
      </section>

      <section className="section dossier-grid-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">investigações em curso</p>
            <h2>Peças que já formam uma unidade de entendimento.</h2>
          </div>
          <p className="section__lead">
            Os dossiês abaixo são o mapa de trabalho do projeto. Cada um combina território, contexto e leitura documental.
          </p>
        </div>

        <div className="grid-2">
          {secondary.length ? (
            secondary.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                href={`/dossies/${dossier.slug}`}
                itemCount={linkCountByDossierId.get(dossier.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem dossiês públicos</h3>
              <p>Crie o primeiro recorte investigativo no painel interno para abrir a camada pública.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section dossier-context">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o sistema inteiro</p>
            <h2>Pauta, memória, acervo e coleção no mesmo quadro.</h2>
          </div>
          <p className="section__lead">
            Os dossiês usam apenas peças já sanitizadas. Isso permite costurar o caso sem vazar nota interna nem fluxo operacional.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>{editorialItems.length} pautas</h3>
            <p>Leituras editoriais que entram no recorte investigativo.</p>
          </article>
          <article className="card">
            <h3>{memoryItems.length} memórias</h3>
            <p>Contexto histórico e territorial para não congelar o conflito.</p>
          </article>
          <article className="card">
            <h3>{archiveAssets.length} documentos</h3>
            <p>Material-base que sustenta a prova documental.</p>
          </article>
          <article className="card">
            <h3>{archiveCollections.length} coleções</h3>
            <p>Recortes curatoriais que ajudam a organizar o arquivo.</p>
          </article>
        </div>
      </section>

      <section className="section dossier-series-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">séries conectadas</p>
            <h2>Linhas que atravessam os dossiês.</h2>
          </div>
          <p className="section__lead">
            As séries dão continuidade ao caso e ajudam a entender a investigação como percurso, não como peça isolada.
          </p>
        </div>

        <div className="grid-3">
          {featuredSeries.map((series) => (
            <article className="support-box" key={series.slug}>
              <EditorialCover
                title={series.title}
                primaryTag="Série"
                seriesTitle={series.title}
                coverImageUrl={series.coverImageUrl ?? null}
                coverVariant={series.coverVariant}
              />
              <p className="eyebrow">{series.axis}</p>
              <h3>{series.title}</h3>
              <p>{series.description}</p>
              <Link href={`/series/${series.slug}`} className="button-secondary">
                Ver série
              </Link>
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
}
