import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { signOutAction } from "@/app/interno/actions";
import { getInternalEditorialItems } from "@/lib/editorial/queries";
import { editorialReviewStatusLabels, editorialStatusLabels, type EditorialReviewStatus, type EditorialStatus } from "@/lib/editorial/types";

export const metadata: Metadata = {
  title: "Editorial",
  description: "Fila de itens editoriais públicos e rascunhos internos.",
};

const filters = ["all", "draft", "in_review", "ready", "published", "archived"] as const;

type FilterValue = (typeof filters)[number];

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

export default async function InternalEditorialPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";

  const items = await getInternalEditorialItems({ status });

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">editorial interno</p>
        <h1 className="hero__title">Arquivo público</h1>
        <p className="hero__lead">
          Rascunhos, revisões e itens publicados em fila editorial.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/intake" className="button-secondary">Voltar à triagem</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">filtro</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">
            A publicação pública só aparece quando o item for explicitamente marcado.
          </p>
        </div>

        <div className="status-filters">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/editorial" : `/interno/editorial?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter}
            </Link>
          ))}
        </div>

        <div className="grid-2" style={{ alignItems: "stretch" }}>
          {items.length ? (
            items.map((item) => (
              <article className="entry" key={item.id}>
                <span className="entry__tag">{item.featured ? "Destaque" : item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <div className="meta-row">
                  <span>{editorialStatusLabels[item.editorial_status as EditorialStatus] ?? item.editorial_status}</span>
                  <span>{editorialReviewStatusLabels[item.review_status as EditorialReviewStatus] ?? item.review_status}</span>
                  <span>{item.published ? "Publicado" : "Não publicado"}</span>
                </div>
                <Link href={`/interno/editorial/${item.id}`} className="button-secondary">
                  Abrir edição
                </Link>
              </article>
            ))
          ) : (
            <div className="support-box">
              <h3>Sem itens neste filtro</h3>
              <p>Crie um rascunho a partir de uma submissão triada ou ajuste o filtro.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
