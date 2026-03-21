import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { MemoryForm } from "@/components/memory-form";
import { getPublishedMemoryCollections } from "@/lib/memory/queries";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { buildEntrySeed } from "@/lib/enriquecimento/resolve";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nova memória",
  description: "Criar um item de memória viva para o arquivo público.",
};

type PageProps = {
  searchParams?: Promise<{ entry_id?: string }>;
};

export default async function InternalMemoryNewPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const collections = await getPublishedMemoryCollections();
  const entry = resolvedSearchParams.entry_id ? await getInternalEditorialEntryById(resolvedSearchParams.entry_id) : null;
  const seed = entry ? buildEntrySeed(entry) : null;

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">memória interna</p>
        <h1 className="hero__title">Nova memória</h1>
        <p className="hero__lead">Cadastre um recorte leve e já pense nele como peça do arquivo público.</p>
        <div className="hero__actions">          <Link href="/interno/memoria" className="button-secondary">Voltar à fila</Link>
          <Link href="/interno/enriquecer" className="button-secondary">Abrir enriquecimento</Link>
        </div>
      </section>

      {entry && seed ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <article className="support-box">
              <p className="eyebrow">entrada de origem</p>
              <h3>{entry.title}</h3>
              <p>{seed.excerpt}</p>
            </article>
            <article className="support-box">
              <p className="eyebrow">o que já veio pronto</p>
              <ul>
                <li>Território: {seed.territoryLabel || "não informado"}</li>
                <li>Fonte: {seed.sourceLabel || "não informada"}</li>
                <li>Ano: {seed.yearLabel || "não informado"}</li>
                <li>Eixo: {seed.axisLabel || "não informado"}</li>
              </ul>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">cadastro</p>
            <h2>Preencha os campos da memória</h2>
          </div>
          <p className="section__lead">
            O formulário salva em rascunho por padrão e só vai ao público quando o estado for publicado.
          </p>
        </div>

        <MemoryForm
          collections={collections}
          initialValues={
            seed
              ? {
                  title: seed.title,
                  slug: seed.slug,
                  excerpt: seed.excerpt,
                  body: seed.body,
                  memory_type: entry?.entry_type === "image" ? "photo" : entry?.entry_type === "document" ? "document" : "story",
                  editorial_status: "draft",
                  period_label: seed.yearLabel || entry?.year_label || "",
                  year_start: seed.approximateYear,
                  year_end: seed.approximateYear,
                  place_label: seed.placeLabel,
                  collection_slug: seed.axisLabel ? seed.axisLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "",
                  collection_title: seed.axisLabel || "Entrada de enriquecimento",
                  collection_description: seed.description,
                  related_editorial_slug: entry?.axis_label ? entry.axis_label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "",
                  related_series_slug: entry?.axis_label ? entry.axis_label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "",
                  timeline_rank: seed.approximateYear,
                  source_note: seed.sourceLabel,
                  featured: false,
                }
              : undefined
          }
        />
      </section>
    </Container>
  );
}

