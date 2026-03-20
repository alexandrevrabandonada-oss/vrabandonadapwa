import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { ActorHubCard } from "@/components/actor-hub-card";
import { getInternalActorHubLinks, getInternalActorHubs } from "@/lib/actors/queries";
import { getActorHubStatusLabel } from "@/lib/actors/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Atores internos",
  description: "Curadoria e operação dos atores recorrentes do VR Abandonada.",
};

const filters = ["all", "draft", "active", "monitoring", "archive"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalActorsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const actors = await getInternalActorHubs({ status });
  const allActors = status === "all" ? actors : await getInternalActorHubs({ status: "all" });
  const linkPairs = await Promise.all(allActors.map(async (actor) => [actor.id, await getInternalActorHubLinks(actor.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allActors.filter((actor) => actor.status !== "draft" && actor.public_visibility).length;
  const activeCount = allActors.filter((actor) => actor.status === "active" || actor.status === "monitoring").length;

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">atores internos</p>
        <h1 className="hero__title">Curadoria de responsabilidade recorrente</h1>
        <p className="hero__lead">
          Organize o projeto por empresas, órgãos, hospitais, secretarias e instituições que voltam a atravessar os conflitos da cidade. O ator não substitui o caso, ele o enquadra.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/atores/novo" className="button">
            Novo ator
          </Link>
          <Link href="/atores" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allActors.length}</h3>
            <p>Atores cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicados</p>
            <h3>{publishedCount}</h3>
            <p>Linhas liberadas para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">ativos</p>
            <h3>{activeCount}</h3>
            <p>Frentes em andamento.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkPairs.reduce((sum, [, links]) => sum + links.length, 0)}</h3>
            <p>Peças conectadas aos atores.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em rascunho, ativo, monitoramento ou arquivo.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de atores">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/atores" : `/interno/atores?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getActorHubStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Atores registrados</h2>
          </div>
          <p className="section__lead">Cada ator abre uma frente maior e organiza leitura por responsabilidade recorrente.</p>
        </div>

        <div className="grid-2">
          {actors.length ? (
            actors.map((actor) => (
              <ActorHubCard
                key={actor.id}
                actorHub={actor}
                href={`/interno/atores/${actor.id}`}
                itemCount={linkCountById.get(actor.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem atores neste filtro</h3>
              <p>Crie o primeiro ator para abrir o mapa de responsabilidade do projeto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
