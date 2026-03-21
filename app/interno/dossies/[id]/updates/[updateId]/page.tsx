import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { DossierUpdateForm } from "@/components/dossier-update-form";
import { getInternalDossierById, getInternalDossierUpdateById } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getDossierUpdateTypeLabel, getDossierUpdateYearLabel } from "@/lib/dossiers/updates";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Editar update do dossiê",
  description: "Ajustar texto, publicação e destaque de um update da investigação.",
};

type PageProps = {
  params: Promise<{ id: string; updateId: string }>;
};

export default async function InternalDossierUpdateEditPage({ params }: PageProps) {
  const { id, updateId } = await params;
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

  const update = await getInternalDossierUpdateById(updateId);
  if (!update || update.dossier_id !== dossier.id) {
    notFound();
  }

  return (
    <Container className="intro-grid internal-page dossier-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">dossiês internos</p>
        <h1 className="hero__title">Editar update</h1>
        <p className="hero__lead">Ajuste a peça sem perder a linha de acompanhamento da investigação.</p>
        <div className="meta-row">
          <span>{getDossierStatusLabel(dossier.status)}</span>
          <span>{getDossierUpdateTypeLabel(update.update_type)}</span>
          <span>{getDossierUpdateYearLabel(update)}</span>
        </div>
        <div className="hero__actions">`r`n          <Link href={`/interno/dossies/${dossier.id}/updates`} className="button-secondary">
            Voltar aos updates
          </Link>
          <Link href={`/dossies/${dossier.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">update atual</p>
            <h2>{update.title}</h2>
          </div>
          <p className="section__lead">Marque publicado ou rascunho com clareza. O público só vê o que estiver explicitamente liberado.</p>
        </div>

        <DossierUpdateForm dossierId={dossier.id} update={update} />
      </section>
    </Container>
  );
}


