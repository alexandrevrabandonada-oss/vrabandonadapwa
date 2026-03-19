import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { MemoryForm } from "@/components/memory-form";
import { signOutAction } from "@/app/interno/actions";
import { getPublishedMemoryCollections, getInternalMemoryById } from "@/lib/memory/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Editar memória",
  description: "Curadoria interna de um item de memória viva.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalMemoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const item = await getInternalMemoryById(id);
  if (!item) {
    notFound();
  }

  const collections = await getPublishedMemoryCollections();

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">memória interna</p>
        <h1 className="hero__title">{item.title}</h1>
        <p className="hero__lead">
          {item.editorial_status} · {item.published ? "Publicado" : "Não publicado"}
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/memoria" className="button-secondary">Voltar à fila</Link>
          <Link href={`/memoria/${item.slug}`} className="button-secondary">Ver público</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <article className="support-box">
            <h3>Resumo operacional</h3>
            <ul>
              <li>Coleção: {item.collection_title || item.collection_slug || item.memory_collection}</li>
              <li>Período: {item.period_label}</li>
              <li>Local: {item.place_label || "não informado"}</li>
              <li>Ano inicial: {item.year_start || "não"}</li>
              <li>Ano final: {item.year_end || "não"}</li>
              <li>Destaque: {item.featured ? "sim" : "não"}</li>
              <li>Timeline rank: {item.timeline_rank ?? "não definido"}</li>
            </ul>
          </article>
          <article className="support-box">
            <h3>Prévia pública</h3>
            <EditorialCover
              title={item.title}
              primaryTag={item.memory_type}
              seriesTitle={item.collection_title || item.memory_collection}
              coverImageUrl={item.cover_image_url}
              coverVariant={item.highlight_in_memory ? "ember" : "concrete"}
            />
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Atualize e publique</h2>
          </div>
          <p className="section__lead">
            O formulário abaixo grava a memória, controla a coleção e mantém o arquivo separado da camada pública.
          </p>
        </div>

        <MemoryForm item={item} collections={collections} />
      </section>
    </Container>
  );
}
