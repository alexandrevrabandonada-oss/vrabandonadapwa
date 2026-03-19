import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { Container } from "@/components/container";
import { getPublishedEditorialItemsBySeries } from "@/lib/editorial/queries";
import { getSeriesOpenGraphImagePath } from "@/lib/editorial/share";
import { editorialSeriesCatalog, getEditorialSeriesBySlug } from "@/lib/editorial/taxonomy";

export async function generateStaticParams() {
  return editorialSeriesCatalog.map((series) => ({ slug: series.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = getEditorialSeriesBySlug(slug);

  if (!series) {
    return {
      title: "Série",
      description: "Série editorial do VR Abandonada.",
    };
  }

  return {
    title: series.title,
    description: series.description,
    openGraph: {
      title: series.title,
      description: series.description,
      type: "website",
      images: [series.coverImageUrl ?? getSeriesOpenGraphImagePath(series.slug)],
    },
    twitter: {
      card: "summary_large_image",
      title: series.title,
      description: series.description,
      images: [series.coverImageUrl ?? getSeriesOpenGraphImagePath(series.slug)],
    },
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = getEditorialSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const items = await getPublishedEditorialItemsBySeries(slug);

  return (
    <Container className="intro-grid">
      <section className="section editorial-hero">
        <div className="editorial-hero__copy">
          <p className="eyebrow">série editorial</p>
          <h1>{series.title}</h1>
          <p className="hero__lead">{series.description}</p>
          <div className="meta-row">
            <span>{series.axis}</span>
            <span>{items.length} pauta{items.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <EditorialCover
          title={series.title}
          primaryTag="Série"
          seriesTitle={series.title}
          coverImageUrl={series.coverImageUrl ?? null}
          coverVariant={series.coverVariant}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">leituras</p>
            <h2>Itens desta linha editorial.</h2>
          </div>
          <p className="section__lead">
            A série organiza o arquivo para que cada pauta faça parte de uma investigação contínua.
          </p>
        </div>

        <div className="grid-3">
          {items.length ? (
            items.map((item) => <EditorialCard key={item.id} item={item} href={`/pautas/${item.slug}`} compact />)
          ) : (
            <div className="support-box">
              <h3>Sem pautas nesta série ainda</h3>
              <p>Quando itens reais forem publicados, eles entram aqui automaticamente.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">navegação</p>
            <h2>Voltar ao arquivo.</h2>
          </div>
          <p className="section__lead">
            A série existe para puxar o leitor de volta para a pauta completa e para o conjunto da investigação.
          </p>
        </div>

        <Link href="/pautas" className="button-secondary">
          Ver todas as pautas
        </Link>
      </section>
    </Container>
  );
}
