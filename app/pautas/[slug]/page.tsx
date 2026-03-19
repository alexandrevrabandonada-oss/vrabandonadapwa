/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { getPublishedEditorialBySlug, getPublishedEditorialItems } from "@/lib/editorial/queries";
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
  };
}

export default async function PautaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedEditorialBySlug(slug);

  if (!item) {
    notFound();
  }

  const paragraphs = item.body.split(/\n\n+/).filter(Boolean);

  return (
    <Container className="intro-grid">
      <section className="hero">
        <p className="eyebrow">pauta publicada</p>
        <h1 className="hero__title">{item.title}</h1>
        <p className="hero__lead">{item.excerpt}</p>
        <div className="meta-row">
          <span>{item.category}</span>
          <span>{item.neighborhood || "Volta Redonda"}</span>
          {item.featured ? <span>Destaque</span> : null}
        </div>
      </section>

      <article className="section editorial-article">
        <div className="editorial-article__meta">
          <p className="eyebrow">arquivo vivo</p>
          <p>
            {item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "sem data"}
          </p>
          <p>{editorialStatusLabels[item.editorial_status as EditorialStatus] ?? item.editorial_status}</p>
        </div>

        {item.cover_image_url ? <img className="editorial-article__cover" src={item.cover_image_url} alt={item.title} /> : null}

        <div className="editorial-article__body">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="support-box">
          <h3>Nota editorial</h3>
          <p>{item.source_visibility_note || "Conteúdo sanitizado antes da publicação."}</p>
        </div>

        <div className="stack-actions">
          <Link href="/pautas" className="button-secondary">
            Voltar às pautas
          </Link>
        </div>
      </article>
    </Container>
  );
}
