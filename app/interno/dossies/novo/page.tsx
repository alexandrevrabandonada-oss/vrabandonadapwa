import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { DossierForm } from "@/components/dossier-form";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { buildEntrySeed } from "@/lib/enriquecimento/resolve";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Novo dossiê",
  description: "Criar uma nova linha de investigação pública.",
};

type PageProps = {
  searchParams?: Promise<{ entry_id?: string }>;
};

export default async function NewInternalDossierPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const entry = resolvedSearchParams.entry_id ? await getInternalEditorialEntryById(resolvedSearchParams.entry_id) : null;
  const seed = entry ? buildEntrySeed(entry) : null;

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">Novo dossiê</h1>
        <p className="hero__lead">
          Crie uma investigação pública com pergunta, território e caminho de leitura antes de ligar as peças.
        </p>
        <div className="hero__actions">        </div>
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
              <p className="eyebrow">sinal rápido</p>
              <ul>
                <li>Território: {seed.territoryLabel || "não informado"}</li>
                <li>Período: {seed.yearLabel || "não informado"}</li>
                <li>Eixo: {seed.axisLabel || "não informado"}</li>
              </ul>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <DossierForm
          initialValues={
            seed
              ? {
                  title: seed.title,
                  slug: seed.slug,
                  excerpt: seed.excerpt,
                  description: seed.description,
                  lead_question: seed.leadQuestion,
                  period_label: seed.yearLabel,
                  territory_label: seed.territoryLabel || seed.placeLabel,
                  cover_image_url: "",
                  sort_order: 0,
                  status: "draft",
                  public_visibility: false,
                  featured: false,
                }
              : undefined
          }
        />
      </section>
    </Container>
  );
}

