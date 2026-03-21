import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { getPublicSearchIndex, getSearchHotTerms } from "@/lib/search/index";
import { getSearchContentTypeLabel } from "@/lib/search/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Busca interna",
  description: "Diagnóstico do índice público de busca do VR Abandonada.",
};

export default async function InternalSearchPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const index = await getPublicSearchIndex();
  const byType = index.reduce<Record<string, number>>((acc, item) => {
    acc[item.contentType] = (acc[item.contentType] ?? 0) + 1;
    return acc;
  }, {});
  const hotTerms = getSearchHotTerms().slice(0, 8);

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">busca interna</p>
        <h1 className="hero__title">Diagnóstico do índice público.</h1>
        <p className="hero__lead">
          A busca é derivada automaticamente do conteúdo público já publicado. Não há reindexação manual porque não existe uma camada separada de indexação.
        </p>
        <div className="hero__actions">
          <Link href="/buscar" className="button">
            Ver público
          </Link>
          <Link href="/interno" className="button-secondary">
            Voltar ao painel
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens indexados</p>
            <h3>{index.length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipos ativos</p>
            <h3>{Object.keys(byType).length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">buscas frequentes</p>
            <h3>{hotTerms.length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">fonte</p>
            <h3>Pública</h3>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por tipo</p>
            <h2>O que entra no índice.</h2>
          </div>
          <p className="section__lead">
            Se algo não aparece, a correção passa pela publicação da peça ou pela revisão da camada pública correspondente.
          </p>
        </div>

        <div className="grid-3">
          {Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <article className="card" key={type}>
                <p className="pill">{getSearchContentTypeLabel(type)}</p>
                <h3>{count}</h3>
              </article>
            ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">termos úteis</p>
            <h2>Atalhos editoriais de referência.</h2>
          </div>
          <p className="section__lead">Usados para testar se a busca está atravessando o vocabulário real do projeto.</p>
        </div>

        <div className="status-filters">
          {hotTerms.map((term) => (
            <span key={term} className="status-chip">
              {term}
            </span>
          ))}
        </div>
      </section>
    </Container>
  );
}
