import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { Container } from "@/components/container";
import { PlaceHubCard } from "@/components/place-hub-card";
import { getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { getInternalPlaceHubs, getInternalPlaceHubLinks } from "@/lib/territories/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Territórios internos",
  description: "Curadoria e operação dos lugares vivos do VR Abandonada.",
};

const filters = ["all", "active", "monitoring", "archive", "draft"] as const;
type FilterValue = (typeof filters)[number];

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

export default async function InternalTerritoriesPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";
  const territories = await getInternalPlaceHubs({ status });
  const allTerritories = status === "all" ? territories : await getInternalPlaceHubs({ status: "all" });
  const linkPairs = await Promise.all(allTerritories.map(async (item) => [item.id, await getInternalPlaceHubLinks(item.id)] as const));
  const linkCountById = new Map(linkPairs.map(([id, links]) => [id, links.length]));
  const publishedCount = allTerritories.filter((item) => item.public_visibility).length;
  const activeCount = allTerritories.filter((item) => item.status === "active" || item.status === "monitoring").length;

  return (
    <Container className="intro-grid internal-page territory-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">territórios internos</p>
        <h1 className="hero__title">Lugar vivo</h1>
        <p className="hero__lead">Organize bairros, marcos e pontos críticos para que memória, arquivo e impacto tenham endereço.</p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/territorios/novo" className="button">
            Novo lugar
          </Link>
          <Link href="/territorios" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allTerritories.length}</h3>
            <p>Lugares cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">publicados</p>
            <h3>{publishedCount}</h3>
            <p>Locais liberados para o público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">em foco</p>
            <h3>{activeCount}</h3>
            <p>Lugares ativos ou em monitoramento.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkPairs.reduce((sum, [, links]) => sum + links.length, 0)}</h3>
            <p>Peças conectadas aos lugares.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados territoriais</h2>
          </div>
          <p className="section__lead">Filtre rápido o que está em preparação, ativo, monitoramento, arquivo ou rascunho.</p>
        </div>

        <div className="status-filters" aria-label="Filtro de território">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/territorios" : `/interno/territorios?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter === "all" ? "todos" : getPlaceHubStatusLabel(filter)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Lugares registrados</h2>
          </div>
          <p className="section__lead">Cada território conecta endereço, memória, acervo e consequência pública.</p>
        </div>

        <div className="grid-2">
          {territories.length ? (
            territories.map((item) => (
              <PlaceHubCard key={item.id} placeHub={item} href={`/interno/territorios/${item.id}`} itemCount={linkCountById.get(item.id) ?? 0} />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem território neste filtro</h3>
              <p>Crie o primeiro lugar para organizar a leitura territorial do projeto.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
