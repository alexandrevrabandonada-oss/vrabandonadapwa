import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getMaterias, materiaKind, materiaKindLabel, publishedDate } from "@/lib/materias";
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
  // Uma reportagem investigativa aprovada também precisa ser encontrável em Investigações.
  // Mantemos a distinção entre reportagem publicada no Git e dossiê estruturado no banco.
  const featuredInvestigations = [
    ...materias.filter((article) => materiaKind(article) === "investigation").map((article) => ({
      id: "materia-" + article.slug,
      slug: article.slug,
      title: article.title,
      href: "/materias/" + article.slug,
      detail: article.summary,
      context: article.section,
      kind: article.investigationStatus === "ongoing" ? "Reportagem em acompanhamento" : "Reportagem investigativa",
      date: article.updatedAt || article.publishedAt,
    })),
    ...dossiers.map((dossier) => ({
      id: "dossie-" + dossier.id,
      slug: dossier.slug,
      title: dossier.title,
      href: "/dossies/" + dossier.slug,
      detail: dossier.excerpt || dossier.description || dossier.lead_question || "",
      context: dossier.territory_label || "Volta Redonda",
      kind: "Dossiê",
      date: dossier.updated_at || dossier.created_at,
    })),
  ]
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
    .filter((entry, index, entries) => entries.findIndex((other) => other.slug === entry.slug) === index)
    .slice(0, 3);
  const featuredNeighborhoods = neighborhoods.slice(0, 5);
  const newsHrefs = new Set(feed.slice(0, 6).map((entry) => entry.href));

  return (
    <Container className="vr2-home">
      <div className="vr2-edition-bar">
        <span><span className="vr2-dot" aria-hidden="true" /> VOLTA REDONDA · RIO DE JANEIRO</span>
        <span>INFORMAÇÃO · MEMÓRIA · INVESTIGAÇÃO</span>
      </div>

      <header className="vr4-home-intro">
        <span className="vr2-eyebrow">Jornalismo popular independente</span>
        <h1>A cidade não cabe no feed<span>.</span></h1>
        <p>Notícias, investigações e memória pública de Volta Redonda — com contexto e fontes.</p>
      </header>

      <section className="vr2-section" aria-labelledby="vr2-latest-heading">
        <div className="vr2-section__heading">
          <div><span className="vr2-eyebrow">{lead ? "PUBLICAÇÕES VERIFICADAS" : "ACERVO JORNALÍSTICO"}</span><h2 id="vr2-latest-heading">{lead ? "Destaques da cidade" : "Notícias e reportagens"}</h2></div>
          <Link href="/agora" className="vr2-text-link">Ver últimas <span aria-hidden="true">↗</span></Link>
        </div>

        {lead ? (
          <div className="vr2-news-layout">
            <article className={lead.image ? "vr2-lead" : "vr2-lead vr2-lead--text-only"}>
              {lead.image ? (
                <Link href={lead.href} className="vr2-lead__visual" aria-label={"Ler: " + lead.title}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lead.image} alt={lead.imageAlt || lead.title} loading="eager" />
                </Link>
              ) : null}
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
                  <Link href={item.href} aria-label={"Ler: " + item.title}>Ler publicação <span aria-hidden="true">↗</span></Link>
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
          <div>
            <span className="vr2-eyebrow">{featuredInvestigations.length ? "NÃO DEIXAMOS O ASSUNTO MORRER" : "TEMAS DE COBERTURA"}</span>
            <h2 id="vr2-investigations-heading">{featuredInvestigations.length ? "Investigações" : "Assuntos que acompanhamos"}</h2>
          </div>
          <Link href={featuredInvestigations.length ? "/dossies" : "/buscar"} className="vr2-text-link">
            {featuredInvestigations.length ? "Ver investigações" : "Pesquisar temas"} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {featuredInvestigations.length ? (
          <div className="vr2-investigations">
            {featuredInvestigations.map((item, i) => (
              <article key={item.id} className={newsHrefs.has(item.href) ? "vr2-investigation vr4-investigation--recap" : "vr2-investigation"}>
                <span className="vr2-investigation__number">0{i + 1}</span>
                <span className="vr2-eyebrow">{item.kind} · {item.context}</span>
                <h3><Link href={item.href}>{item.title}</Link></h3>
                {!newsHrefs.has(item.href) ? <p>{item.detail}</p> : null}
                <Link href={item.href} className="vr2-readmore">{newsHrefs.has(item.href) ? "Continuar acompanhando" : "Ler investigação"} ↗</Link>
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


      {featuredNeighborhoods.length > 0 ? (
        <section className="vr2-section vr4-home-places" aria-labelledby="vr2-neighborhood-heading">
          <div className="vr2-section__heading">
            <div><span className="vr2-eyebrow">A CIDADE É FEITA DE GENTE</span><h2 id="vr2-neighborhood-heading">Por bairro</h2></div>
            <Link href="/territorios" className="vr2-text-link">Ver lugares ↗</Link>
          </div>
          <div className="vr4-home-places__links">
            {featuredNeighborhoods.map((place) => (
              <Link key={place.id} href={"/territorios/" + place.slug}>{place.title} ↗</Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="vr4-home-contribute" aria-labelledby="vr4-contribute-title">
        <div>
          <span className="vr2-eyebrow">AJUDE A APURAR</span>
          <h2 id="vr4-contribute-title">Tem uma informação ou documento importante?</h2>
          <p>Compartilhe uma pista com a redação. A publicação depende de verificação editorial.</p>
        </div>
        <div className="vr4-home-contribute__actions">
          <Link href="/envie" className="vr2-button vr2-button--accent">Enviar informação ↗</Link>
          <Link href="/metodo" className="vr2-button vr2-button--quiet">Como apuramos ↗</Link>
        </div>
      </section>
    </Container>
  );
}
