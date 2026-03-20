import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PlaceHubCard } from "@/components/place-hub-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedPlaceHubLinks, getPublishedPlaceHubs } from "@/lib/territories/queries";

export const metadata: Metadata = {
  title: "Territórios",
  description: "Atlas vivo de bairros, lugares e pontos críticos de Volta Redonda.",
  openGraph: {
    title: "Territórios | VR Abandonada",
    description: "Atlas vivo de bairros, lugares e pontos críticos de Volta Redonda.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Territórios | VR Abandonada",
    description: "Atlas vivo de bairros, lugares e pontos críticos de Volta Redonda.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function TerritoriesPage() {
  const territories = await getPublishedPlaceHubs();
  const featuredPlace = territories.find((place) => place.featured && place.status === "active") ?? territories.find((place) => place.status === "active") ?? territories[0] ?? null;
  const activeTerritories = territories.filter((place) => place.status === "active");
  const monitoringTerritories = territories.filter((place) => place.status === "monitoring");
  const archiveTerritories = territories.filter((place) => place.status === "archive");
  const linkPairs = await Promise.all(territories.map(async (place) => [place.id, await getPublishedPlaceHubLinks(place.id)] as const));
  const linksById = new Map(linkPairs.map(([id, links]) => [id, links]));
  const featuredLinks = featuredPlace ? linksById.get(featuredPlace.id) ?? [] : [];

  return (
    <Container className="intro-grid territories-page">
      <section className="hero hero--split territories-hero">
        <div className="hero__copy">
          <p className="eyebrow">atlas vivo</p>
          <h1 className="hero__title">Volta Redonda por lugares concretos.</h1>
          <p className="hero__lead">
            Bairros, equipamentos, marcos urbanos e pontos críticos organizam o arquivo vivo por território. A cidade entra aqui como espaço vivido, não como mapa burocrático.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">bairro e conflito</span>
            <span className="home-hero__signal">memória situada</span>
            <span className="home-hero__signal">documento e endereço</span>
          </div>
          <div className="hero__actions">
            <Link href="#territorios-ativos" className="button">
              Ver lugares
            </Link>
            <Link href="/eixos" className="button-secondary">
              Abrir eixos
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como entrar</p>
          <h2>Comece pelo lugar e desça para a pauta, a memória e o impacto.</h2>
          <p>
            O território condensa o arquivo vivo da cidade em um ponto concreto. Ele ajuda a localizar casos, documentos e disputas em bairros e marcos urbanos reais.
          </p>
          <div className="stack-actions">
            <Link href="/memoria" className="button-secondary">
              Entrar na memória
            </Link>
            <Link href="/acervo" className="button-secondary">
              Abrir acervo
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que são os territórios</p>
            <h2>Um atlas vivo de lugares que condensam o conflito da cidade.</h2>
          </div>
          <p className="section__lead">
            Cada lugar atravessa pauta, memória, acervo, dossiê, campanha e impacto. Em vez de uma lista seca de bairros, o site entrega um mapa editorial de permanências e disputas.
          </p>
        </div>

        <div className="grid-3">
          {[
            {
              title: "Bairro e memória",
              text: "Lugares onde a vida cotidiana preserva marcas do trabalho e da organização popular.",
            },
            {
              title: "Equipamento e pressão",
              text: "Hospitais, terminais e espaços públicos onde a cidade mostra suas fricções.",
            },
            {
              title: "Ponto crítico e arquivo",
              text: "Marcos urbanos que ajudam a ler o que mudou, o que segue em disputa e o que foi apagado.",
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
            <h3>{territories.length}</h3>
            <p>Lugares públicos cadastrados como entrada editorial.</p>
          </article>
          <article className="card">
            <h3>{activeTerritories.length}</h3>
            <p>Territórios ativos em circulação pública.</p>
          </article>
          <article className="card">
            <h3>{monitoringTerritories.length}</h3>
            <p>Lugares acompanhados como frente viva.</p>
          </article>
          <article className="card">
            <h3>{archiveTerritories.length}</h3>
            <p>Territórios em arquivo como lastro histórico.</p>
          </article>
        </div>
      </section>

      {featuredPlace ? (
        <section className="section home-territory-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">território em destaque</p>
              <h2>{featuredPlace.title}</h2>
            </div>
            <p className="section__lead">{featuredPlace.lead_question || featuredPlace.excerpt || featuredPlace.description}</p>
          </div>

          <div className="grid-2">
            <PlaceHubCard placeHub={featuredPlace} href={`/territorios/${featuredPlace.slug}`} itemCount={featuredLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>O lugar reúne o mapa de uma disputa concreta.</h3>
              <p>
                Aqui memória, acervo e impacto deixam de ser abstração e passam a ter endereço, bairro e trajetória editorial.
              </p>
              <div className="stack-actions">
                <Link href={`/territorios/${featuredPlace.slug}`} className="button">
                  Abrir território
                </Link>
                <Link href="/impacto" className="button-secondary">
                  Ver impactos
                </Link>
                <Link href="/campanhas" className="button-secondary">
                  Ver campanhas
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section" id="territorios-ativos">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lugares em circulação</p>
            <h2>Ativos, em monitoramento e arquivo.</h2>
          </div>
          <p className="section__lead">A leitura por status ajuda a ver o que está em curso e o que funciona como base territorial do arquivo vivo.</p>
        </div>

        <div className="grid-2">
          {[...activeTerritories.slice(1), ...monitoringTerritories, ...archiveTerritories].map((placeHub) => (
            <PlaceHubCard key={placeHub.id} placeHub={placeHub} href={`/territorios/${placeHub.slug}`} itemCount={linksById.get(placeHub.id)?.length ?? 0} compact />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhar</p>
            <h2>O território também aponta para leitura, envio e consequência.</h2>
          </div>
          <p className="section__lead">Quando o lugar importar para o caso, a navegação leva para pauta, memória, acervo, campanha ou impacto sem perder o endereço.</p>
        </div>

        <div className="stack-actions">
          <Link href="/dossies" className="button-secondary">
            Abrir dossiês
          </Link>
          <Link href="/memoria" className="button-secondary">
            Ver memória
          </Link>
          <Link href="/acervo" className="button-secondary">
            Ver acervo
          </Link>
          <Link href="/participe" className="button-secondary">
            Participar
          </Link>
        </div>
      </section>
    </Container>
  );
}
