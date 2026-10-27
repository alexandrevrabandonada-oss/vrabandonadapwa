import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { MateriasHome } from "@/components/materias-home";
import { InstagramPublicationCard } from "@/components/instagram-publication-card";
import { getInstagramPosts, TOPICS, topicsFor } from "@/lib/instagram/posts";

export const metadata: Metadata = {
  title: "Publicações, Reels e notícias",
  description: "As publicações do VR Abandonada, organizadas por assunto e com links permanentes. Notícias, Reels e memória de Volta Redonda.",
  alternates: { canonical: "/publicacoes" },
  openGraph: { title: "Publicações do VR Abandonada", description: "Da rede social para um arquivo público, pesquisável e compartilhável.", url: "/publicacoes" },
};

export default async function PublicacoesPage({ searchParams }: { searchParams: Promise<{ q?: string; tema?: string }> }) {
  const { q = "", tema = "" } = await searchParams;
  const safeQuery = q.trim().slice(0, 100).toLocaleLowerCase("pt-BR");
  const safeTopic = TOPICS.includes(tema as typeof TOPICS[number]) ? tema : "";
  const items = getInstagramPosts().filter((post) => {
    const matchesText = !safeQuery || post.caption.toLocaleLowerCase("pt-BR").includes(safeQuery);
    const matchesTopic = !safeTopic || topicsFor(post).includes(safeTopic);
    return matchesText && matchesTopic;
  });
  return (
    <Container className="ig-directory">
      <header className="ig-hero">
        <p className="ig-eyebrow">ARQUIVO DE PUBLICAÇÕES · VR ABANDONADA</p>
        <h1>A cidade não cabe no algoritmo.</h1>
        <p>Notícias, vídeos, denúncias públicas e explicações que continuam disponíveis depois que saem do feed.</p>
        <div className="ig-hero__actions">
          <a className="button" href="https://www.instagram.com/vr_abandonada/" target="_blank" rel="noopener noreferrer">Acompanhar no Instagram</a>
          <Link className="button-secondary" href="/buscar">Pesquisar o acervo</Link>
        </div>
      </header>
      <MateriasHome />
      <div className="ig-toolbar">
        <form action="/publicacoes" className="ig-search" role="search">
          <label htmlFor="ig-q">Buscar nas publicações</label>
          <div><input id="ig-q" name="q" type="search" placeholder="CSN, saúde, obras, transporte..." defaultValue={q} maxLength={100} /><button type="submit">Pesquisar</button></div>
        </form>
        <nav aria-label="Filtrar por assunto" className="ig-topics">
          <Link className={!safeTopic ? "active" : ""} href="/publicacoes">Todos</Link>
          {TOPICS.map((topic) => <Link key={topic} className={safeTopic === topic ? "active" : ""} href={"/publicacoes?tema=" + encodeURIComponent(topic)}>{topic}</Link>)}
        </nav>
      </div>
      <div className="ig-directory__header"><h2>Publicações</h2><p>{items.length} resultado{items.length === 1 ? "" : "s"}</p></div>
      {items.length > 0 ? (
        <div className="ig-cards">{items.map((post, i) => <InstagramPublicationCard key={post.id} post={post} priority={i === 0} />)}</div>
      ) : (
        <section className="ig-empty">
          <strong>{q || tema ? "Nenhuma publicação encontrada para esse filtro." : "O arquivo automático está sendo conectado."}</strong>
          <p>{q || tema ? "Tente outro termo ou navegue pelo arquivo editorial existente." : "As postagens públicas poderão aparecer aqui automaticamente assim que a conta profissional do Instagram autorizar a sincronização. Nenhuma notícia será inventada para preencher o arquivo."}</p>
          <Link className="button-secondary" href="/agora">Ver o acervo já publicado</Link>
        </section>
      )}
      <section className="ig-comun-callout">
        <div><span>UM OUTRO TIPO DE PARTICIPAÇÃO</span><h2>Viu um problema na cidade?</h2><p>Para registrar e acompanhar um relato, use o COMUN, projeto independente de participação cidadã. Este portal é o acervo público de comunicação do VR Abandonada.</p></div>
        <a href="https://comunsocial.online" target="_blank" rel="noopener noreferrer">Conhecer o COMUN ↗</a>
      </section>
    </Container>
  );
}
