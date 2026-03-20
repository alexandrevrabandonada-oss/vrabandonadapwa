import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ActorHubCard } from "@/components/actor-hub-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedActorHubLinks, getPublishedActorHubs } from "@/lib/actors/queries";

export const metadata: Metadata = {
  title: "Atores",
  description: "Mapa editorial de empresas, órgãos e instituições recorrentes nos conflitos de Volta Redonda.",
  openGraph: {
    title: "Atores | VR Abandonada",
    description: "Mapa editorial de empresas, órgãos e instituições recorrentes nos conflitos de Volta Redonda.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atores | VR Abandonada",
    description: "Mapa editorial de empresas, órgãos e instituições recorrentes nos conflitos de Volta Redonda.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function ActorsPage() {
  const actors = await getPublishedActorHubs();
  const featuredActor = actors.find((actor) => actor.featured && actor.status === "active") ?? actors.find((actor) => actor.status === "active") ?? actors[0] ?? null;
  const activeActors = actors.filter((actor) => actor.status === "active");
  const monitoringActors = actors.filter((actor) => actor.status === "monitoring");
  const archiveActors = actors.filter((actor) => actor.status === "archive");
  const linkPairs = await Promise.all(actors.map(async (actor) => [actor.id, await getPublishedActorHubLinks(actor.id)] as const));
  const linksById = new Map(linkPairs.map(([id, links]) => [id, links]));
  const featuredLinks = featuredActor ? linksById.get(featuredActor.id) ?? [] : [];

  return (
    <Container className="intro-grid territories-page">
      <section className="hero hero--split territories-hero">
        <div className="hero__copy">
          <p className="eyebrow">mapa de poder</p>
          <h1 className="hero__title">Volta Redonda por quem atravessa os conflitos da cidade.</h1>
          <p className="hero__lead">
            Empresas, órgãos, hospitais, secretarias e instituições voltam como nós de responsabilidade. O arquivo vivo também se organiza por quem aparece de novo no conflito.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">responsabilidade pública</span>
            <span className="home-hero__signal">poder recorrente</span>
            <span className="home-hero__signal">cidade em disputa</span>
          </div>
          <div className="hero__actions">
            <Link href="#atores-ativos" className="button">
              Ver atores
            </Link>
            <Link href="/territorios" className="button-secondary">
              Abrir territórios
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como entrar</p>
          <h2>Comece por um agente recorrente e desça para os casos, os bairros e os efeitos.</h2>
          <p>
            O ator condensa responsabilidade pública ou privada. Ele mostra onde o conflito reaparece e como ele se liga ao território, à pauta e à consequência.
          </p>
          <div className="stack-actions">
            <Link href="/dossies" className="button-secondary">
              Entrar nos dossiês
            </Link>
            <Link href="/impacto" className="button-secondary">
              Ver impacto
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que são os atores</p>
            <h2>Uma leitura pública de responsabilidade, recorrência e conflito.</h2>
          </div>
          <p className="section__lead">
            Em vez de um diretório frio, a página organiza o que atravessa as pautas: empresa, órgão, hospital, secretaria, autarquia e outras instituições que voltam como pressão pública.
          </p>
        </div>

        <div className="grid-3">
          {[
            {
              title: "Empresa e entorno",
              text: "Atores econômicos que moldam trabalho, ambiente e território de forma duradoura.",
            },
            {
              title: "Órgão e resposta",
              text: "Poder público local, regulação, cuidado e manutenção da cidade no cotidiano.",
            },
            {
              title: "Instituição e efeito",
              text: "Hospitais, escolas e autarquias onde a consequência pública vira rotina.",
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
            <h3>{actors.length}</h3>
            <p>Atores públicos cadastrados como entrada editorial.</p>
          </article>
          <article className="card">
            <h3>{activeActors.length}</h3>
            <p>Atores ativos em circulação pública.</p>
          </article>
          <article className="card">
            <h3>{monitoringActors.length}</h3>
            <p>Instituições em monitoramento como frente viva.</p>
          </article>
          <article className="card">
            <h3>{archiveActors.length}</h3>
            <p>Atores em arquivo como lastro histórico.</p>
          </article>
        </div>
      </section>

      {featuredActor ? (
        <section className="section home-territory-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">ator em destaque</p>
              <h2>{featuredActor.title}</h2>
            </div>
            <p className="section__lead">{featuredActor.lead_question || featuredActor.excerpt || featuredActor.description}</p>
          </div>

          <div className="grid-2">
            <ActorHubCard actorHub={featuredActor} href={`/atores/${featuredActor.slug}`} itemCount={featuredLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>O ator reúne o mapa da responsabilidade.</h3>
              <p>
                Aqui pauta, memória, acervo, dossiê, campanha e impacto deixam de ser abstração e passam a ter nome recorrente.
              </p>
              <div className="stack-actions">
                <Link href={`/atores/${featuredActor.slug}`} className="button">
                  Abrir ator
                </Link>
                <Link href="/atores" className="button-secondary">
                  Ver mapa de atores
                </Link>
                <Link href="/territorios" className="button-secondary">
                  Ver territórios
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section" id="atores-ativos">
        <div className="grid-2">
          <div>
            <p className="eyebrow">atores em circulação</p>
            <h2>Ativos, em monitoramento e arquivo.</h2>
          </div>
          <p className="section__lead">A leitura por status ajuda a ver o que está em curso e o que funciona como base da responsabilidade pública.</p>
        </div>

        <div className="grid-2">
          {[...activeActors.slice(1), ...monitoringActors, ...archiveActors].map((actorHub) => (
            <ActorHubCard key={actorHub.id} actorHub={actorHub} href={`/atores/${actorHub.slug}`} itemCount={linksById.get(actorHub.id)?.length ?? 0} compact />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhar</p>
            <h2>O ator também aponta para território, consequência e atualização.</h2>
          </div>
          <p className="section__lead">Quando a instituição importar para o caso, a navegação leva para pauta, memória, acervo, campanha, impacto e território sem perder a responsabilidade central.</p>
        </div>

        <div className="stack-actions">
          <Link href="/territorios" className="button-secondary">
            Abrir territórios
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
          <Link href="/memoria" className="button-secondary">
            Ver memória
          </Link>
          <Link href="/participe" className="button-secondary">
            Participar
          </Link>
        </div>
      </section>
    </Container>
  );
}
