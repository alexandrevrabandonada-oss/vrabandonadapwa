import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedDossierLinks, getPublishedDossiers } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
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

const statusOrder = ["in_progress", "monitoring", "concluded", "archived"] as const;

export default async function DossiersPage() {
  const dossiers = await getPublishedDossiers();
  const editorialItems = await getPublishedEditorialItems();
  const memoryItems = await getPublishedMemoryItems();
  const archiveAssets = await getPublishedArchiveAssets();
  const archiveCollections = await getPublishedArchiveCollections();
  const seriesCards = getEditorialSeriesCards(editorialItems);

  const dossierLinkPairs = await Promise.all(dossiers.map(async (dossier) => [dossier.id, await getPublishedDossierLinks(dossier.id)] as const));
  const linkCountByDossierId = new Map(dossierLinkPairs.map(([id, links]) => [id, links.length]));
  const featured = dossiers.find((dossier) => dossier.featured && dossier.status !== "archived") ?? dossiers[0] ?? null;
  const sections = statusOrder.map((status) => ({
    status,
    dossiers: dossiers.filter((dossier) => dossier.status === status),
  }));
  const featuredSeries = seriesCards.slice(0, 3);

  return (
    <Container className="intro-grid dossier-page">
      <section className="hero hero--split dossier-hero">
        <div className="hero__copy">
          <p className="eyebrow">dossiês vivos</p>
          <h1 className="hero__title">Linhas de investigação em andamento.</h1>
          <p className="hero__lead">
            O VR Abandonada reúne pauta, memória, acervo e coleção em recortes investigativos que mostram como o caso se desenrola no tempo.
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
              primaryTag={getDossierStatusLabel(featured.status)}
              seriesTitle={featured.lead_question || featured.period_label || featured.title}
              coverImageUrl={featured.cover_image_url}
              coverVariant={featured.featured ? "ember" : "concrete"}
            />
            <p>{featured.excerpt || featured.description}</p>
            <div className="meta-row">
              <span>{getDossierStatusLabel(featured.status)}</span>
              {featured.period_label ? <span>{featured.period_label}</span> : null}
              {featured.territory_label ? <span>{featured.territory_label}</span> : null}
            </div>
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

      <section className="section dossier-status-overview">
        <div className="grid-2">
          <div>
            <p className="eyebrow">status narrativo</p>
            <h2>O estágio da investigação aparece na navegação.</h2>
          </div>
          <p className="section__lead">
            A leitura pública agora diferencia o que está em curso, em monitoramento, concluído ou arquivado.
          </p>
        </div>

        <div className="grid-4">
          {sections.map((section) => (
            <article className="card" key={section.status}>
              <h3>{getDossierStatusLabel(section.status)}</h3>
              <p>{section.dossiers.length} dossiê{section.dossiers.length === 1 ? "" : "s"}</p>
            </article>
          ))}
        </div>
      </section>

      {sections.map((section) =>
        section.dossiers.length ? (
          <section className="section dossier-grid-section" key={section.status}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{getDossierStatusLabel(section.status)}</p>
                <h2>{getDossierStatusLabel(section.status)}</h2>
              </div>
              <p className="section__lead">
                {section.status === "in_progress"
                  ? "Casos em andamento com hipótese aberta e leitura em construção."
                  : section.status === "monitoring"
                    ? "Investigações em observação, com atualização de contexto e prova."
                    : section.status === "concluded"
                      ? "Casos com percurso editorial fechado ou quase fechado, mas ainda consultáveis."
                      : "Dossiês guardados como referência e memória do percurso investigativo."}
              </p>
            </div>

            <div className="grid-2">
              {section.dossiers.map((dossier) => (
                <DossierCard
                  key={dossier.id}
                  dossier={dossier}
                  href={`/dossies/${dossier.slug}`}
                  itemCount={linkCountByDossierId.get(dossier.id) ?? 0}
                />
              ))}
            </div>
          </section>
        ) : null,
      )}

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

