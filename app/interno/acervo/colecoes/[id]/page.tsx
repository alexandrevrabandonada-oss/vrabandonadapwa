import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { ArchiveCollectionForm } from "@/components/archive-collection-form";
import { Container } from "@/components/container";
import { getInternalArchiveAssetsByCollectionSlug } from "@/lib/archive/queries";
import { getInternalArchiveCollectionById } from "@/lib/archive/collections";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Editar coleção",
  description: "Curadoria interna de um recorte do acervo.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalArchiveCollectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const collection = await getInternalArchiveCollectionById(id);
  if (!collection) {
    notFound();
  }

  const assets = await getInternalArchiveAssetsByCollectionSlug(collection.slug);

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">coleções internas</p>
        <h1 className="hero__title">{collection.title}</h1>
        <p className="hero__lead">
          {collection.excerpt || collection.description || "Recorte editorial do arquivo vivo."}
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/acervo/colecoes" className="button-secondary">
            Voltar às coleções
          </Link>
          <Link href={`/acervo/colecoes/${collection.slug}`} className="button-secondary">
            Abrir no público
          </Link>
          <Link href={`/interno/acervo/novo?collection_slug=${collection.slug}`} className="button">
            Novo anexo nesta coleção
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <article className="support-box">
            <h3>Assets ligados</h3>
            <p>{assets.length} objeto(s) de acervo amarrado(s) a este recorte.</p>
          </article>
          <article className="support-box">
            <h3>Status</h3>
            <ul>
              <li>Slug: {collection.slug}</li>
              <li>Visibilidade: {collection.public_visibility ? "pública" : "interna"}</li>
              <li>Destaque: {collection.featured ? "sim" : "não"}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Atualizar coleção</h2>
          </div>
          <p className="section__lead">O slug fica travado aqui para não quebrar os vínculos dos assets já organizados.</p>
        </div>

        <ArchiveCollectionForm collection={collection} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">materiais da coleção</p>
            <h2>Objetos vinculados</h2>
          </div>
          <p className="section__lead">A associação acontece no cadastro do asset, mas a coleção mostra a trilha completa.</p>
        </div>

        <div className="grid-3">
          {assets.length ? (
            assets.map((asset) => (
              <ArchiveAssetCard
                key={asset.id}
                asset={asset}
                href={`/interno/acervo/${asset.id}`}
                actionLabel="Abrir anexo"
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem assets nesta coleção</h3>
              <p>Use o cadastro de anexo para marcar o campo Coleção e alimentar este recorte.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
