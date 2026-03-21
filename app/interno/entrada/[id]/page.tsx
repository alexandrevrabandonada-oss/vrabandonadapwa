import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EntryCentralForm } from "@/components/entry-central-form";
import { signOutAction } from "@/app/interno/actions";
import { getInternalEditorialEntryById } from "@/lib/entrada/queries";
import { editorialEntryStatusLabels, editorialEntryTargetLabels, editorialEntryTypeLabels } from "@/lib/entrada/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Entrada simplificada",
  description: "Revisão e enriquecimento de uma entrada editorial.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EntradaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const entry = await getInternalEditorialEntryById(id);
  if (!entry) {
    redirect("/interno/entrada");
  }

  const entryTypeLabel = editorialEntryTypeLabels[entry.entry_type] ?? entry.entry_type;

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">entrada simplificada</p>
        <h1 className="hero__title">{entry.title}</h1>
        <p className="hero__lead">
          {entryTypeLabel} · {editorialEntryStatusLabels[entry.entry_status]}
          {entry.target_surface ? ` · ${editorialEntryTargetLabels[entry.target_surface]}` : ""}
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/entrada" className="button-secondary">Voltar à central</Link>
          <Link href="/interno/intake" className="button-secondary">Ver fila pública</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2" style={{ alignItems: "start" }}>
          <EntryCentralForm entryType={entry.entry_type} entry={entry} />

          <article className="support-box">
            <p className="eyebrow">etapa 2</p>
            <h2>Enriquecer depois</h2>
            <p>
              Use esta entrada como base. Depois, se fizer sentido, ela pode ser ligada ao acervo, à memória, ao dossiê, à campanha, ao impacto ou à edição.
            </p>
            <div className="stack-actions">
              <Link href="/interno/acervo" className="button-secondary">Abrir acervo</Link>
              <Link href="/interno/memoria" className="button-secondary">Abrir memória</Link>
              <Link href="/interno/editorial" className="button-secondary">Abrir editorial</Link>
            </div>
          </article>
        </div>

        <div className="grid-2">
          <article className="card">
            <p className="eyebrow">estado atual</p>
            <h3>{editorialEntryStatusLabels[entry.entry_status]}</h3>
            <p>{entry.summary || entry.details || "Sem resumo informado."}</p>
            <p className="meta-row">
              <span>{entry.territory_label || entry.place_label || "Sem território"}</span>
              <span>{entry.actor_label || entry.source_label || "Sem ator/fonte"}</span>
              <span>{entry.axis_label || "Sem eixo"}</span>
            </p>
            {entry.file_url ? (
              <div className="stack-actions">
                <a href={entry.file_url} className="button-secondary" target="_blank" rel="noreferrer">
                  Abrir arquivo
                </a>
              </div>
            ) : null}
          </article>

          <article className="support-box">
            <p className="eyebrow">próxima decisão</p>
            <h3>O que pode vir depois</h3>
            <ul>
              {entry.entry_type === "post" ? (
                <>
                  <li>Virar Agora ou texto curto para circulação.</li>
                  <li>Ganhar vínculo com eixo, território ou ator.</li>
                  <li>Virar edição curta quando houver massa crítica.</li>
                </>
              ) : null}
              {entry.entry_type === "document" ? (
                <>
                  <li>Virar anexo de acervo com revisão mínima.</li>
                  <li>Ganhar resumo editorial depois.</li>
                  <li>Virar base para dossiê, impacto ou edição.</li>
                </>
              ) : null}
              {entry.entry_type === "image" ? (
                <>
                  <li>Virar memória ou anexo visual de acervo.</li>
                  <li>Ganhar contexto e data mais firmes.</li>
                  <li>Virar peça de circulação quando fizer sentido.</li>
                </>
              ) : null}
            </ul>
          </article>
        </div>
      </section>
    </Container>
  );
}
