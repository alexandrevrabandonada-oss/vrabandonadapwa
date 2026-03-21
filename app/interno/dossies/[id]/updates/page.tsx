import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { DossierUpdateCard } from "@/components/dossier-update-card";
import { DossierUpdateForm } from "@/components/dossier-update-form";
import { getInternalDossierById, getInternalDossierUpdates } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getDossierLatestUpdate } from "@/lib/dossiers/updates";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Updates do dossiê",
  description: "Atualizações editoriais, próximos passos e chamadas públicas do dossiê.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalDossierUpdatesPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const dossier = await getInternalDossierById(id);
  if (!dossier) {
    notFound();
  }

  const updates = await getInternalDossierUpdates(dossier.id);
  const latestUpdate = getDossierLatestUpdate(updates);
  const publishedCount = updates.filter((update) => update.published).length;

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">Updates da investigação</h1>
        <p className="hero__lead">Registre andamento, nova prova, correção ou convocação pública sem romper a linha editorial do caso.</p>
        <div className="meta-row">
          <span>{getDossierStatusLabel(dossier.status)}</span>
          <span>{updates.length} updates</span>
          <span>{publishedCount} publicados</span>
          {latestUpdate ? <span>Último: {latestUpdate.title}</span> : null}
        </div>
        <div className="hero__actions">`r`n          <Link href={`/interno/dossies/${dossier.id}`} className="button-secondary">
            Voltar ao dossiê
          </Link>
          <Link href={`/dossies/${dossier.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">novo update</p>
            <h2>Atualizar o caso</h2>
          </div>
          <p className="section__lead">O update entra como continuidade: publique quando houver movimento real, pista útil ou correção relevante.</p>
        </div>

        <DossierUpdateForm dossierId={dossier.id} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">arquivo recente</p>
            <h2>Updates salvos</h2>
          </div>
          <p className="section__lead">Ordene pela visão editorial: destaque, andamento, prova e chamada pública.</p>
        </div>

        <div className="grid-2">
          {updates.length ? (
            updates.map((update) => <DossierUpdateCard key={update.id} update={update} href={`/interno/dossies/${dossier.id}/updates/${update.id}`} actionLabel="Editar update" />)
          ) : (
            <div className="support-box">
              <h3>Sem updates registrados</h3>
              <p>Crie o primeiro update para marcar a investigação como viva.</p>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}


