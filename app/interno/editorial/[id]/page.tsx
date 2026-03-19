import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EditorialForm } from "@/components/editorial-form";
import { signOutAction } from "@/app/interno/actions";
import { getEditorialAuditLog, getInternalEditorialById } from "@/lib/editorial/queries";
import {
  editorialAuditEventLabels,
  editorialReviewStatusLabels,
  editorialStatusLabels,
  type EditorialAuditEventType,
  type EditorialReviewStatus,
  type EditorialStatus,
} from "@/lib/editorial/types";

export const metadata: Metadata = {
  title: "Editar editorial",
  description: "Edite um item editorial público derivado da triagem.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalEditorialDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getInternalEditorialById(id);

  if (!item) {
    notFound();
  }

  const auditLog = await getEditorialAuditLog(id, 8);

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">editorial interno</p>
        <h1 className="hero__title">{item.title}</h1>
        <p className="hero__lead">
          {editorialStatusLabels[item.editorial_status as EditorialStatus] ?? item.editorial_status}
          {item.published ? " · Publicado" : " · Não publicado"}
        </p>
        <div className="hero__actions">
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">Sair</button>
          </form>
          <Link href="/interno/editorial" className="button-secondary">Voltar à fila</Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <article className="support-box">
            <h3>Origem</h3>
            <ul>
              <li>Intake: {item.intake_submission_id || "não vinculado"}</li>
              <li>Slug: {item.slug}</li>
              <li>Categoria: {item.category}</li>
              <li>Bairro: {item.neighborhood || "não informado"}</li>
              <li>Destaque: {item.featured ? "sim" : "não"}</li>
            </ul>
          </article>
          <article className="support-box">
            <h3>Governança</h3>
            <ul>
              <li>Status editorial: {editorialStatusLabels[item.editorial_status as EditorialStatus] ?? item.editorial_status}</li>
              <li>Status de revisão: {editorialReviewStatusLabels[item.review_status as EditorialReviewStatus] ?? item.review_status}</li>
              <li>Última revisão: {item.last_reviewed_at ? new Date(item.last_reviewed_at).toLocaleString("pt-BR") : "não"}</li>
              <li>Revisado por: {item.last_reviewed_by || "não"}</li>
              <li>Publicado por: {item.published_by || "não"}</li>
              <li>Motivo de publicação: {item.publication_reason || "sem registro"}</li>
              <li>Checagem sensível: {item.sensitivity_check_passed ? "aprovada" : "pendente"}</li>
              <li>Arquivo: {item.archived_reason || "não arquivado"}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">histórico</p>
            <h2>Últimos movimentos editoriais</h2>
          </div>
          <p className="section__lead">
            O registro abaixo guarda a trilha de revisão, publicação e retorno ao rascunho.
          </p>
        </div>

        <div className="audit-log">
          {auditLog.length ? (
            auditLog.map((event) => (
              <article className="audit-log__item" key={event.id}>
                <div className="meta-row">
                  <span>{editorialAuditEventLabels[event.event_type as EditorialAuditEventType] ?? event.event_type}</span>
                  <span>{event.actor_email || "sistema"}</span>
                  <span>{new Date(event.created_at).toLocaleString("pt-BR")}</span>
                </div>
                <p>
                  {event.from_status || "-"} → {event.to_status || "-"}
                </p>
                {event.note ? <p className="audit-log__note">{event.note}</p> : null}
              </article>
            ))
          ) : (
            <div className="support-box">
              <p>Sem eventos registrados ainda.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Checklist de publicação</h2>
          </div>
          <p className="section__lead">
            Antes de publicar, confirme limpeza, sigilo e motivo editorial. Se faltar algo, o salvamento bloqueia a publicação.
          </p>
        </div>

        <EditorialForm item={item} />
      </section>
    </Container>
  );
}
