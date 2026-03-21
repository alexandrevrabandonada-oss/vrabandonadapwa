import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { ImpactCard } from "@/components/impact-card";
import { ImpactForm } from "@/components/impact-form";
import { ImpactLinkCard } from "@/components/impact-link-card";
import { ImpactLinkForm } from "@/components/impact-link-form";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";
import { getInternalImpactById, getInternalImpactLinks, getInternalImpacts } from "@/lib/impact/queries";
import { resolveImpactLink } from "@/lib/impact/resolve";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Impacto interno",
  description: "Curadoria e operação das consequências públicas do VR Abandonada.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalImpactDetailPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const { id } = await params;
  const impact = await getInternalImpactById(id);

  if (!impact) {
    notFound();
  }

  const impacts = await getInternalImpacts({ status: "all" });
  const links = await getInternalImpactLinks(impact.id);
  const resolvedLinks = links.map(resolveImpactLink);
  const relatedImpacts = impacts.filter((item) => item.id !== impact.id && (item.status === impact.status || item.impact_type === impact.impact_type)).slice(0, 3);

  return (
    <Container className="intro-grid internal-page impact-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">impacto interno</p>
        <h1 className="hero__title">{impact.title}</h1>
        <p className="hero__lead">
          Operação editorial da consequência pública.
        </p>
        <div className="hero__actions">
          <Link href="/interno/impacto" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/impacto/${impact.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getImpactStatusLabel(impact.status)}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipo</p>
            <h3>{getImpactTypeLabel(impact.impact_type)}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{resolvedLinks.length}</h3>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição</p>
            <h2>Editar impacto</h2>
          </div>
          <p className="section__lead">Mantenha a consequência pública legível sem perder a separação entre operação interna e camada pública.</p>
        </div>

        <ImpactForm impact={impact} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peças</p>
            <h2>Vínculos e percurso</h2>
          </div>
          <p className="section__lead">A ordem dos vínculos ajuda a contar o que aconteceu, o que importa e o que continua em aberto.</p>
        </div>

        <div className="grid-2">
          {resolvedLinks.length ? (
            resolvedLinks.map((link) => <ImpactLinkCard key={link.id} link={link} />)
          ) : (
            <div className="support-box">
              <h3>Sem vínculos ainda</h3>
              <p>Comece pela peça de entrada, depois acrescente prova, contexto e desdobramento.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">novo vínculo</p>
            <h2>Adicionar peça ao impacto</h2>
          </div>
          <p className="section__lead">Vincule pauta, dossiê, memória, acervo, eixo ou página para manter o percurso visível.</p>
        </div>

        <ImpactLinkForm impactId={impact.id} impactSlug={impact.slug} />
      </section>

      {relatedImpacts.length ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">impactos próximos</p>
              <h2>Outras consequências na mesma linha</h2>
            </div>
            <p className="section__lead">Útil para não tratar um efeito público como peça isolada.</p>
          </div>

          <div className="grid-2">
            {relatedImpacts.map((item) => (
              <ImpactCard key={item.id} impact={item} href={`/interno/impacto/${item.id}`} itemCount={0} compact />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
