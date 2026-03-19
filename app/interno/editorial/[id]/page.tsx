import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EditorialForm } from "@/components/editorial-form";
import { signOutAction } from "@/app/interno/actions";
import { getInternalEditorialById } from "@/lib/editorial/queries";
import { editorialStatusLabels, type EditorialStatus } from "@/lib/editorial/types";

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
            <h3>Controle</h3>
            <ul>
              <li>Criado em: {new Date(item.created_at).toLocaleString("pt-BR")}</li>
              <li>Atualizado em: {new Date(item.updated_at).toLocaleString("pt-BR")}</li>
              <li>Publicado em: {item.published_at ? new Date(item.published_at).toLocaleString("pt-BR") : "não"}</li>
              <li>Nota de visibilidade: {item.source_visibility_note || "sem nota"}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Salvar publicação segura</h2>
          </div>
          <p className="section__lead">
            Esta tela edita apenas a camada pública. Nada de interno vaza para o site.
          </p>
        </div>

        <EditorialForm item={item} />
      </section>
    </Container>
  );
}
