import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { getInstagramPost, getInstagramPosts, titleFor, summaryFor, topicsFor, formattedDate } from "@/lib/instagram/posts";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getInstagramPosts().map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = getInstagramPost(id);
  if (!post) return { title: "Publicação não encontrada", robots: { index: false, follow: false } };
  const title = titleFor(post);
  const description = summaryFor(post);
  return {
    title,
    description,
    alternates: { canonical: "/publicacoes/" + id },
    openGraph: {
      type: "article",
      url: "/publicacoes/" + id,
      title,
      description,
      publishedTime: post.published_at,
      images: post.local_image ? [{ url: post.local_image, alt: title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: post.local_image ? [post.local_image] : undefined },
  };
}

export default async function PublicacaoPage({ params }: Props) {
  const { id } = await params;
  const post = getInstagramPost(id);
  if (!post) notFound();
  const title = titleFor(post);
  const url = getSiteUrl() + "/publicacoes/" + post.id;
  const schema = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: title,
    articleBody: post.caption,
    datePublished: post.published_at,
    dateModified: post.published_at,
    url,
    mainEntityOfPage: url,
    image: post.local_image ? getSiteUrl() + post.local_image : undefined,
    author: { "@type": "Organization", name: "VR Abandonada", url: getSiteUrl() },
    publisher: { "@type": "Organization", name: "VR Abandonada", url: getSiteUrl() },
    isBasedOn: post.permalink,
  };
  const wa = "https://wa.me/?text=" + encodeURIComponent(title + "\n" + url);
  const other = getInstagramPosts().filter((p) => p.id !== id && topicsFor(p).some((topic) => topicsFor(post).includes(topic))).slice(0, 3);

  return (
    <Container className="ig-story">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <nav className="ig-breadcrumb" aria-label="Trilha de navegação"><Link href="/">Início</Link><span>/</span><Link href="/noticias">Notícias</Link><span>/</span><span>Arquivo</span></nav>
      <header className="ig-story__heading">
        <div className="ig-eyebrow">VR ABANDONADA · {post.media_type === "VIDEO" ? "REEL" : "PUBLICAÇÃO"} · {formattedDate(post)}</div>
        <h1>{title}</h1>
        <p>Publicação originalmente divulgada no Instagram e preservada aqui com endereço permanente e texto pesquisável.</p>
      </header>
      <div className="ig-story__columns">
        <div>
          <figure className="ig-story__visual">
            {post.local_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.local_image} alt={"Imagem de capa da publicação: " + title} />
            ) : <div className="ig-story__placeholder"><strong>VR<br/>ABANDONADA</strong><span>ARQUIVO DE PUBLICAÇÕES</span></div>}
            <figcaption>{post.media_type === "VIDEO" ? "Capa do vídeo publicado no Instagram" : "Imagem da publicação original"} — <a href={post.permalink} target="_blank" rel="noopener noreferrer">ver original</a></figcaption>
          </figure>
          <div className="ig-story__body">
            <p className="ig-story__date">Publicado em {formattedDate(post)}</p>
            <div className="ig-story__transcription">{post.caption}</div>
            <div className="ig-story__source">Fonte desta reprodução: <a href={post.permalink} target="_blank" rel="noopener noreferrer">publicação original no Instagram</a>. Atualizações e correções editoriais devem ser verificadas nas matérias completas vinculadas ao caso.</div>
          </div>
        </div>
        <aside className="ig-story__aside">
          <div className="ig-action-panel">
            <span>ESPALHE A INFORMAÇÃO</span><h2>Essa história importa?</h2>
            <a className="button" href={wa} target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp</a>
            <a className="button-secondary" href={post.permalink} target="_blank" rel="noopener noreferrer">Ver post ou vídeo original</a>
            <Link href="/noticias">Ler notícias no site</Link>
          </div>
          <div className="ig-action-panel ig-action-panel--comun">
            <span>DO INFORMAÇÃO À PARTICIPAÇÃO</span><h2>Também viu um problema?</h2>
            <p>O COMUN é o espaço de relatos, memória e participação coletiva. Aqui mantemos a comunicação pública.</p>
            <a href="https://comunsocial.online" target="_blank" rel="noopener noreferrer">Acessar o COMUN ↗</a>
          </div>
        </aside>
      </div>
      {other.length > 0 && <section className="ig-related"><h2>Continuar acompanhando</h2><div className="ig-related__list">{other.map((p) => <Link key={p.id} href={"/publicacoes/" + p.id}>{titleFor(p)} <span>↗</span></Link>)}</div></section>}
    </Container>
  );
}
