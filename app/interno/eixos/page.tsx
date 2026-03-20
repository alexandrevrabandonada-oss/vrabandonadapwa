import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { ThemeHubCard } from "@/components/theme-hub-card";
import { getInternalThemeHubs, getInternalThemeHubLinks } from "@/lib/hubs/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Eixos internos",
  description: "Curadoria e operação dos hubs temáticos do VR Abandonada.",
};

const filters = ["all", "draft", "active", "monitoring", "archive"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalThemeHubsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const hubs = await getInternalThemeHubs({ status });
  const allHubs = status === "all" ? hubs : await getInternalThemeHubs({ status: "all" });
  const linkPairs = await Promise.all(allHubs.map(async (hub) => [hub.id, await getInternalThemeHubLinks(hub.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allHubs.filter((hub) => hub.status !== "draft" && hub.public_visibility).length;
  const activeCount = allHubs.filter((hub) => hub.status === "active" || hub.status === "monitoring").length;

  return (
    <Container className="intro-grid internal-page theme-hub-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">eixos internos</p>
        <h1 className="hero__title">Curadoria de frentes temáticas</h1>
        <p className="hero__lead">
          Organize o projeto por temas que atravessam pauta, memória, acervo e dossiê. O eixo não substitui o caso, ele o enquadra.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/eixos/novo" className="button">
            Novo eixo
          </Link>
          <Link href="/eixos" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allHubs.length}</h3>
            <p>Eixos cadastrados.</p>
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
            <p>Peças conectadas aos eixos.</p>
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

        <div className="status-filters" aria-label="Filtro de eixos">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/eixos" : `/interno/eixos?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getThemeHubStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Eixos registrados</h2>
          </div>
          <p className="section__lead">Cada eixo abre uma frente maior e organiza leitura por tema vivo.</p>
        </div>

        <div className="grid-2">
          {hubs.length ? (
            hubs.map((hub) => (
              <ThemeHubCard
                key={hub.id}
                hub={hub}
                href={`/interno/eixos/${hub.id}`}
                itemCount={linkCountById.get(hub.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem eixos neste filtro</h3>
              <p>Crie o primeiro eixo para abrir o mapa temático do projeto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
