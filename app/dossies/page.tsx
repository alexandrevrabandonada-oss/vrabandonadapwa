import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedDossierLinks, getPublishedDossierUpdatesByDossierIds, getPublishedDossiers } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";

export const metadata: Metadata = {
  title: "Dossiês",
  description: "Linhas de investigação viva do VR Abandonada.",
  openGraph: {
    title: "Dossiês | VR Abandonada",
    description: "Linhas de investigação viva do VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function DossiersPage() {
  const dossiers = await getPublishedDossiers();
  const dossierIds = dossiers.map((dossier) => dossier.id);
  const updatesByDossierId = await getPublishedDossierUpdatesByDossierIds(dossierIds);
  const linksById = await Promise.all(dossiers.map(async (dossier) => [dossier.id, await getPublishedDossierLinks(dossier.id)] as const));
  const linkCountById = new Map(linksById.map(([id, links]) => [id, links.length]));
  const featuredDossier = dossiers[0] ?? null;
  const featuredUpdate = featuredDossier ? updatesByDossierId.get(featuredDossier.id)?.[0] ?? null : null;
  const editorialItems = await getPublishedEditorialItems();
  const featuredSeries = getEditorialSeriesCards(editorialItems).slice(0, 3);
  const grouped = {
    in_progress: dossiers.filter((dossier) => dossier.status === "in_progress"),
    monitoring: dossiers.filter((dossier) => dossier.status === "monitoring"),
    concluded: dossiers.filter((dossier) => dossier.status === "concluded"),
    archived: dossiers.filter((dossier) => dossier.status === "archived"),
  };

  return (
    <Container className="intro-grid dossier-archive-page">
      <section className="hero hero--split landing-hero">
        <div className="hero__copy landing-hero__copy">
          <p className="eyebrow">dossiês vivos</p>
          <h1 className="hero__title">Investigações em andamento, monitoramento e arquivo.</h1>
          <p className="hero__lead">
            Cada linha reúne prova, contexto, memória e desdobramento. Aqui o leitor entra por um caso e acompanha a investigação em sequência.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">última atualização visível</span>
            <span className="home-hero__signal">documento + contexto</span>
            <span className="home-hero__signal">acompanhamento público</span>
          </div>
          <div className="hero__actions">
            <Link href="/envie" className="button">
              Enviar pista
            </Link>
            <Link href="/acervo" className="button-secondary">
              Abrir acervo
            </Link>
          </div>
        </div>

        <EditorialCover
          title={featuredDossier?.title || "Dossiês"}
          primaryTag={featuredDossier ? getDossierStatusLabel(featuredDossier.status) : "arquivo vivo"}
          seriesTitle={featuredUpdate?.title || featuredDossier?.lead_question || "Linha de investigação"}
          coverImageUrl={featuredDossier?.cover_image_url || "/editorial/covers/arquivo-inicial.svg"}
          coverVariant={featuredDossier?.featured ? "ember" : "concrete"}
        />
      </section>

      {featuredDossier ? (
        <section className="section home-dossier-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">investigação em destaque</p>
              <h2>{featuredDossier.title}</h2>
            </div>
            <p className="section__lead">
              {featuredUpdate ? `Última movimentação: ${featuredUpdate.title}` : featuredDossier.excerpt || featuredDossier.description}
            </p>
          </div>

          <div className="grid-2">
            <DossierCard dossier={featuredDossier} href={`/dossies/${featuredDossier.slug}`} itemCount={linkCountById.get(featuredDossier.id) ?? 0} latestUpdate={featuredUpdate} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>Não é uma página solta.</h3>
              <p>
                O dossiê costura o caso, aponta a pergunta central e distribui a leitura entre pauta, memória, acervo, coleção e atualização pública.
              </p>
              <div className="stack-actions">
                <Link href={`/dossies/${featuredDossier.slug}`} className="button">
                  Abrir dossiê
                </Link>
                <Link href="/envie" className="button-secondary">
                  Enviar pista
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section dossier-status-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhamento</p>
            <h2>O estado narrativo de cada investigação.</h2>
          </div>
          <p className="section__lead">Em curso, monitoramento, concluído ou arquivado. A leitura pública acompanha o ritmo real do caso.</p>
        </div>

        <div className="grid-2">
          <article className="card">
            <h3>Em curso</h3>
            <p>{grouped.in_progress.length} dossiê(s) em andamento.</p>
          </article>
          <article className="card">
            <h3>Monitoramento</h3>
            <p>{grouped.monitoring.length} dossiê(s) em observação contínua.</p>
          </article>
          <article className="card">
            <h3>Concluídos</h3>
            <p>{grouped.concluded.length} dossiê(s) com leitura fechada.</p>
          </article>
          <article className="card">
            <h3>Arquivados</h3>
            <p>{grouped.archived.length} dossiê(s) guardados como lastro.</p>
          </article>
        </div>
      </section>

      {featuredSeries.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">séries em evidência</p>
              <h2>Linhas que atravessam as investigações.</h2>
            </div>
            <p className="section__lead">Quando a série aparece junto do dossiê, a investigação deixa de soar isolada e passa a mostrar continuidade.</p>
          </div>

          <div className="series-grid landing-series-grid">
            {featuredSeries.map((series) => (
              <article className="series-card landing-series-card" key={series.slug}>
                <EditorialCover
                  title={series.title}
                  primaryTag="Série"
                  seriesTitle={series.title}
                  coverImageUrl={series.coverImageUrl ?? null}
                  coverVariant={series.coverVariant}
                />
                <div className="series-card__body">
                  <p className="eyebrow">{series.axis}</p>
                  <h3>{series.title}</h3>
                  <p>{series.description}</p>
                  <p className="series-card__count">
                    {series.items.length} pauta{series.items.length === 1 ? "" : "s"}
                  </p>
                  <Link href={`/series/${series.slug}`} className="button-secondary">
                    Ver série
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Dossiês registrados</p>
            <h2>Cada linha abaixo mostra o caso e sua última movimentação.</h2>
          </div>
          <p className="section__lead">A grade organiza a leitura por status, mas cada peça mantém o vínculo com a atualização mais recente.</p>
        </div>

        {Object.entries(grouped).map(([status, items]) => (
          <div className="section" key={status}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{getDossierStatusLabel(status)}</p>
                <h3>{status === "in_progress" ? "Em curso" : status === "monitoring" ? "Monitoramento" : status === "concluded" ? "Concluídos" : "Arquivados"}</h3>
              </div>
              <p className="section__lead">{items.length} linha(s) nesta faixa editorial.</p>
            </div>
            <div className="grid-2">
              {items.length ? (
                items.map((dossier) => (
                  <DossierCard
                    key={dossier.id}
                    dossier={dossier}
                    href={`/dossies/${dossier.slug}`}
                    itemCount={linkCountById.get(dossier.id) ?? 0}
                    latestUpdate={updatesByDossierId.get(dossier.id)?.[0] ?? null}
                  />
                ))
              ) : (
                <div className="support-box">
                  <h3>Sem dossiês aqui</h3>
                  <p>Esse estado ainda não recebeu publicação pública.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </Container>
  );
}
