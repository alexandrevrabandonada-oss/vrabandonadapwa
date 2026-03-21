import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { SearchResultCard } from "@/components/search-result-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublicSearchIndex, getSearchHotTerms, searchPublicContent } from "@/lib/search/index";
import { getSearchContentTypeLabel } from "@/lib/search/navigation";
import type { SearchSortMode } from "@/lib/search/types";
import { ReadingTrailPanel } from "@/components/pwa-reading-trail";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busque temas, casos, lugares, atores, campanhas, impactos e documentos no VR Abandonada.",
  openGraph: {
    title: "Buscar | VR Abandonada",
    description: "Busque temas, casos, lugares, atores, campanhas, impactos e documentos no VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buscar | VR Abandonada",
    description: "Busque temas, casos, lugares, atores, campanhas, impactos e documentos no VR Abandonada.",
    images: [getHomeOpenGraphImagePath()],
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildSearchHref(
  current: { q: string; type: string; territory: string; actor: string; sort: SearchSortMode },
  next: Partial<{ q: string; type: string; territory: string; actor: string; sort: SearchSortMode }>,
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };

  if (merged.q.trim()) {
    params.set("q", merged.q.trim());
  }

  if (merged.type && merged.type !== "all") {
    params.set("type", merged.type);
  }

  if (merged.territory && merged.territory !== "all") {
    params.set("territory", merged.territory);
  }

  if (merged.actor && merged.actor !== "all") {
    params.set("actor", merged.actor);
  }

  if (merged.sort && merged.sort !== "recent") {
    params.set("sort", merged.sort);
  }

  const query = params.toString();
  return query ? `/buscar?${query}` : "/buscar";
}

function getSelectOptions(values: Array<{ label: string; count: number }>) {
  return values
    .filter((value) => value.count > 0)
    .slice(0, 10)
    .map((value) => value.label);
}

export default async function BuscarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const query = firstParam(resolvedSearchParams.q);
  const contentType = firstParam(resolvedSearchParams.type) || "all";
  const territory = firstParam(resolvedSearchParams.territory) || "all";
  const actor = firstParam(resolvedSearchParams.actor) || "all";
  const sort = (firstParam(resolvedSearchParams.sort) as SearchSortMode) || (query ? "relevant" : "recent");

  const search = await searchPublicContent({ query, contentType, territory, actor, sort });
  const publicIndex = await getPublicSearchIndex();
  const hotTerms = getSearchHotTerms().slice(0, 8);
  const topResult = search.results[0] ?? publicIndex[0] ?? null;
  const selectedCount = [contentType, territory, actor].filter((value) => value && value !== "all").length;

  const currentParams = { q: query, type: contentType, territory, actor, sort };
  const territoryOptions = getSelectOptions(search.facets.territories);
  const actorOptions = getSelectOptions(search.facets.actors);

  return (
    <Container className="intro-grid search-page">
      <section className="hero hero--split search-hero">
        <div className="hero__copy">
          <p className="eyebrow">busca transversal</p>
          <h1 className="hero__title">Encontrar rápido.</h1>
          <p className="hero__lead">
            Busque temas, casos, lugares, atores, campanhas, impactos, memórias e documentos em uma única consulta.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">busca pública</span>
            <span className="home-hero__signal">descoberta editorial</span>
            <span className="home-hero__signal">retorno recorrente</span>
          </div>
          <div className="hero__actions">
            <Link href="/agora" className="button">
              Ver radar
            </Link>
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar
            </Link>
            <Link href="/salvos" className="button-secondary">
              Salvos
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">como usar</p>
          <h2>Um termo, um lugar, um caso ou um responsável.</h2>
          <p>
            Se não souber por onde entrar, comece pelo nome mais óbvio. Depois refine por tipo, território ou ator.
          </p>
          <div className="stack-actions">
            <Link href="/comecar" className="button-secondary">
              Abrir guias
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ler o método
            </Link>
          </div>
        </article>
      </section>

      <ReadingTrailPanel compact />

      <section className="section search-toolbar-section">
        <form method="get" className="search-toolbar">
          <div className="grid-2 search-toolbar__header">
            <div>
              <p className="eyebrow">consulta pública</p>
              <h2>Procure pelo que importa.</h2>
            </div>
            <p className="section__lead">
              O índice cruza pautas, memória, acervo, dossiês, campanhas, impactos, territórios, atores, padrões, edições, eixos, rotas e participação.
            </p>
          </div>

          <div className="search-toolbar__fields">
            <label className="field">
              <span>Buscar</span>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="CSN, Vila Santa Cecília, acidente, hospital, memória..."
                autoComplete="off"
              />
            </label>

            <label className="field">
              <span>Tipo</span>
              <select name="type" defaultValue={contentType}>
                <option value="all">Todos</option>
                {search.facets.types.map((facet) => (
                  <option key={facet.value} value={facet.value}>
                    {facet.label} ({facet.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Território</span>
              <select name="territory" defaultValue={territory}>
                <option value="all">Todos</option>
                {territoryOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Ator</span>
              <select name="actor" defaultValue={actor}>
                <option value="all">Todos</option>
                {actorOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Ordenar</span>
              <select name="sort" defaultValue={sort}>
                <option value="relevant">Mais relevantes</option>
                <option value="recent">Mais recentes</option>
              </select>
            </label>
          </div>

          <div className="search-toolbar__actions stack-actions">
            <button type="submit" className="button">
              Buscar
            </button>
            <Link href="/buscar" className="button-secondary">
              Limpar
            </Link>
            {selectedCount ? <span className="pwa-install-status">Filtros ativos: {selectedCount}</span> : null}
          </div>
        </form>
      </section>

      <section className="section search-discovery-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">buscas frequentes</p>
            <h2>Atalhos para quem ainda está encontrando o termo.</h2>
          </div>
          <p className="section__lead">
            Quando a palavra ainda não está clara, comece pelo tema, pela cidade ou pelo nome recorrente no conflito.
          </p>
        </div>

        <div className="status-filters search-hint-filters">
          {hotTerms.map((term) => (
            <Link key={term} href={buildSearchHref(currentParams, { q: term })} className={`status-chip ${query === term ? "status-chip--active" : ""}`}>
              {term}
            </Link>
          ))}
        </div>
      </section>

      <section className="section search-results-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">{query ? "resultados" : "pontos de entrada"}</p>
            <h2>
              {search.total} resultado{search.total === 1 ? "" : "s"} encontrado{search.total === 1 ? "" : "s"}
            </h2>
          </div>
          <p className="section__lead">
            {query
              ? `Mostrando o que mais se aproxima de “${query}” no ecossistema público do VR Abandonada.`
              : "Sem termo definido, a página abre uma leitura editorial do que está mais visível no arquivo vivo."}
          </p>
        </div>

        <div className="search-facet-row">
          {search.facets.types.map((facet) => (
            <Link
              key={facet.value}
              href={buildSearchHref(currentParams, { type: facet.value })}
              className={`status-chip ${contentType === facet.value ? "status-chip--active" : ""}`}
            >
              {facet.label} ({facet.count})
            </Link>
          ))}
        </div>

        <div className="search-facet-row search-facet-row--secondary">
          {search.facets.territories.slice(0, 8).map((facet) => (
            <Link
              key={facet.value}
              href={buildSearchHref(currentParams, { territory: facet.value })}
              className={`status-chip ${territory === facet.value ? "status-chip--active" : ""}`}
            >
              {facet.label}
            </Link>
          ))}
          {search.facets.actors.slice(0, 8).map((facet) => (
            <Link
              key={facet.value}
              href={buildSearchHref(currentParams, { actor: facet.value })}
              className={`status-chip ${actor === facet.value ? "status-chip--active" : ""}`}
            >
              {facet.label}
            </Link>
          ))}
        </div>

        {search.results.length ? (
          <div className="search-results-grid grid-2">
            {search.results.slice(0, 24).map((item) => (
              <SearchResultCard key={item.id} item={item} query={query} compact />
            ))}
          </div>
        ) : (
          <article className="support-box search-empty">
            <p className="eyebrow">nenhum resultado</p>
            <h3>Troque o termo ou solte os filtros.</h3>
            <p>
              A busca funciona melhor quando você entra pelo nome de um caso, lugar, ator ou documento.
            </p>
            <div className="stack-actions">
              <Link href="/agora" className="button">
                Ver radar
              </Link>
              <Link href="/acompanhar" className="button-secondary">
                Acompanhar
              </Link>
              <Link href="/comecar" className="button-secondary">
                Começar por aqui
              </Link>
            </div>
          </article>
        )}
      </section>

      {topResult ? (
        <section className="section search-highlight-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">destaque</p>
              <h2>Um ponto de partida editorial.</h2>
            </div>
            <p className="section__lead">
              Quando a busca encontra algo forte, vale abrir a peça principal e seguir a trilha para salvar ou acompanhar.
            </p>
          </div>

          <div className="grid-2">
            <article className="support-box home-callout home-callout--accent">
              <span className="pill">{getSearchContentTypeLabel(topResult.contentType)}</span>
              <h3>{topResult.title}</h3>
              <p>{topResult.excerpt}</p>
              <div className="stack-actions">
                <Link href={topResult.href} className="button" aria-label={`Abrir ${topResult.kindLabel}: ${topResult.title}`}>
                  Abrir
                </Link>
                <Link href="/salvos" className="button-secondary" aria-label={`Salvar ${topResult.title}`}>
                  Ver salvos
                </Link>
                <Link href="/linha-do-tempo" className="button-secondary" aria-label={`Ver a linha do tempo relacionada a ${topResult.title}`}>
                  Tempo
                </Link>
                {topResult.followKind ? (
                  <Link href="/acompanhar" className="button-secondary" aria-label={`Acompanhar ${topResult.title}`}>
                    Acompanhar
                  </Link>
                ) : null}
              </div>
            </article>

            <article className="support-box home-callout">
              <p className="eyebrow">sugestão editorial</p>
              <h3>Busque por recorrência, não só por palavra.</h3>
              <p>
                Tente combinar tema, lugar e nome próprio para atravessar camadas: um ator, um território e o caso que volta a aparecer.
              </p>
              <div className="stack-actions">
                <Link href="/territorios" className="button-secondary">
                  Ver territórios
                </Link>
                <Link href="/atores" className="button-secondary">
                  Ver atores
                </Link>
                <Link href="/padroes" className="button-secondary">
                  Ver padrões
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section search-bridge-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">descoberta contínua</p>
            <h2>Da busca para o retorno local.</h2>
          </div>
          <p className="section__lead">
            O que você encontra aqui pode ir para <Link href="/salvos">Salvos</Link> ou para <Link href="/acompanhar">Acompanhar</Link> sem sair da leitura.
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Salvar uma leitura</h3>
            <p>Guarde uma peça específica para voltar depois no celular.</p>
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
          </article>
          <article className="card">
            <h3>Acompanhar uma frente</h3>
            <p>Escolha um eixo, território, dossiê, campanha ou ator e acompanhe o movimento localmente.</p>
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar
            </Link>
          </article>
          <article className="card">
            <h3>Voltar ao momento</h3>
            <p>Se a busca não der o termo exato, o radar ajuda a reencontrar o que está quente agora.</p>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}










