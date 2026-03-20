import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { EntryRouteCard } from "@/components/entry-route-card";
import { getInternalEntryRoutes, getInternalEntryRouteItems } from "@/lib/entry-routes/queries";
import { getEntryRouteStatusLabel } from "@/lib/entry-routes/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rotas internas",
  description: "Curadoria e operação dos guias de leitura do VR Abandonada.",
};

const filters = ["all", "draft", "active", "archive"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalEntryRoutesPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const routes = await getInternalEntryRoutes({ status });
  const allRoutes = status === "all" ? routes : await getInternalEntryRoutes({ status: "all" });
  const itemPairs = await Promise.all(allRoutes.map(async (route) => [route.id, (await getInternalEntryRouteItems(route.id)).length] as const));
  const itemCountById = new Map(itemPairs);
  const publishedCount = allRoutes.filter((route) => route.public_visibility && route.status !== "draft").length;
  const activeCount = allRoutes.filter((route) => route.status === "active").length;

  return (
    <Container className="intro-grid internal-page entry-route-internal-page">
      <section className="hero internal-hero entry-route-internal-hero">
        <p className="eyebrow">rotas internas</p>
        <h1 className="hero__title">Guias de leitura</h1>
        <p className="hero__lead">
          Organize caminhos de entrada para primeira visita, tema, memória, dossiê e acompanhamento do agora.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/rotas/novo" className="button">
            Nova rota
          </Link>
          <Link href="/comecar" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel entry-route-internal-section">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allRoutes.length}</h3>
            <p>Rotas cadastradas.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicadas</p>
            <h3>{publishedCount}</h3>
            <p>Rotas liberadas para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">ativas</p>
            <h3>{activeCount}</h3>
            <p>Guias em circulação.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">passos</p>
            <h3>{itemPairs.reduce((sum, [, count]) => sum + count, 0)}</h3>
            <p>Peças já costuradas nas rotas.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em rascunho, ativo ou arquivado.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de rotas">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/rotas" : `/interno/rotas?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getEntryRouteStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Rotas registradas</h2>
          </div>
          <p className="section__lead">Cada rota abre um caminho guiado que ajuda a entrar no universo do projeto sem dispersar.</p>
        </div>

        <div className="grid-2">
          {routes.length ? (
            routes.map((route) => (
              <EntryRouteCard
                key={route.id}
                route={route}
                href={`/interno/rotas/${route.id}`}
                itemCount={itemCountById.get(route.id) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem rotas neste filtro</h3>
              <p>Crie a primeira rota para abrir a camada pública de entrada.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}