import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { EntryRouteCard } from "@/components/entry-route-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedEntryRoutes, getPublishedEntryRouteItems } from "@/lib/entry-routes/queries";

export const metadata: Metadata = {
  title: "Começar",
  description: "Guias de leitura para entrar no VR Abandonada sem se perder.",
  openGraph: {
    title: "Começar | VR Abandonada",
    description: "Guias de leitura para entrar no VR Abandonada sem se perder.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function StartPage() {
  const routes = await getPublishedEntryRoutes();
  const counts = new Map(
    await Promise.all(routes.map(async (route) => [route.id, (await getPublishedEntryRouteItems(route.id)).length] as const)),
  );
  const featuredRoutes = routes.filter((route) => route.featured).slice(0, 4);
  const activeRoutes = routes.filter((route) => route.status === "active");

  return (
    <Container className="intro-grid start-page">
      <section className="hero hero--split start-hero">
        <div className="hero__copy">
          <p className="eyebrow">comece por aqui</p>
          <h1 className="hero__title">Rotas de entrada para entender o VR Abandonada.</h1>
          <p className="hero__lead">
            Se você chegou agora, não precisa decidir sozinho por onde entrar. Escolha uma rota e siga uma leitura curta, editorial e guiada.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">porta de entrada guiada</span>
            <span className="home-hero__signal">leitura curta</span>
            <span className="home-hero__signal">temas, provas e contexto</span>
          </div>
          <div className="hero__actions">
            <Link href="#rotas" className="button">
              Ver rotas
            </Link>
            <Link href="/agora" className="button-secondary">
              Ver o agora
            </Link>
          </div>
        </div>
        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">para quem é</p>
          <h2>Quem quer entender rápido, sem perder a espinha do projeto.</h2>
          <p>
            Estas rotas ajudam primeira visita, retorno recorrente e quem chega pelo compartilhamento a encontrar a trilha certa.
          </p>
          <div className="stack-actions">
            <Link href="/manifesto" className="button-secondary">
              Ler manifesto
            </Link>
            <Link href="/eixos" className="button-secondary">
              Entrar pelos temas
            </Link>
          </div>
        </article>
      </section>

      <section className="section start-intro-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que esta página faz</p>
            <h2>Ela mostra por onde começar e para onde seguir depois.</h2>
          </div>
          <p className="section__lead">
            A ideia não é empilhar links. É organizar caminhos curtos que puxam tema, caso, memória, acervo e atualização do presente.
          </p>
        </div>
      </section>

      <section className="section" id="rotas">
        <div className="grid-2">
          <div>
            <p className="eyebrow">rotas curatoriais</p>
            <h2>Escolha a entrada que combina com o seu momento.</h2>
          </div>
          <p className="section__lead">Cada rota tem uma pergunta de entrada, um percurso curto e um convite para continuar navegando.</p>
        </div>

        <div className="grid-2">
          {featuredRoutes.map((route) => (
            <EntryRouteCard key={route.id} route={route} href={`/comecar/${route.slug}`} itemCount={counts.get(route.id) ?? 0} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">outras entradas</p>
            <h2>As rotas ativas da casa.</h2>
          </div>
          <p className="section__lead">Mais do que um mapa de site, aqui estão leituras curtas que ajudam a entrar sem dispersão.</p>
        </div>

        <div className="grid-2">
          {activeRoutes.map((route) => (
            <EntryRouteCard key={route.id} route={route} href={`/comecar/${route.slug}`} itemCount={counts.get(route.id) ?? 0} compact />
          ))}
        </div>
      </section>

      <section className="section start-follow-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">continue por aí</p>
            <h2>O próximo passo depende do que você quer entender agora.</h2>
          </div>
          <p className="section__lead">Depois da rota de entrada, o site abre caminhos por tema, atualização, caso, arquivo e documento.</p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>Agora</h3>
            <p>Veja o pulso editorial do momento.</p>
            <Link href="/agora" className="button-secondary">Abrir radar</Link>
          </article>
          <article className="card">
            <h3>Eixos</h3>
            <p>Entre por grandes temas da cidade.</p>
            <Link href="/eixos" className="button-secondary">Ver eixos</Link>
          </article>
          <article className="card">
            <h3>Dossiês</h3>
            <p>Acompanhe as investigações em curso.</p>
            <Link href="/dossies" className="button-secondary">Abrir dossiês</Link>
          </article>
          <article className="card">
            <h3>Memória</h3>
            <p>Entre pelo arquivo vivo e pelos recortes históricos.</p>
            <Link href="/memoria" className="button-secondary">Ver memória</Link>
          </article>
        </div>
      </section>
    </Container>
  );
}
