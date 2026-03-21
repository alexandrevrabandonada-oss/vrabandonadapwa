import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { createEditorialDraftFromIntakeAction } from "@/app/interno/editorial/actions";
import { IntakeTriageForm } from "@/components/intake-triage-form";
import { getEditorialByIntakeId } from "@/lib/editorial/queries";
import { intakeStatusLabels, type IntakeStatus, type IntakeSubmission } from "@/lib/intake/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Detalhe da submissão",
  description: "Revisão interna de um envio do VR Abandonada.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IntakeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const { data: submission, error } = await supabase
    .from("intake_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!submission) {
    notFound();
  }

  const item = submission as IntakeSubmission;
  const editorial = await getEditorialByIntakeId(id);

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">detalhe</p>
        <h1 className="hero__title">{item.title}</h1>
        <p className="hero__lead">
          {intakeStatusLabels[item.status as IntakeStatus] ?? item.status} · {item.location || "Sem local informado"}
        </p>
        <div className="hero__actions">`r`n          <Link href="/interno/intake" className="button-secondary">Voltar à fila</Link>
          <Link href="/interno/editorial" className="button-secondary">Ver editorial</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <article className="support-box">
            <h3>Conteúdo bruto</h3>
            <p>{item.details}</p>
          </article>
          <article className="support-box">
            <h3>Metadados</h3>
            <ul>
              <li>Categoria: {item.category}</li>
              <li>Origem: {item.source_type ?? item.category}</li>
              <li>Sigilo: {item.is_sensitive ? "sim" : "não"}</li>
              <li>Contato permitido: {item.contact_allowed ? "sim" : "não"}</li>
              <li>Anonimato: {item.anonymous ? "sim" : "não"}</li>
              <li>Criado em: {new Date(item.created_at).toLocaleString("pt-BR")}</li>
              <li>Revisado em: {item.reviewed_at ? new Date(item.reviewed_at).toLocaleString("pt-BR") : "não"}</li>
              <li>Revisado por: {item.reviewed_by || "não"}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">publicação</p>
            <h2>Camada pública derivada</h2>
          </div>
          <p className="section__lead">
            Aqui nasce o conteúdo sanitizado. Nada de nota interna ou contato vaza para a publicação.
          </p>
        </div>

        {editorial ? (
          <div className="grid-2">
            <article className="support-box">
              <h3>{editorial.title}</h3>
              <p>{editorial.excerpt}</p>
              <div className="stack-actions">
                <Link href={`/interno/editorial/${editorial.id}`} className="button-secondary">
                  Abrir item editorial
                </Link>
              </div>
            </article>
            <article className="support-box">
              <h3>Prévia pública</h3>
              <EditorialCover
                title={editorial.title}
                primaryTag={editorial.primary_tag ?? editorial.category}
                seriesTitle={editorial.series_title}
                coverImageUrl={editorial.cover_image_url}
                coverVariant={editorial.cover_variant}
              />
            </article>
          </div>
        ) : (
          <form action={createEditorialDraftFromIntakeAction}>
            <input type="hidden" name="intake_submission_id" value={item.id} />
            <button className="button" type="submit">Criar rascunho editorial</button>
          </form>
        )}
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">triagem</p>
            <h2>Atualizar status e notas</h2>
          </div>
          <p className="section__lead">
            Use este formulário para registrar leitura editorial, risco e a versão segura do material.
          </p>
        </div>

        <IntakeTriageForm submission={item} />
      </section>
    </Container>
  );
}


