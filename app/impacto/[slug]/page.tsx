import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { SharePanel } from "@/components/share-panel";
import { ImpactCard } from "@/components/impact-card";
import { ImpactLinkCard } from "@/components/impact-link-card";
import { getPublishedImpacts, getPublishedImpactBySlug, getPublishedImpactLinks } from "@/lib/impact/queries";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";
import { resolveImpactLink } from "@/lib/impact/resolve";

export async function generateStaticParams() {
  const items = await getPublishedImpacts();
  return items.map((item) => ({ slug: item.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedImpactBySlug(slug);

  if (!item) {
    return {
      title: "Impacto",
      description: "Consequência pública do VR Abandonada.",
    };
  }

  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt || item.description || "Consequência pública do VR Abandonada.",
      type: "article",
      images: [item.cover_image_url || "/editorial/covers/arquivo-inicial.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt || item.description || "Consequência pública do VR Abandonada.",
      images: [item.cover_image_url || "/editorial/covers/arquivo-inicial.svg"],
    },
  };
}

export default async function ImpactDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const impact = await getPublishedImpactBySlug(slug);

  if (!impact) {
    notFound();
  }

  const impacts = await getPublishedImpacts();
  const relatedImpacts = impacts.filter((item) => item.slug !== impact.slug && (item.impact_type === impact.impact_type || item.status === impact.status)).slice(0, 3);
  const links = await getPublishedImpactLinks(impact.id);
  const resolvedLinks = links.map(resolveImpactLink);
  const leadLinks = resolvedLinks.filter((link) => link.link_role === "lead");
  const evidenceLinks = resolvedLinks.filter((link) => link.link_role === "evidence");
  const contextLinks = resolvedLinks.filter((link) => link.link_role === "context");
  const followupLinks = resolvedLinks.filter((link) => link.link_role === "followup");
  const archiveLinks = resolvedLinks.filter((link) => link.link_role === "archive");
  const paragraphs = impact.description?.split(/\n\n+/).filter(Boolean) ?? [];
  const primaryLead = leadLinks[0] ?? evidenceLinks[0] ?? contextLinks[0] ?? null;

  return (
    <Container className="intro-grid impact-detail-page">
      <section className="section editorial-detail-hero">
        <div className="editorial-hero__copy">
          <p className="eyebrow">impacto público</p>
          <h1>{impact.title}</h1>
          <p className="hero__lead">{impact.excerpt}</p>
          <div className="meta-row">
            <span>{getImpactStatusLabel(impact.status)}</span>
            <span>{getImpactTypeLabel(impact.impact_type)}</span>
            {impact.date_label ? <span>{impact.date_label}</span> : null}
            {impact.territory_label ? <span>{impact.territory_label}</span> : null}
          </div>
          {impact.lead_question ? <p className="impact-primary-piece__question">{impact.lead_question}</p> : null}
          <div className="stack-actions">
            <Link href="/participe" className="button-secondary">
              Participar
            </Link>
            <Link href="/envie" className="button-secondary">
              Enviar material
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ver método
            </Link>
          </div>
        </div>
        <EditorialCover
          title={impact.title}
          primaryTag={getImpactTypeLabel(impact.impact_type)}
          seriesTitle={impact.territory_label || impact.date_label || "VR Abandonada"}
          coverImageUrl={impact.cover_image_url}
          coverVariant={impact.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">compartilhar</p>
            <h2>Uma consequência pública também precisa circular.</h2>
          </div>
          <p className="section__lead">Compartilhe a leitura do que mudou sem reduzir o impacto a métrica ou slogan.</p>
        </div>

        <SharePanel
          title={impact.title}
          summary={impact.excerpt || impact.description || impact.title}
          caption={`Leia e compartilhe: ${impact.title}. ${impact.excerpt || impact.description || ""}`.trim()}
          shareHref={`/compartilhar/impacto/${impact.slug}`}
          contentHref={`/impacto/${impact.slug}`}
          titleLabel="compartilhe este impacto"
        />
      </section>

      <article className="section editorial-article">
        <div className="editorial-article__meta">
          <p className="eyebrow">o que aconteceu</p>
          <p>{getImpactStatusLabel(impact.status)}</p>
        </div>

        <div className="editorial-article__body">
          {paragraphs.length ? paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{impact.description}</p>}
        </div>
      </article>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peça de entrada</p>
            <h2>Por onde começar a ler a consequência.</h2>
          </div>
          <p className="section__lead">A primeira peça guia o percurso e ajuda a entender como este impacto se liga ao restante do projeto.</p>
        </div>

        {primaryLead ? (
          <ImpactLinkCard link={primaryLead} />
        ) : (
          <div className="support-box">
            <p>Sem peça principal vinculada ainda.</p>
          </div>
        )}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que mudou</p>
            <h2>Efeito público e consequência editorial.</h2>
          </div>
          <p className="section__lead">Aqui entram provas, documentos, respostas e materiais que explicam por que o impacto existe.</p>
        </div>

        <div className="grid-3">
          {evidenceLinks.length ? evidenceLinks.map((link) => <ImpactLinkCard key={link.id} link={link} compact />) : <div className="support-box"><p>Sem vínculos de prova ainda.</p></div>}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">respostas e reações</p>
            <h2>O que ainda está sendo acompanhado.</h2>
          </div>
          <p className="section__lead">Não tratamos causalidade como fechamento. A leitura continua onde a disputa continua.</p>
        </div>

        <div className="grid-3">
          {contextLinks.length ? contextLinks.map((link) => <ImpactLinkCard key={link.id} link={link} compact />) : <div className="support-box"><p>Sem vínculos de contexto ainda.</p></div>}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que ainda está em aberto</p>
            <h2>O próximo passo não fecha o caso sozinho.</h2>
          </div>
          <p className="section__lead">A continuidade aparece em novos relatos, novos documentos, novas leituras e novas checagens públicas.</p>
        </div>

        <div className="grid-3">
          {followupLinks.length ? followupLinks.map((link) => <ImpactLinkCard key={link.id} link={link} compact />) : <div className="support-box"><p>Sem próximos passos vinculados ainda.</p></div>}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">arquivo e memória</p>
            <h2>O documento também é consequência.</h2>
          </div>
          <p className="section__lead">Materiais preservados ajudam a sustentar a leitura do presente e a evitar que a história volte a ser apagamento.</p>
        </div>

        <div className="grid-3">
          {archiveLinks.length ? archiveLinks.map((link) => <ImpactLinkCard key={link.id} link={link} compact />) : <div className="support-box"><p>Sem vínculos de arquivo ainda.</p></div>}
        </div>
      </section>

      {relatedImpacts.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">outros efeitos</p>
              <h2>Impactos próximos nesta mesma linha.</h2>
            </div>
            <p className="section__lead">O ciclo continua em outros pontos do arquivo vivo.</p>
          </div>

          <div className="grid-3">
            {relatedImpacts.map((item) => (
              <ImpactCard key={item.id} impact={item} href={`/impacto/${item.slug}`} compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhe e participe</p>
            <h2>Se isso te ajudou a entender o que mudou, siga a linha.</h2>
          </div>
          <p className="section__lead">
            Quando houver documento, relato ou pista que conecte esta consequência ao território, o caminho certo continua sendo o envio responsável.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/impacto" className="button-secondary">
            Ver mais impactos
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Abrir campanhas
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
          <Link href="/agora" className="button-secondary">
            Ver radar
          </Link>
        </div>
      </section>
    </Container>
  );
}





