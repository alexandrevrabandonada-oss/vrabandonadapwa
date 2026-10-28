import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getMaterias, materiaKind, publishedDate } from "@/lib/materias";

import "./noticias.css";

export const metadata: Metadata = {
  title: "Notícias de Volta Redonda | VR Abandonada",
  description: "Notícias locais, acontecimentos e atualizações verificadas de Volta Redonda. Informação com contexto, fontes e endereço permanente, além do Instagram.",
  alternates: { canonical: "/noticias" },
  openGraph: {
    title: "Notícias de Volta Redonda | VR Abandonada",
    description: "Notícias e atualizações verificadas de Volta Redonda, com fontes e arquivo permanente.",
    type: "website", url: "/noticias",
  },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function NoticiasPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 90);
  const all = await getMaterias();
  const news = all.filter((article) => materiaKind(article) === "news");
  const filtered = term
    ? news.filter((article) =>
        [article.title, article.summary, article.section, ...article.blocks.map((block) => block.text)]
          .join(" ").toLocaleLowerCase("pt-BR").includes(term.toLocaleLowerCase("pt-BR")))
    : news;
  const ongoing = all.filter((article) => materiaKind(article) === "investigation" && article.investigationStatus === "ongoing").slice(0, 2);

  return (
    <Container className="vr-news">
      <header className="vr-news__header">
        <span className="vr2-eyebrow">VR ABANDONADA · JORNALISMO LOCAL</span>
        <h1>Notícias<span>.</span></h1>
        <p>O que acontece em Volta Redonda merece contexto e continuidade — não apenas uma legenda que desaparece no feed.</p>
        <div className="vr-news__header-links">
          <Link href="/agora">Últimas atualizações ↗</Link>
          <Link href="/dossies">Investigações ↗</Link>
          <Link href="/materias">Acervo completo ↗</Link>
        </div>
      </header>

      <form className="vr-news__search" role="search" action="/noticias">
        <label htmlFor="noticias-busca">Pesquisar notícias</label>
        <div>
          <input id="noticias-busca" name="q" type="search" maxLength={90} defaultValue={term} placeholder="Bairro, serviço público, CSN, saúde..." />
          <button type="submit">Buscar</button>
        </div>
      </form>

      <section className="vr-news__latest" aria-labelledby="news-list-title">
        <div className="vr-news__section-head">
          <div>
            <span className="vr2-eyebrow">NOTÍCIAS PUBLICADAS NO SITE</span>
            <h2 id="news-list-title">{term ? "Resultados da pesquisa" : "Notícias e acontecimentos"}</h2>
          </div>
          <span className="vr-news__count">{filtered.length} notícia{filtered.length === 1 ? "" : "s"}</span>
        </div>
        {filtered.length ? (
          <div className="vr-news__list">
            {filtered.map((item, index) => (
              <article className={"vr-news__item" + (index === 0 ? " vr-news__item--lead" : "")} key={item.slug}>
                <div className="vr-news__item-meta"><span>NOTÍCIA · {item.section}</span><time dateTime={item.publishedAt}>{publishedDate(item.publishedAt)}</time></div>
                <h3><Link href={"/materias/" + item.slug}>{item.title}</Link></h3>
                <p>{item.summary}</p>
                <Link className="vr-news__read" href={"/materias/" + item.slug}>Ler notícia ↗</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="vr-news__empty">
            <span className="vr2-eyebrow">EDITORIA ABERTA</span>
            <h3>{term ? "Nenhuma notícia corresponde à busca." : "As notícias terão espaço próprio aqui."}</h3>
            <p>{term
              ? "Experimente outro termo ou procure no acervo completo."
              : "A área receberá notícias verificadas, inclusive textos que publicarmos também no Instagram. Não mostramos posts fictícios ou rascunhos como notícias."}</p>
            <div><Link href={term ? "/noticias" : "/agora"}>{term ? "Ver todas as notícias ↗" : "Ver últimas atualizações ↗"}</Link>
              <Link href="/materias">Explorar matérias ↗</Link></div>
          </div>
        )}
      </section>

      {ongoing.length > 0 && !term && (
        <aside className="vr-news__ongoing">
          <div className="vr-news__section-head">
            <div><span className="vr2-eyebrow">O ASSUNTO CONTINUA</span><h2>Investigações em acompanhamento</h2></div>
            <Link href="/dossies">Ver investigações ↗</Link>
          </div>
          {ongoing.map((item) => <article key={item.slug}>
            <span className="vr2-eyebrow">INVESTIGAÇÃO VIVA · {item.section}</span>
            <h3><Link href={"/materias/" + item.slug}>{item.title}</Link></h3>
            <p>{item.summary}</p>
          </article>)}
        </aside>
      )}

      <footer className="vr-news__footer">
        <strong>O Instagram divulga. O site documenta.</strong>
        <p>Uma mesma notícia pode aparecer nas redes e aqui, com texto pesquisável, data, fontes e correções. As investigações mais longas permanecem em acompanhamento.</p>
        <a href="https://www.instagram.com/vr_abandonada/" target="_blank" rel="noopener noreferrer">Acompanhar o Instagram oficial ↗</a>
      </footer>
    </Container>
  );
}
