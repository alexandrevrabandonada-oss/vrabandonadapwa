import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EntryRouteCard } from "@/components/entry-route-card";
import { EntryRouteStepCard } from "@/components/entry-route-step-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedEntryRoutes, getResolvedPublishedEntryRouteBySlug } from "@/lib/entry-routes/queries";
import { getEntryRouteStatusLabel } from "@/lib/entry-routes/navigation";

export async function generateStaticParams() {
  const routes = await getPublishedEntryRoutes();
  return routes.map((route) => ({ slug: route.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getResolvedPublishedEntryRouteBySlug(slug);

  if (!data) {
    return {
      title: "Começar",
      description: "Guias de leitura para entrar no VR Abandonada.",
    };
  }

  return {
    title: `${data.route.title} | Começar`,
    description: data.route.excerpt || data.route.description || "Guia de leitura do VR Abandonada.",
    openGraph: {
      title: `${data.route.title} | Começar`,
      description: data.route.excerpt || data.route.description || "Guia de leitura do VR Abandonada.",
      type: "article",
      images: [getHomeOpenGraphImagePath()],
    },
  };
}

export default async function StartRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getResolvedPublishedEntryRouteBySlug(slug);

  if (!data) {
    notFound();
  }

  const { route, items } = data;
  const leadItem = items.find((item) => item.role === "start") ?? items[0] ?? null;

  return (
    <Container className="intro-grid start-route-page">
      <section className="hero hero--split start-route-hero">
        <div className="hero__copy">
          <p className="eyebrow">comece por aqui</p>
          <h1 className="hero__title">{route.title}</h1>
          <p className="hero__lead">{route.excerpt || route.description}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getEntryRouteStatusLabel(route.status)}</span>
            {route.audience_label ? <span className="home-hero__signal">{route.audience_label}</span> : null}
            <span className="home-hero__signal">{items.length} passo{items.length === 1 ? "" : "s"}</span>
          </div>
          <div className="hero__actions">
            <Link href="/comecar" className="button-secondary">
              Voltar às rotas
            </Link>
            <Link href="/agora" className="button-secondary">
              Ver o agora
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">para quem é</p>
          <h2>{route.audience_label || "Entrada guiada"}</h2>
          <p>
            Esta rota foi montada para diminuir dispersão e abrir caminho rápido para o universo do projeto.
          </p>
          {leadItem ? (
            <article className="support-box">
              <p className="eyebrow">peça principal</p>
              <h3>{leadItem.title}</h3>
              <p>{leadItem.excerpt || leadItem.note}</p>
              <Link href={leadItem.href} className="button-secondary">
                Começar por aqui
              </Link>
            </article>
          ) : null}
        </article>
      </section>

      <section className="section start-route-intro">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como ler a rota</p>
            <h2>Comece por esta peça, depois siga a ordem editorial.</h2>
          </div>
          <p className="section__lead">
            A sequência traz contexto, prova, aprofundamento e acompanhamento. O objetivo é não deixar o visitante novo sozinho com a complexidade do site.
          </p>
        </div>
      </section>

      <section className="section start-route-steps">
        <div className="grid-2">
          {items.map((item) => (
            <EntryRouteStepCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="section start-route-follow">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos passos</p>
            <h2>Para onde seguir depois desta rota.</h2>
          </div>
          <p className="section__lead">Depois da porta de entrada, o site abre caminhos por tema, atualização, caso, arquivo e documento.</p>
        </div>

        <div className="grid-4">
          <EntryRouteCard route={route} href={`/comecar/${route.slug}`} itemCount={items.length} compact />
          <article className="card">
            <h3>Agora</h3>
            <p>Veja o pulso editorial do momento.</p>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </article>
          <article className="card">
            <h3>Eixos</h3>
            <p>Entre por grandes temas da cidade.</p>
            <Link href="/eixos" className="button-secondary">
              Ver eixos
            </Link>
          </article>
          <article className="card">
            <h3>Dossiês</h3>
            <p>Acompanhe as investigações em curso.</p>
            <Link href="/dossies" className="button-secondary">
              Abrir dossiês
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}