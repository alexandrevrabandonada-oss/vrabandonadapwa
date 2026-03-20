import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PatternReadCard } from "@/components/pattern-read-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedPatternReadLinks, getPublishedPatternReads } from "@/lib/patterns/queries";

export const metadata: Metadata = {
  title: "Padrões",
  description: "Leituras estruturais do VR Abandonada: recorrências entre atores, territórios, impactos e casos.",
  openGraph: {
    title: "Padrões | VR Abandonada",
    description: "Leituras estruturais do VR Abandonada: recorrências entre atores, territórios, impactos e casos.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Padrões | VR Abandonada",
    description: "Leituras estruturais do VR Abandonada: recorrências entre atores, territórios, impactos e casos.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function PatternsPage() {
  const patterns = await getPublishedPatternReads();
  const featuredPattern = patterns.find((pattern) => pattern.featured && pattern.status === "active") ?? patterns.find((pattern) => pattern.status === "active") ?? patterns[0] ?? null;
  const activePatterns = patterns.filter((pattern) => pattern.status === "active");
  const monitoringPatterns = patterns.filter((pattern) => pattern.status === "monitoring");
  const archivePatterns = patterns.filter((pattern) => pattern.status === "archive");
  const linkPairs = await Promise.all(patterns.map(async (pattern) => [pattern.id, await getPublishedPatternReadLinks(pattern.id)] as const));
  const linksById = new Map(linkPairs.map(([id, links]) => [id, links]));
  const featuredLinks = featuredPattern ? linksById.get(featuredPattern.id) ?? [] : [];

  return (
    <Container className="intro-grid territories-page">
      <section className="hero hero--split territories-hero">
        <div className="hero__copy">
          <p className="eyebrow">leitura estrutural</p>
          <h1 className="hero__title">O que se repete na cidade não é detalhe. É padrão.</h1>
          <p className="hero__lead">
            Padrões organizam a visão sistêmica do VR Abandonada: mostram recorrências de atores, territórios, impactos e disputas que reaparecem no tempo e no espaço da cidade.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">recorrência</span>
            <span className="home-hero__signal">estrutura</span>
            <span className="home-hero__signal">leitura pública</span>
          </div>
          <div className="hero__actions">
            <Link href="#padroes-ativos" className="button">
              Ver padrões
            </Link>
            <Link href="/atores" className="button-secondary">
              Abrir atores
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como ler</p>
          <h2>Um padrão junta peças dispersas para mostrar a cidade que insiste.</h2>
          <p>
            Em vez de contar casos isolados, esta camada aponta repetição, continuidade e conflito sistêmico. Ela ajuda a perceber quando o problema não é evento, mas estrutura.
          </p>
          <div className="stack-actions">
            <Link href="/dossies" className="button-secondary">
              Entrar nos dossiês
            </Link>
            <Link href="/territorios" className="button-secondary">
              Ver territórios
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que são os padrões</p>
            <h2>Hipóteses públicas sobre recorrência.</h2>
          </div>
          <p className="section__lead">
            Cada padrão reúne uma leitura: o ator que volta, o território que concentra disputa, o impacto que se repete ou a continuidade que o arquivo revela.
          </p>
        </div>

        <div className="grid-3">
          {[
            {
              title: "Actor recorrente",
              text: "Quando a mesma empresa, órgão ou instituição volta a atravessar vários casos.",
            },
            {
              title: "Território recorrente",
              text: "Quando o mesmo bairro, centro ou ponto crítico concentra as marcas do conflito.",
            },
            {
              title: "Impacto recorrente",
              text: "Quando a consequência pública retorna e mostra que a questão segue aberta.",
            },
          ].map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <article className="card">
            <h3>{patterns.length}</h3>
            <p>Padrões públicos em leitura.</p>
          </article>
          <article className="card">
            <h3>{activePatterns.length}</h3>
            <p>Padrões ativos para acompanhamento.</p>
          </article>
          <article className="card">
            <h3>{monitoringPatterns.length}</h3>
            <p>Padrões em monitoramento público.</p>
          </article>
          <article className="card">
            <h3>{archivePatterns.length}</h3>
            <p>Padrões arquivados como lastro estrutural.</p>
          </article>
        </div>
      </section>

      {featuredPattern ? (
        <section className="section home-territory-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">padrão em destaque</p>
              <h2>{featuredPattern.title}</h2>
            </div>
            <p className="section__lead">Uma hipótese pública para começar a leitura estrutural da cidade.</p>
          </div>

          <div className="grid-2">
            <PatternReadCard patternRead={featuredPattern} href={`/padroes/${featuredPattern.slug}`} itemCount={featuredLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>O padrão mostra o caso em escala maior.</h3>
              <p>
                Aqui o arquivo ganha síntese: pauta, território, impacto e responsabilidade deixam de ser peças soltas e viram estrutura legível.
              </p>
              <div className="stack-actions">
                <Link href={`/padroes/${featuredPattern.slug}`} className="button">
                  Abrir padrão
                </Link>
                <Link href="/atores" className="button-secondary">
                  Ver atores
                </Link>
                <Link href="/territorios" className="button-secondary">
                  Ver territórios
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section" id="padroes-ativos">
        <div className="grid-2">
          <div>
            <p className="eyebrow">padrões em circulação</p>
            <h2>Ativos, em monitoramento e arquivo.</h2>
          </div>
          <p className="section__lead">A leitura por status ajuda a separar o que está em acompanhamento do que já virou base estrutural do projeto.</p>
        </div>

        <div className="grid-2">
          {[...activePatterns.slice(1), ...monitoringPatterns, ...archivePatterns].map((patternRead) => (
            <PatternReadCard
              key={patternRead.id}
              patternRead={patternRead}
              href={`/padroes/${patternRead.slug}`}
              itemCount={linksById.get(patternRead.id)?.length ?? 0}
              compact
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">continuar lendo</p>
            <h2>A leitura estrutural continua em atores, territórios, dossiês e impacto.</h2>
          </div>
          <p className="section__lead">
            Um padrão não encerra a investigação. Ele aponta onde o mesmo conflito insiste e convida a abrir os casos relacionados.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/atores" className="button-secondary">
            Abrir atores
          </Link>
          <Link href="/territorios" className="button-secondary">
            Abrir territórios
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
        </div>
      </section>
    </Container>
  );
}
