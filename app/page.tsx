import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getMaterias, materiaKindLabel, publishedDate } from "@/lib/materias";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";

export const metadata: Metadata = {
  title: "Jornalismo independente em Volta Redonda",
  description: "Notícias verificadas, investigações, bairros e memória de Volta Redonda. VR Abandonada: a cidade não cabe no feed.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "VR Abandonada — a cidade não cabe no feed",
    description: "Notícias, investigações e memória pública de Volta Redonda.",
  },
};

type FeedEntry = {
  id: string;
  href: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  image?: string;
  imageAlt?: string;
};

function dateLabel(value: string) {
  if (Number.isNaN(Date.parse(value))) return "Arquivo editorial";
  return publishedDate(value);
}

const investigationTopics = [
  { name: "CSN e meio ambiente", label: "Indústria, poluição e seus efeitos na cidade", href: "/buscar?q=CSN", number: "01" },
  { name: "Trabalho e direitos", label: "Condições de trabalho, salários e terceirização", href: "/buscar?q=trabalhadores", number: "02" },
  { name: "Obras e dinheiro público", label: "Contratos, prazos, obras e prestação de contas", href: "/buscar?q=obras", number: "03" },
  { name: "Saúde e vida urbana", label: "Serviços públicos, bairros e problemas cotidianos", href: "/buscar?q=saúde", number: "04" },
];

export default async function HomePage() {
  const [materias, editorial, dossiers, neighborhoods] = await Promise.all([
    getMaterias(),
    getPublishedEditorialItems(),
    getPublishedDossiers(),
    getPublishedPlaceHubs(),
  ]);

  // Apenas registros publicados: nunca inserir demonstrações ou rascunhos.
  const feed: FeedEntry[] = [
    ...materias.map((article) => ({
      id: "materia-" + article.slug,
      href: "/materias/" + article.slug,
      title: article.title,
      summary: article.summary,
      category: materiaKindLabel(article) + " · " + article.section,
      date: article.updatedAt || article.publishedAt,
      image: article.cover?.src,
      imageAlt: article.cover?.alt,
    })),
    ...editorial.map((article) => ({
      id: "editorial-" + article.slug,
      href: "/pautas/" + article.slug,
      title: article.title,
      summary: article.excerpt,
      category: article.primary_tag || article.category,
      date: article.published_at || article.created_at,
      image: article.cover_image_url || undefined,
      imageAlt: article.title,
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const lead = feed[0] ?? null;
  const latest = feed.slice(lead ? 1 : 0, lead ? 7 : 6);
  const featuredDossiers = dossiers.slice(0, 3);
  const featuredNeighborhoods = neighborhoods.slice(0, 5);

  return (
    <Container className="vr2-home">
      <div className="vr2-edition-bar">
        <span><span className="vr2-dot" aria-hidden="true" /> VOLTA REDONDA · RIO DE JANEIRO</span>
        <span>INFORMAÇÃO · MEMÓRIA · INVESTIGAÇÃO</span>
      </div>

      <div className="vr2-opening">
        <div className="vr2-opening__title">
          <span className="vr2-eyebrow">Jornalismo popular independente</span>
          <h1>A cidade não cabe no feed<span>.</span></h1>
          <p>Notícias, investigações e memória pública de Volta Redonda — com contexto, fontes e compromisso com quem vive a cidade.</p>
          <div className="vr2-opening__actions">
            <Link href="/agora" className="vr2-button vr2-button--accent">Últimas notícias <span aria-hidden="true">↗</span></Link>
            <Link href="/dossies" className="vr2-button vr2-button--quiet">Investigações <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="vr2-opening__aside" aria-label="Caminhos do portal">
          <span className="vr2-eyebrow">O QUE VOCÊ ENCONTRA AQUI</span>
          <Link href="/noticias"><b>01</b><span>Notícias da cidade</span><span aria-hidden="true">↗</span></Link>
          <Link href="/dossies"><b>02</b><span>Investigações e documentos</span><span aria-hidden="true">↗</span></Link>
          <Link href="/territorios"><b>03</b><span>Histórias por bairro</span><span aria-hidden="true">↗</span></Link>
          <Link href="/acervo"><b>04</b><span>Memória e acervo público</span><span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <section className="vr2-section" aria-labelledby="vr2-latest-heading">
        <div className="vr2-section__heading">
          <div><span className="vr2-eyebrow">{lead ? "PUBLICAÇÕES VERIFICADAS" : "ACERVO JORNALÍSTICO"}</span><h2 id="vr2-latest-heading">{lead ? "O que está em pauta" : "Notícias e reportagens"}</h2></div>
          <Link href="/noticias" className="vr2-text-link">Ver notícias <span aria-hidden="true">↗</span></Link>
        </div>

        {lead ? (
          <div className="vr2-news-layout">
            <article className="vr2-lead">
              <Link href={lead.href} className="vr2-lead__visual" aria-label={"Ler: " + lead.title}>
                {lead.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lead.image} alt={lead.imageAlt || lead.title} loading="eager" />
                ) : (
                  <div className="vr2-lead__graphic" aria-hidden="true"><span>VR</span><strong>ABANDONADA</strong><small>JORNALISMO INDEPENDENTE</small></div>
                )}
              </Link>
              <div className="vr2-lead__content">
                <div className="vr2-meta"><span>{lead.category}</span><span>{dateLabel(lead.date)}</span></div>
                <h3><Link href={lead.href}>{lead.title}</Link></h3>
                <p>{lead.summary}</p>
                <Link href={lead.href} className="vr2-readmore">Ler publicação completa <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
            <div className="vr2-news-list" aria-label="Outras publicações">
              {latest.length ? latest.slice(0, 4).map((item) => (
                <article className="vr2-news-list__item" key={item.id}>
                  <div className="vr2-meta"><span>{item.category}</span><span>{dateLabel(item.date)}</span></div>
                  <h3><Link href={item.href}>{item.title}</Link></h3>
                  <p>{item.summary}</p>
                  <Link href={item.href} aria-label={"Ler: " + item.title}>Ler notícia <span aria-hidden="true">↗</span></Link>
                </article>
              )) : (
                <div className="vr2-news-list__empty">
                  <strong>Mais matérias a caminho.</strong>
                  <p>Este acervo cresce com publicações verificadas, não com exemplos artificiais.</p>
                  <Link href="/buscar">Pesquisar o arquivo ↗</Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="vr2-empty-news" role="status">
            <div>
              <span className="vr2-eyebrow">PUBLICAÇÕES EM PREPARAÇÃO</span>
              <h3>As primeiras reportagens estão em revisão.</h3>
              <p>Esta área será preenchida somente por conteúdo aprovado. Enquanto isso, o VR Abandonada já publica nas redes sociais.</p>
            </div>
            <div className="vr2-empty-news__actions">
              <a href="https://www.instagram.com/vr_abandonada/" target="_blank" rel="noopener noreferrer" className="vr2-text-link">Acompanhar no Instagram ↗</a>
              <Link href="/buscar" className="vr2-text-link">Pesquisar temas ↗</Link>
            </div>
          </div>
        )}
      </section>

      <section className="vr2-section" aria-labelledby="vr2-investigations-heading">
        <div className="vr2-section__heading">
          <div><span className="vr2-eyebrow">{featuredDossiers.length ? "NÃO DEIXAMOS O ASSUNTO MORRER" : "TEMAS DE COBERTURA"}</span><h2 id="vr2-investigations-heading">{featuredDossiers.length ? "Investigações" : "Assuntos que acompanhamos"}</h2></div>
          <Link href={featuredDossiers.length ? "/dossies" : "/buscar"} className="vr2-text-link">{featuredDossiers.length ? "Explorar dossiês" : "Pesquisar o acervo"} <span aria-hidden="true">↗</span></Link>
        </div>
        {featuredDossiers.length ? (
          <div className="vr2-investigations">
            {featuredDossiers.map((item, i) => (
              <article key={item.id} className="vr2-investigation">
                <span className="vr2-investigation__number">0{i + 1}</span>
                <span className="vr2-eyebrow">{item.territory_label || "Volta Redonda"} · {item.period_label || "Arquivo"}</span>
                <h3><Link href={"/dossies/" + item.slug}>{item.title}</Link></h3>
                <p>{item.excerpt || item.description}</p>
                <Link href={"/dossies/" + item.slug} className="vr2-readmore">Abrir investigação ↗</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="vr2-investigations">
            {investigationTopics.slice(0, 3).map((topic) => (
              <article key={topic.number} className="vr2-investigation">
                <span className="vr2-investigation__number">{topic.number}</span>
                <span className="vr2-eyebrow">TEMA DE COBERTURA</span>
                <h3><Link href={topic.href}>{topic.name}</Link></h3>
                <p>{topic.label}</p>
                <Link href={topic.href} className="vr2-readmore">Pesquisar tema ↗</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="vr2-duo">
        <section className="vr2-section vr2-section--compact" aria-labelledby="vr2-neighborhood-heading">
          <div className="vr2-section__heading">
            <div><span className="vr2-eyebrow">A CIDADE É FEITA DE GENTE</span><h2 id="vr2-neighborhood-heading">Por bairro</h2></div>
          </div>
          <p>Volta Redonda vista a partir dos territórios onde as decisões têm consequências.</p>
          <div className="vr2-neighborhoods">
            {featuredNeighborhoods.length ? featuredNeighborhoods.map((place) => (
              <Link key={place.id} href={"/territorios/" + place.slug}>{place.title}<span aria-hidden="true">↗</span></Link>
            )) : (
              <Link href="/territorios">Explorar os territórios da cidade <span aria-hidden="true">↗</span></Link>
            )}
          </div>
          <Link href="/territorios" className="vr2-text-link">Ver todos os bairros ↗</Link>
        </section>

        <section className="vr2-section vr2-section--compact vr2-search-box" aria-labelledby="vr2-search-heading">
          <span className="vr2-eyebrow">UM ARQUIVO QUE NÃO DESAPARECE</span>
          <h2 id="vr2-search-heading">Procure. Questione. Confira.</h2>
          <p>Pesquise nomes, contratos, bairros, vídeos e investigações. Um link permanente vale mais que uma publicação perdida no feed.</p>
          <form action="/buscar" method="get" role="search" className="vr2-search-form">
            <label htmlFor="vr2-q">Buscar no VR Abandonada</label>
            <div><input id="vr2-q" type="search" name="q" placeholder="CSN, Rua 33, saúde…" maxLength={100} /><button type="submit" aria-label="Pesquisar no site">Buscar ↗</button></div>
          </form>
          <Link href="/acervo" className="vr2-text-link">Conhecer o acervo ↗</Link>
        </section>
      </div>


      <section className="vr2-about" aria-label="Sobre o projeto e participação">
        <div>
          <span className="vr2-eyebrow">NOSSO COMPROMISSO</span>
          <h2>Noticiar é o começo. Acompanhar é o compromisso.</h2>
          <p>O VR Abandonada organiza informações de interesse público com contexto, transparência e memória. Para participação coletiva e acompanhamento comunitário, conheça o COMUN — um projeto com finalidade própria.</p>
        </div>
        <div className="vr2-about__actions">
          <Link href="/metodo" className="vr2-button vr2-button--accent">Método editorial ↗</Link>
          <a href="https://comunsocial.online" className="vr2-button vr2-button--quiet" target="_blank" rel="noopener noreferrer">COMUN ↗</a>
        </div>
      </section>
    </Container>
  );
}
