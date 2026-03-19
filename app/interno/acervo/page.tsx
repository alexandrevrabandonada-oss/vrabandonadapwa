import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/interno/actions";
import { ArchiveAssetCard } from "@/components/archive-asset-card";
import { Container } from "@/components/container";
import { getInternalArchiveCollections } from "@/lib/archive/collections";
import { getInternalArchiveAssets } from "@/lib/archive/queries";
import { getInternalEditorialItems } from "@/lib/editorial/queries";
import { getInternalMemoryItems } from "@/lib/memory/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Acervo interno",
  description: "Fontes, anexos e materiais-base do arquivo vivo.",
};

type PageProps = {
  searchParams?: Promise<{ visibility?: string; collection?: string }>;
};

const visibilityFilters = ["all", "public", "private"] as const;

type VisibilityFilter = (typeof visibilityFilters)[number];

function isVisibilityFilter(value: string | undefined): value is VisibilityFilter {
  return Boolean(value) && visibilityFilters.includes(value as VisibilityFilter);
}

export default async function InternalArchivePage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const visibility = isVisibilityFilter(resolvedSearchParams.visibility) ? resolvedSearchParams.visibility : "all";
  const activeCollection = resolvedSearchParams.collection ?? "";

  const allAssets = await getInternalArchiveAssets();
  const collections = await getInternalArchiveCollections();
  const assets =
    visibility === "all"
      ? activeCollection
        ? await getInternalArchiveAssets({ collectionSlug: activeCollection })
        : allAssets
      : await getInternalArchiveAssets({ visibility, collectionSlug: activeCollection || undefined });
  const memoryItems = await getInternalMemoryItems();
  const editorialItems = await getInternalEditorialItems();

  const memoryById = new Map(memoryItems.map((memory) => [memory.id, memory.title]));
  const editorialById = new Map(editorialItems.map((editorial) => [editorial.id, editorial.title]));
  const publicCount = allAssets.filter((asset) => asset.public_visibility).length;
  const linkedCount = allAssets.filter((asset) => asset.memory_item_id || asset.editorial_item_id).length;
  const collectionCount = allAssets.filter((asset) => asset.collection_slug).length;

  return (
    <Container className="intro-grid internal-page archive-page">
      <section className="hero internal-hero">
        <p className="eyebrow">acervo interno</p>
        <h1 className="hero__title">Fontes e anexos</h1>
        <p className="hero__lead">
          Suba fotos, scans, PDFs e documentos-base. O acervo sustenta a memória sem virar um DAM pesado.
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sair
            </button>
          </form>
          <Link href="/interno/acervo/novo" className="button">
            Novo anexo
          </Link>
          <Link href="/interno/acervo/colecoes" className="button-secondary">
            Coleções
          </Link>
          <Link href="/interno/memoria" className="button-secondary">
            Ir para memória
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">itens</p>
            <h3>{allAssets.length}</h3>
            <p>Anexos cadastrados no acervo.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">públicos</p>
            <h3>{publicCount}</h3>
            <p>Objetos liberados para a camada pública.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{linkedCount}</h3>
            <p>Materiais ligados a memória ou pauta.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">coleções</p>
            <h3>{collectionCount}</h3>
            <p>Assets já encaixados em recortes editoriais.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Visibilidade</h2>
          </div>
          <p className="section__lead">Filtre rapidamente o que já pode circular e o que ainda precisa de curadoria.</p>
        </div>

        <div className="status-filters" aria-label="Filtro por visibilidade">
          {visibilityFilters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/acervo" : `/interno/acervo?visibility=${filter}${activeCollection ? `&collection=${activeCollection}` : ""}`}
              className={`status-chip ${visibility === filter ? "status-chip--active" : ""}`}
            >
              {filter}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">coleções</p>
            <h2>Recortes editoriais</h2>
          </div>
          <p className="section__lead">A coleção ajuda a operar o arquivo por linhas de investigação, não por acumulação crua.</p>
        </div>

        <div className="status-filters" aria-label="Filtro por coleção">
          <Link
            href={visibility === "all" ? "/interno/acervo" : `/interno/acervo?visibility=${visibility}`}
            className={`status-chip ${!activeCollection ? "status-chip--active" : ""}`}
          >
            Todas
          </Link>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/interno/acervo?collection=${collection.slug}${visibility !== "all" ? `&visibility=${visibility}` : ""}`}
              className={`status-chip ${activeCollection === collection.slug ? "status-chip--active" : ""}`}
            >
              {collection.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acervo</p>
            <h2>Objetos registrados</h2>
          </div>
          <p className="section__lead">Cada card abaixo carrega o lastro documental do projeto, não só a narrativa final.</p>
        </div>

        <div className="grid-3">
          {assets.length ? (
            assets.map((asset) => (
              <ArchiveAssetCard
                key={asset.id}
                asset={asset}
                href={`/interno/acervo/${asset.id}`}
                actionLabel="Abrir anexo"
                memoryLabel={asset.memory_item_id ? memoryById.get(asset.memory_item_id) ?? null : null}
                editorialLabel={asset.editorial_item_id ? editorialById.get(asset.editorial_item_id) ?? null : null}
                collectionLabel={asset.collection_slug ? collections.find((collection) => collection.slug === asset.collection_slug)?.title ?? null : null}
              />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem anexos neste filtro</h3>
              <p>Crie o primeiro objeto de acervo ou ajuste a visibilidade para ver material publicado.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">lote pequeno</p>
            <h2>Operação rápida</h2>
          </div>
          <p className="section__lead">
            Use o lote pequeno para subir material bruto primeiro e completar os metadados logo depois.
          </p>
        </div>

        <div className="support-box">
          <p>Envie vários arquivos de uma vez, vincule à memória e deixe a publicação pública desativada até revisar o material.</p>
          <Link href="/interno/acervo/novo" className="button-secondary">
            Iniciar lote
          </Link>
        </div>
      </section>
    </Container>
  );
}
