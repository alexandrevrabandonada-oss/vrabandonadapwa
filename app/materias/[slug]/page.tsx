import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { getMateria, getMaterias, materiaKind, materiaKindLabel, publishedDate, publishedDateTime } from "@/lib/materias";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getMaterias()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getMateria(slug);
  if (!story) return { title: "Matéria não encontrada", robots: { index: false, follow: false } };
  const image = story.cover?.src || "/materias/" + slug + "/opengraph-image";
  return {
    title: story.title,
    description: story.summary,
    alternates: { canonical: "/materias/" + slug },
    authors: [{ name: story.author }],
    openGraph: {
      type: "article", title: story.title, description: story.summary, url: "/materias/" + slug,
      publishedTime: story.publishedAt, modifiedTime: story.updatedAt || story.publishedAt,
      images: [{ url: image, alt: story.cover?.alt || story.title }],
    },
    twitter: { card: "summary_large_image", title: story.title, description: story.summary, images: [image] },
  };
}

export default async function MateriaPage({ params }: Props) {
  const { slug } = await params;
  const story = await getMateria(slug);
  if (!story) notFound();
  const canonical = getSiteUrl() + "/materias/" + slug;
  const schema = {
    "@context": "https://schema.org",
    "@type": materiaKind(story) === "news" ? "NewsArticle" : "Article",
    headline: story.title,
    description: story.summary,
    inLanguage: "pt-BR",
    datePublished: story.publishedAt,
    dateModified: story.updatedAt || story.publishedAt,
    mainEntityOfPage: canonical,
    url: canonical,
    image: [getSiteUrl() + (story.cover?.src || "/materias/" + slug + "/opengraph-image")],
    author: { "@type": "Organization", name: story.author },
    publisher: { "@type": "Organization", name: "VR Abandonada", url: getSiteUrl() },
    about: { "@type": "Place", name: "Volta Redonda, Rio de Janeiro, Brasil" },
    citation: story.sources.filter((s) => /^https?:\/\//.test(s.url)).map((s) => s.url),
  };
  const shareUrl = "https://wa.me/?text=" + encodeURIComponent(story.title + "\n" + canonical);
  const related = (await getMaterias()).filter((s) => s.slug !== slug && s.section === story.section).slice(0, 3);
  return (
    <Container className="vr-materia">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <nav className="vr-materia__breadcrumbs" aria-label="Navegação">
        <Link href="/">Início</Link><span>/</span><Link href={materiaKind(story) === "news" ? "/noticias" : "/materias"}>{materiaKind(story) === "news" ? "Notícias" : "Matérias"}</Link><span>/</span><span>{story.section}</span>
      </nav>
      <header className="vr-materia__head">
        <div className="vr-pubs-eyebrow">{materiaKindLabel(story)} · {story.section} / VR ABANDONADA</div>
        <h1>{story.title}</h1>
        <p className="vr-materia__dek">{story.subtitle}</p>
        <div className="vr-materia__byline">Por {story.author} · {publishedDate(story.publishedAt)}
          {story.updatedAt && story.updatedAt !== story.publishedAt ? " · Atualizada em " + publishedDateTime(story.updatedAt) : ""}
        </div>
        {story.investigationStatus === "ongoing" && <p className="vr-materia__status">● Investigação em acompanhamento · Respostas e documentos serão incorporados nesta mesma página</p>}
        {materiaKind(story) === "news" && story.updatedAt && <p className="vr-materia__status">● Notícia atualizada · Novos fatos e documentos são registrados neste endereço</p>}
      </header>
      {story.cover && (
        <figure className="vr-materia__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.cover.src} alt={story.cover.alt} />
          {story.cover.credit && <figcaption>{story.cover.credit}</figcaption>}
        </figure>
      )}
      <div className="vr-materia__body-layout">
        <article className="vr-materia__body">
          <p className="vr-materia__lead">{story.summary}</p>
          {story.blocks.map((block, idx) => {
            if (block.type === "heading") return <h2 key={idx}>{block.text}</h2>;
            if (block.type === "quote") return <blockquote key={idx}>{block.text}</blockquote>;
            if (block.type === "list") return <ul key={idx}>{(block.items || []).map((item, n) => <li key={n}>{item}</li>)}</ul>;
            return <p key={idx}>{block.text}</p>;
          })}
          {story.updates && story.updates.length > 0 && (
            <section className="vr-materia__timeline" aria-label="Histórico de atualizações da publicação">
              <h2>{materiaKind(story) === "news" ? "Atualizações desta notícia" : "Histórico desta investigação"}</h2>
              <ol>{story.updates.map((entry, index) => <li key={index}>
                <time dateTime={entry.date}>{publishedDateTime(entry.date)}</time>
                <strong>{entry.label}</strong><p>{entry.text}</p>
              </li>)}</ol>
            </section>
          )}
          {story.correctionNote && (
            <section className="vr-materia__correction" aria-label="Correção ou atualização">
              <h2>Nota de atualização e correção</h2><p>{story.correctionNote}</p>
            </section>
          )}
          <section className="vr-materia__sources">
            <h2>Fontes e documentos</h2>
            {story.sources.length ? <ol>{story.sources.map((source, i) => <li key={i}>
              {/^https?:\/\//.test(source.url) ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a> : source.label}
              {source.consultedAt ? <span> · consulta: {source.consultedAt}</span> : null}
            </li>)}</ol> : <p>Este texto não possui links de fontes públicas anexados. Confira seu contexto e a publicação original.</p>}
            {story.instagramUrl && <p>Veja também: <a href={story.instagramUrl} target="_blank" rel="noopener noreferrer">publicação no Instagram</a>.</p>}
          </section>
        </article>
        <aside className="vr-materia__aside">
          <div className="vr-materia__share">
            <span>INFORMAÇÃO QUE CIRCULA</span>
            <h2>Compartilhe com contexto.</h2>
            <p>O link permanente permite consultar o texto e as fontes, mesmo fora das redes sociais.</p>
            <a className="button" href={shareUrl} target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp ↗</a>
            <Link className="button-secondary" href="/materias">Ler outras matérias</Link>
          </div>
        </aside>
      </div>
      {related.length > 0 && <section className="vr-materia__related">
        <h2>Mais sobre {story.section}</h2>
        {related.map((s) => <Link key={s.slug} href={"/materias/" + s.slug}>{s.title}<span aria-hidden="true">↗</span></Link>)}
      </section>}
    </Container>
  );
}
