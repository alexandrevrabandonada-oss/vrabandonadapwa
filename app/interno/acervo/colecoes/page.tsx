import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { ArchiveCollectionCard } from "@/components/archive-collection-card";
import { Container } from "@/components/container";
import { getInternalArchiveAssets } from "@/lib/archive/queries";
import { getInternalArchiveCollections } from "@/lib/archive/collections";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Coleções do acervo",
  description: "Curadoria leve das coleções do arquivo vivo.",
};

export default async function InternalArchiveCollectionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const collections = await getInternalArchiveCollections();
  const assets = await getInternalArchiveAssets();
  const countBySlug = new Map(collections.map((collection) => [collection.slug, assets.filter((asset) => asset.collection_slug === collection.slug).length]));

  return (
    <Container className="intro-grid internal-page archive-page">
      <section className="hero internal-hero">
        <p className="eyebrow">coleções internas</p>
        <h1 className="hero__title">Dossiês leves do acervo</h1>
        <p className="hero__lead">
          Organize materiais em recortes editoriais sem transformar o acervo em catalogação rígida.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/acervo/colecoes/novo" className="button">
            Nova coleção
          </Link>
          <Link href="/interno/acervo" className="button-secondary">
            Voltar ao acervo
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">coleções</p>
            <h3>{collections.length}</h3>
            <p>Recortes editoriais cadastrados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">públicas</p>
            <h3>{collections.filter((collection) => collection.public_visibility).length}</h3>
            <p>Coleções abertas ao público.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">materiais</p>
            <h3>{assets.filter((asset) => asset.collection_slug).length}</h3>
            <p>Anexos já ligados a um recorte.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lista</p>
            <h2>Coleções registradas</h2>
          </div>
          <p className="section__lead">Cada coleção pode ser editada sem mexer no código e serve como recorte público do arquivo vivo.</p>
        </div>

        <div className="grid-2">
          {collections.length ? (
            collections.map((collection) => (
              <ArchiveCollectionCard
                key={collection.id}
                collection={collection}
                href={`/interno/acervo/colecoes/${collection.id}`}
                assetCount={countBySlug.get(collection.slug) ?? 0}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem coleções cadastradas</h3>
              <p>Crie a primeira coleção para começar a curadoria pública do acervo.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
