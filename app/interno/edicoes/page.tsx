import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { EditionCard } from "@/components/edition-card";
import { getInternalEditorialEditions, getInternalEditorialEditionLinks } from "@/lib/editions/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edições internas",
  description: "Curadoria e operação das edições do VR Abandonada.",
};

export default async function InternalEditionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const editions = await getInternalEditorialEditions();
  const linkPairs = await Promise.all(editions.map(async (edition) => [edition.id, await getInternalEditorialEditionLinks(edition.id)] as const));
  const linksByEditionId = new Map(linkPairs);
  const publishedEditions = editions.filter((edition) => edition.status === "published");
  const draftEditions = editions.filter((edition) => edition.status === "draft");
  const archivedEditions = editions.filter((edition) => edition.status === "archived");

  return (
    <Container className="intro-grid internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">edições internas</p>
        <h1 className="hero__title">Curadoria e circulação.</h1>
        <p className="hero__lead">A síntese editorial do projeto precisa de um lugar simples para ser editada, publicada e reenviada para o público.</p>
        <div className="hero__actions">
          <Link href="/interno/edicoes/novo" className="button">
            Nova edição
          </Link>
          <Link href="/edicoes" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">publicadas</p>
            <h3>{publishedEditions.length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">rascunhos</p>
            <h3>{draftEditions.length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">arquivo</p>
            <h3>{archivedEditions.length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">total</p>
            <h3>{editions.length}</h3>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">publicadas</p>
            <h2>As edições que já circulam.</h2>
          </div>
          <p className="section__lead">Mantenha o destaque e o período alinhados com o que está em curso.</p>
        </div>

        <div className="grid-2">
          {publishedEditions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} href={`/interno/edicoes/${edition.id}`} itemCount={linksByEditionId.get(edition.id)?.length ?? 0} compact />
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">rascunhos</p>
            <h2>O que ainda está em edição.</h2>
          </div>
          <p className="section__lead">Use este bloco para fechar a síntese antes de publicar.</p>
        </div>

        <div className="grid-2">
          {draftEditions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} href={`/interno/edicoes/${edition.id}`} itemCount={linksByEditionId.get(edition.id)?.length ?? 0} compact />
          ))}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">arquivo</p>
            <h2>O que fica guardado como referência.</h2>
          </div>
          <p className="section__lead">Mesmo arquivada, a edição segue útil como síntese e histórico editorial.</p>
        </div>

        <div className="grid-2">
          {archivedEditions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} href={`/interno/edicoes/${edition.id}`} itemCount={linksByEditionId.get(edition.id)?.length ?? 0} compact />
          ))}
        </div>
      </section>
    </Container>
  );
}
