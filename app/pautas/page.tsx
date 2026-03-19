import type { Metadata } from "next";
import Link from "next/link";

import { EditorialCover } from "@/components/editorial-cover";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialHero } from "@/components/editorial-hero";
import { Container } from "@/components/container";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pautas",
  description: "Agenda pública e arquivo editorial do VR Abandonada.",
};

export default async function PautasPage() {
  const items = await getPublishedEditorialItems();
  const featuredItem = items[0];
  const secondaryItems = items.slice(1);
  const seriesCards = getEditorialSeriesCards(items);

  return (
    <Container className="intro-grid">
      {featuredItem ? <EditorialHero item={featuredItem} /> : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">séries</p>
            <h2>Linhas de investigação em curso.</h2>
          </div>
          <p className="section__lead">
            A navegação pública agora parte de séries editoriais, não só de uma sequência cronológica.
          </p>
        </div>

        <div className="series-grid">
          {seriesCards.map((series) => (
            <article className="series-card" key={series.slug}>
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

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">pautas recentes</p>
            <h2>Leituras para continuar a investigação.</h2>
          </div>
          <p className="section__lead">
            Se a pauta não for destaque, ela entra aqui como parte de uma linha maior, com tag, série e tempo de leitura.
          </p>
        </div>

        <div className="grid-3">
          {secondaryItems.map((item) => (
            <EditorialCard key={item.id} item={item} href={`/pautas/${item.slug}`} compact />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">eixos</p>
            <h2>Linhas editoriais do arquivo.</h2>
          </div>
          <p className="section__lead">
            Os eixos seguem como organização estrutural do site, sem virar feed aleatório.
          </p>
        </div>

        <div className="grid-4">
          {site.editorialAxes.map((item) => (
            <article className="card" key={item.title}>
              <span className="pill">Eixo</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
}
