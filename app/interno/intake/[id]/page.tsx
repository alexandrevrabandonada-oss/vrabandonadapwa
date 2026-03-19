import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { IntakeTriageForm } from "@/components/intake-triage-form";
import { signOutAction } from "@/app/interno/actions";
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

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">detalhe</p>
        <h1 className="hero__title">{item.title}</h1>
        <p className="hero__lead">
          {intakeStatusLabels[item.status as IntakeStatus] ?? item.status} · {item.location || "Sem local informado"}
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/intake" className="button-secondary">Voltar à fila</Link>
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
