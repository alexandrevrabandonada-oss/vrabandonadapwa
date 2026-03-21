import { redirect } from "next/navigation";

import { EditionForm } from "@/components/edition-form";
import { Container } from "@/components/container";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { buildEntrySeed } from "@/lib/enriquecimento/resolve";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function InternalEditionsNewPage({ searchParams }: { searchParams?: Promise<{ entry_id?: string }> }) {
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
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">nova edição</p>
        <h1 className="hero__title">Criar síntese pública.</h1>
        <p className="hero__lead">Use esta ficha para condensar o radar, uma campanha, um tema ou um arquivo em circulação.</p>
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
                <li>Ano: {seed.yearLabel || "não informado"}</li>
                <li>Eixo: {seed.axisLabel || "não informado"}</li>
              </ul>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section internal-panel">
        <EditionForm
          initialValues={
            seed
              ? {
                  title: seed.title,
                  slug: seed.slug,
                  excerpt: seed.excerpt,
                  description: seed.description,
                  edition_type: entry?.entry_type === "post" ? "city_pulse" : entry?.entry_type === "document" ? "archive" : "special",
                  period_label: seed.yearLabel,
                  published_at: "",
                  cover_image_url: "",
                  sort_order: 0,
                  public_visibility: false,
                  status: "draft",
                  featured: false,
                }
              : undefined
          }
        />
      </section>
    </Container>
  );
}
