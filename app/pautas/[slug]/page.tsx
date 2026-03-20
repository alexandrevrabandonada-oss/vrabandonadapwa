/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { SharePanel } from "@/components/share-panel";
import { Container } from "@/components/container";
import { getPublishedEditorialBySlug, getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialOpenGraphImagePath } from "@/lib/editorial/share";
import { getEditorialSeriesByItem } from "@/lib/editorial/taxonomy";
import { getNextEditorialItem, getRelatedEditorialItems } from "@/lib/editorial/navigation";
import { editorialStatusLabels, type EditorialStatus } from "@/lib/editorial/types";

export async function generateStaticParams() {
  const items = await getPublishedEditorialItems();
  return items.map((item) => ({ slug: item.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedEditorialBySlug(slug);

  if (!item) {
    return {
      title: "Pauta",
      description: "Pauta editorial do VR Abandonada.",
    };
  }

  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      type: "article",
      images: [item.cover_image_url || getEditorialOpenGraphImagePath(item.slug)],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt,
      images: [item.cover_image_url || getEditorialOpenGraphImagePath(item.slug)],
    },
  };
}

export default async function PautaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedEditorialBySlug(slug);

  if (!item) {
    notFound();
  }

  const items = await getPublishedEditorialItems();
  const relatedItems = getRelatedEditorialItems(items, item, 3);
  const nextItem = getNextEditorialItem(items, item);
  const series = getEditorialSeriesByItem(item);
  const paragraphs = item.body.split(/\n\n+/).filter(Boolean);

  return (
    <Container className="intro-grid">
      <section className="section editorial-detail-hero">
        <div className="editorial-hero__copy">
          <p className="eyebrow">pauta publicada</p>
          <h1>{item.title}</h1>
          <p className="hero__lead">{item.excerpt}</p>
          <div className="meta-row">
            <span>{series?.title || item.series_title || item.category}</span>
            <span>{item.primary_tag || item.category}</span>
            <span>{item.reading_time} min</span>
            <span>{item.neighborhood || "Volta Redonda"}</span>
            <span>
              {item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "sem data"}
            </span>
          </div>
          <div className="tag-row">
            {item.secondary_tags.slice(0, 4).map((tag) => (
              <span className="tag-row__item" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
          {series ? (
            <div className="stack-actions">
              <Link href={`/series/${series.slug}`} className="button-secondary">
                Ver série
              </Link>
            </div>
          ) : null}
        </div>
        <EditorialCover
          title={item.title}
          primaryTag={item.primary_tag ?? item.category}
          seriesTitle={series?.title || item.series_title}
          coverImageUrl={item.cover_image_url}
          coverVariant={item.cover_variant}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">compartilhar</p>
            <h2>Uma pauta também precisa de circulação curta.</h2>
          </div>
          <p className="section__lead">Leve a leitura para fora do site sem perder o fio editorial e o retorno ao arquivo.</p>
        </div>

        <SharePanel
          title={item.title}
          summary={item.excerpt || item.title}
          caption={`Leia e compartilhe: ${item.title}. ${item.excerpt || ""}`.trim()}
          shareHref={`/compartilhar/pauta/${item.slug}`}
          contentHref={`/pautas/${item.slug}`}
          titleLabel="compartilhe esta pauta"
        />
      </section>

      <article className="section editorial-article">
        <div className="editorial-article__meta">
          <p className="eyebrow">arquivo vivo</p>
          <p>{editorialStatusLabels[item.editorial_status as EditorialStatus] ?? item.editorial_status}</p>
        </div>

        <div className="editorial-article__body">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">relacionados</p>
            <h2>Leituras que puxam o mesmo fio.</h2>
          </div>
          <p className="section__lead">
            A navegação abaixo cruza série, tag principal e categoria para evitar leitura isolada.
          </p>
        </div>

        <div className="grid-3">
          {relatedItems.length ? (
            relatedItems.map((related) => (
              <EditorialCard key={related.id} item={related} href={`/pautas/${related.slug}`} compact />
            ))
          ) : (
            <div className="support-box">
              <p>Sem relacionados suficientes nesta linha. O arquivo cresce conforme as publicações entram.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próxima leitura</p>
            <h2>Continue o arquivo.</h2>
          </div>
          <p className="section__lead">
            O próximo item segue a ordem editorial e ajuda a manter a navegação viva.
          </p>
        </div>

        {nextItem ? (
          <EditorialCard item={nextItem} href={`/pautas/${nextItem.slug}`} compact ctaLabel="Próxima leitura" />
        ) : (
          <div className="support-box">
            <p>Sem próxima pauta disponível ainda.</p>
          </div>
        )}
      </section>

      <section className="section">
        <Link href="/pautas" className="button-secondary">
          Voltar às pautas
        </Link>
      </section>
    </Container>
  );
}



