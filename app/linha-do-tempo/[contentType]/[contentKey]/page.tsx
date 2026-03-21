import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { DeepPageWayfinding } from "@/components/deep-page-wayfinding";
import { FollowButton } from "@/components/follow-button";
import { SaveReadButton } from "@/components/save-read-button";
import { TimelineEntryCard } from "@/components/timeline-entry-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getDossierUpdateNarrativeLabel } from "@/lib/dossiers/updates";
import { getDossierUpdatePreviewText } from "@/lib/dossiers/updates";
import { getPublishedDossierBySlug, getPublishedDossierUpdates } from "@/lib/dossiers/queries";
import { getTimelineContentTypeLabel, getTimelineDateBasisLabel, getTimelineEntryHref } from "@/lib/timeline/navigation";
import { getTimelineHighlightHref } from "@/lib/timeline/highlights";
import { getPublishedTimelineEntries, getTimelineEntryByContent, getTimelineRelatedEntries } from "@/lib/timeline/queries";
import type { SearchContentType } from "@/lib/search/types";

export const dynamic = "force-dynamic";

type Params = {
  contentType: string;
  contentKey: string;
};

function firstSentence(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const index = trimmed.search(/[.!?]/);
  if (index === -1) return trimmed;
  return trimmed.slice(0, index + 1);
}

async function getResolvedEntry(params: Params) {
  return getTimelineEntryByContent(params.contentType as SearchContentType, params.contentKey);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const entry = await getResolvedEntry(resolved);

  if (!entry) {
    return {
      title: "Linha do tempo",
      description: "Cronologia transversal do VR Abandonada.",
      openGraph: {
        title: "Linha do tempo | VR Abandonada",
        description: "Cronologia transversal do VR Abandonada.",
        type: "website",
        images: [getHomeOpenGraphImagePath()],
      },
      twitter: {
        card: "summary_large_image",
        title: "Linha do tempo | VR Abandonada",
        description: "Cronologia transversal do VR Abandonada.",
        images: [getHomeOpenGraphImagePath()],
      },
    };
  }

  const title = `${entry.title} | Linha do tempo`;
  const description = entry.excerpt || entry.sourceNote || `Marco temporal de ${getTimelineContentTypeLabel(entry.contentType)}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getHomeOpenGraphImagePath()],
    },
  };
}

export default async function TimelineEntryPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const [entry, allEntries] = await Promise.all([getResolvedEntry(resolved), getPublishedTimelineEntries()]);

  if (!entry) {
    notFound();
  }

  if (entry.contentType === "marco") {
    redirect(getTimelineHighlightHref(entry.contentKey));
  }

  const relatedEntries = getTimelineRelatedEntries(entry, allEntries).slice(0, 6);
  const titleSentence = firstSentence(entry.excerpt) || entry.title;
  const timeEntryHref = getTimelineEntryHref(entry.contentType, entry.contentKey);

  const dossier = entry.contentType === "dossie" ? await getPublishedDossierBySlug(entry.contentKey) : null;
  const dossierUpdates = dossier ? await getPublishedDossierUpdates(dossier.id) : [];

  return (
    <Container className="intro-grid timeline-detail-page">
      <DeepPageWayfinding
        parentHref="/linha-do-tempo"
        parentLabel="linha do tempo"
        currentLabel="marco temporal"
        actions={[
          { href: "/buscar", label: "Buscar" },
          { href: "/salvos", label: "Salvos" },
          { href: "/acompanhar", label: "Acompanhar" },
        ]}
      />

      <section className="hero hero--split timeline-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">marco temporal</p>
          <h1 className="hero__title">{entry.title}</h1>
          <p className="hero__lead">{titleSentence}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getTimelineContentTypeLabel(entry.contentType)}</span>
            <span className="home-hero__signal">{entry.periodLabel}</span>
            <span className="home-hero__signal">{getTimelineDateBasisLabel(entry.dateBasis)}</span>
          </div>
          <div className="hero__actions">
            <Link href={entry.contentHref} className="button">
              Abrir conteúdo original
            </Link>
            <Link href="/linha-do-tempo" className="button-secondary">
              Voltar à cronologia
            </Link>
            <Link href="/buscar" className="button-secondary">
              Buscar
            </Link>
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar
            </Link>
            {entry.saveKind ? (
              <SaveReadButton kind={entry.saveKind} keyValue={entry.contentKey} title={entry.title} summary={entry.excerpt || entry.title} href={entry.contentHref} compact />
            ) : null}
            {entry.followKind ? (
              <FollowButton kind={entry.followKind} keyValue={entry.contentKey} title={entry.title} summary={entry.excerpt || entry.title} href={entry.contentHref} compact />
            ) : null}
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">leitura temporal</p>
          <h2>O tempo é uma ponte entre caso, documento e consequência.</h2>
          <p>
            Esta entrada ajuda a ver por que o marco existe, de onde ele veio e com o que conversa dentro do ecossistema público do VR Abandonada.
          </p>
          <div className="stack-actions">
            <Link href={timeEntryHref} className="button-secondary">
              Copiar percurso temporal
            </Link>
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que esse marco representa</p>
            <h2>Camada temporal pública, sem arquivo morto.</h2>
          </div>
          <p className="section__lead">
            {entry.sourceNote || entry.excerpt || "A cronologia costura origem, atualização, campanha, impacto e leitura estrutural para que o caso não pare no registro."}
          </p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>{entry.dateLabel || entry.yearLabel || "Sem data forte"}</h3>
            <p>{entry.periodLabel}</p>
          </article>
          <article className="card">
            <h3>{entry.kindLabel}</h3>
            <p>{entry.territoryLabel || entry.actorLabel || "Entrada pública do ecossistema."}</p>
          </article>
          <article className="card">
            <h3>{entry.featured ? "Em destaque" : "Marco de leitura"}</h3>
            <p>{entry.labels.slice(0, 2).join(" • ") || "Marcação editorial do tempo."}</p>
          </article>
        </div>
      </section>

      {dossier && dossierUpdates.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">desdobramentos do dossiê</p>
              <h2>O que veio depois.</h2>
            </div>
            <p className="section__lead">
              Quando a entrada é um dossiê, a cronologia pública ganha o rastro das atualizações publicadas para mostrar continuidade e mudança.
            </p>
          </div>

          <div className="grid-2">
            {dossierUpdates.slice(0, 4).map((update) => (
              <article className="card" key={update.id}>
                <span className="pill">{getDossierUpdateNarrativeLabel(update.update_type)}</span>
                <h3>{update.title}</h3>
                <p>{update.excerpt || getDossierUpdatePreviewText(update)}</p>
                <div className="meta-row">
                  <span>{update.published_at ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(update.published_at)) : "sem data"}</span>
                  {update.featured ? <span>em destaque</span> : null}
                </div>
                <Link href={`/dossies/${dossier.slug}`} className="button-secondary">
                  Abrir dossiê
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">conexões</p>
            <h2>Marcos próximos para continuar a leitura.</h2>
          </div>
          <p className="section__lead">
            O valor da cronologia cresce quando ela faz o leitor saltar entre território, responsabilidade, documento e consequência pública.
          </p>
        </div>

        {relatedEntries.length ? (
          <div className="grid-2 timeline-grid">
            {relatedEntries.map((related) => (
              <TimelineEntryCard key={related.id} entry={related} compact />
            ))}
          </div>
        ) : (
          <article className="support-box">
            <p className="eyebrow">sem conexões</p>
            <h3>Este marco ainda está isolado na leitura pública.</h3>
            <p>Vale voltar pela busca ou abrir territórios e atores relacionados para encontrar mais contexto.</p>
          </article>
        )}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos caminhos</p>
            <h2>Leia, salve ou acompanhe a frente que este marco abriu.</h2>
          </div>
          <p className="section__lead">A cronologia não termina no marco. Ela devolve o usuário para o fluxo público do projeto.</p>
        </div>

        <div className="grid-3">
          <article className="card">
            <h3>Salvar a leitura</h3>
            <p>Guarde este marco no dispositivo para retornar depois.</p>
            <Link href="/salvos" className="button-secondary">
              Abrir salvos
            </Link>
          </article>
          <article className="card">
            <h3>Acompanhar a frente</h3>
            <p>Se este marco aponta um caso recorrente, siga a frente inteira no aparelho.</p>
            <Link href="/acompanhar" className="button-secondary">
              Abrir acompanhar
            </Link>
          </article>
          <article className="card">
            <h3>Voltar ao presente</h3>
            <p>O radar mostra onde o projeto está quente agora.</p>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}

