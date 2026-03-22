import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { MemoryCollectionCard } from "@/components/memory-collection-card";
import { MemoryTimelineEntryCard } from "@/components/memory-timeline-entry";
import { getMemoryCollectionCount, getMemoryTimelineEntries } from "@/lib/memory/navigation";
import { getPublishedMemoryCollections, getInternalMemoryItems } from "@/lib/memory/queries";
import { getInternalArchiveAssets } from "@/lib/archive/queries";
import { getInternalEditorialEntries } from "@/lib/entrada/queries";
import { editorialEntryStatusLabels, editorialEntryTypeLabels, type EditorialEntry } from "@/lib/entrada/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Memória interna",
  description: "Cadastro e curadoria da memória viva do VR Abandonada.",
};

const filters = ["all", "draft", "ready", "published", "archived"] as const;

type FilterValue = (typeof filters)[number];

function isFilterValue(value: string | undefined): value is FilterValue {
  return Boolean(value) && filters.includes(value as FilterValue);
}

type PageProps = {
  searchParams?: Promise<{ status?: string }>;
};

function isRecentCentralEntry(entry: EditorialEntry) {
  return (entry.entry_type === "document" || entry.entry_type === "image") && Boolean(entry.file_url);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function InternalMemoryPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = isFilterValue(resolvedSearchParams.status) ? resolvedSearchParams.status : "all";

  const [itemsResult, collectionsResult, allItemsResult, editorialEntriesResult, archiveAssetsResult] = await Promise.allSettled([
    getInternalMemoryItems({ status }),
    getPublishedMemoryCollections(),
    getInternalMemoryItems(),
    getInternalEditorialEntries(),
    getInternalArchiveAssets(),
  ]);

  const items = itemsResult.status === "fulfilled" ? itemsResult.value : [];
  const collections = collectionsResult.status === "fulfilled" ? collectionsResult.value : [];
  const allItems = allItemsResult.status === "fulfilled" ? allItemsResult.value : [];
  const timelineEntries = getMemoryTimelineEntries(allItems.filter((item) => item.published || item.editorial_status === "published"));
  const centralEntries = editorialEntriesResult.status === "fulfilled" ? editorialEntriesResult.value.filter(isRecentCentralEntry).slice(0, 6) : [];
  const archiveAssets = archiveAssetsResult.status === "fulfilled" ? archiveAssetsResult.value : [];
  const archiveByPath = new Map(archiveAssets.filter((asset) => asset.file_path).map((asset) => [asset.file_path, asset]));

  const counts = filters.reduce<Record<FilterValue, number>>(
    (acc, value) => {
      acc[value] = value === "all" ? allItems.length : allItems.filter((item) => item.editorial_status === value).length;
      return acc;
    },
    { all: 0, draft: 0, ready: 0, published: 0, archived: 0 },
  );

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">memória interna</p>
        <h1 className="hero__title">Cadastro e curadoria</h1>
        <p className="hero__lead">
          Crie, edite, publique e arquive memória sem mexer no código. O fluxo continua leve e editorial.
        </p>
        <div className="hero__actions">
          <Link href="/interno/memoria/novo" className="button">
            Nova memória
          </Link>
          <Link href="/memoria" className="button-secondary">
            Ver área pública
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">fila</p>
            <h2>Estados editoriais</h2>
          </div>
          <p className="section__lead">
            Memória funciona como arquivo vivo, mas a publicação continua explícita e controlada por estado.
          </p>
        </div>

        <div className="status-filters" aria-label="Filtro por status">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "all" ? "/interno/memoria" : `/interno/memoria?status=${filter}`}
              className={`status-chip ${status === filter ? "status-chip--active" : ""}`}
            >
              {filter} ({counts[filter]})
            </Link>
          ))}
        </div>

        <div className="grid-2" style={{ alignItems: "stretch" }}>
          {items.length ? (
            items.map((item) => (
              <article className="entry" key={item.id}>
                <span className="entry__tag">{item.collection_title || item.memory_collection}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <div className="meta-row">
                  <span>{item.period_label}</span>
                  <span>{item.editorial_status}</span>
                  <span>{item.published ? "Publicado" : "Não publicado"}</span>
                </div>
                <Link href={`/interno/memoria/${item.id}`} className="button-secondary">
                  Abrir curadoria
                </Link>
              </article>
            ))
          ) : (
            <div className="support-box">
              <h3>Sem itens neste filtro</h3>
              <p>Crie um novo item ou ajuste o estado editorial para encontrar memória na fila.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">recentes da central</p>
            <h2>O que virou base de memória.</h2>
          </div>
          <p className="section__lead">Foto ou documento guardado na entrada simplificada aparece aqui para virar memória sem se perder.</p>
        </div>

        <div className="grid-3">
          {centralEntries.length ? (
            centralEntries.map((entry) => {
              const linkedAsset = entry.file_path ? archiveByPath.get(entry.file_path) ?? null : null;

              return (
                <article key={entry.id} className={`card entry-central-review-card entry-central-review-card--${linkedAsset ? "calm" : "watch"}`}>
                  <div className="meta-row">
                    <span className="pill">{editorialEntryTypeLabels[entry.entry_type]}</span>
                    <span>{editorialEntryStatusLabels[entry.entry_status]}</span>
                    {entry.target_surface ? <span>{entry.target_surface}</span> : null}
                  </div>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary || entry.details || "Sem resumo ainda."}</p>
                  <p className="meta-row">
                    <span>{entry.territory_label || entry.place_label || "Sem território"}</span>
                    <span>{entry.actor_label || entry.source_label || "Sem ator/fonte"}</span>
                    <span>{formatDate(entry.updated_at)}</span>
                  </p>
                  <div className="stack-actions">
                    <Link href={`/interno/entrada/${entry.id}`} className="button-secondary">
                      Abrir entrada
                    </Link>
                    {linkedAsset ? (
                      <Link href={`/interno/acervo/${linkedAsset.id}`} className="button-secondary">
                        Abrir no acervo
                      </Link>
                    ) : (
                      <Link href={`/interno/memoria/novo?entry_id=${entry.id}`} className="button-secondary">
                        Levar à memória
                      </Link>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="support-box">
              <h3>Sem recentes da central</h3>
              <p>Quando subir foto ou PDF pela entrada simplificada, eles aparecem aqui para virar memória sem retrabalho.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">coleções</p>
            <h2>Recortes alimentados por dados</h2>
          </div>
          <p className="section__lead">
            As coleções deixam de ficar presas ao código e passam a existir como dados do projeto.
          </p>
        </div>

        <div className="grid-3">
          {collections.map((collection) => (
            <MemoryCollectionCard key={collection.slug} collection={collection} count={getMemoryCollectionCount(collection, allItems)} />
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">linha do tempo</p>
            <h2>Ordem editorial da memória</h2>
          </div>
          <p className="section__lead">
            O rank da timeline define a sequência pública. Ajuste isso sem refazer o arquivo inteiro.
          </p>
        </div>

        <div className="timeline-rail">
          {timelineEntries.length ? (
            timelineEntries.map((entry) => <MemoryTimelineEntryCard key={`${entry.year}-${entry.label}`} entry={entry} />)
          ) : (
            <div className="support-box">
              <p>Sem marcos publicados ainda.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
