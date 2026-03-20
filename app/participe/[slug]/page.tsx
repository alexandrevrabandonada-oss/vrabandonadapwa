import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { ParticipationPathCard } from "@/components/participation-path-card";
import { ParticipationStepCard } from "@/components/participation-step-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedParticipationPaths, getResolvedPublishedParticipationPathBySlug } from "@/lib/participation/queries";
import { getParticipationStatusLabel } from "@/lib/participation/navigation";

export async function generateStaticParams() {
  const paths = await getPublishedParticipationPaths();
  return paths.map((path) => ({ slug: path.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getResolvedPublishedParticipationPathBySlug(slug);

  if (!data) {
    return {
      title: "Participe",
      description: "Caminhos para colaborar com o VR Abandonada.",
    };
  }

  return {
    title: `${data.path.title} | Participe`,
    description: data.path.excerpt || data.path.description || "Caminho de colaboração do VR Abandonada.",
    openGraph: {
      title: `${data.path.title} | Participe`,
      description: data.path.excerpt || data.path.description || "Caminho de colaboração do VR Abandonada.",
      type: "article",
      images: [getHomeOpenGraphImagePath()],
    },
  };
}

export default async function ParticipateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getResolvedPublishedParticipationPathBySlug(slug);

  if (!data) {
    notFound();
  }

  const { path, items } = data;
  const leadItem = items.find((item) => item.role === "start") ?? items[0] ?? null;
  const followupPaths = (await getPublishedParticipationPaths()).filter((item) => item.slug !== path.slug).slice(0, 3);

  return (
    <Container className="intro-grid participate-page">
      <section className="hero hero--split participate-detail-hero">
        <div className="hero__copy">
          <p className="eyebrow">participe</p>
          <h1 className="hero__title">{path.title}</h1>
          <p className="hero__lead">{path.excerpt || path.description}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{getParticipationStatusLabel(path.status)}</span>
            {path.audience_label ? <span className="home-hero__signal">{path.audience_label}</span> : null}
            <span className="home-hero__signal">{items.length} passo{items.length === 1 ? "" : "s"}</span>
          </div>
          <div className="hero__actions">
            <Link href="/participe" className="button-secondary">
              Voltar à participação
            </Link>
            <Link href="/envie" className="button">
              Abrir envio
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">para quem é</p>
          <h2>{path.audience_label || "Entrada pública"}</h2>
          <p>
            Esta rota foi pensada para quem quer colaborar sem perder contexto. Comece pela peça principal e siga a ordem sugerida.
          </p>
          {leadItem ? (
            <article className="support-box">
              <p className="eyebrow">ação principal</p>
              <h3>{leadItem.title}</h3>
              <p>{leadItem.excerpt || leadItem.note}</p>
              <Link href={leadItem.href} className="button-secondary">
                Começar por aqui
              </Link>
            </article>
          ) : null}
        </article>
      </section>

      <section className="section participate-intro-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como usar esta rota</p>
            <h2>Comece pelo gesto, depois siga o contexto.</h2>
          </div>
          <p className="section__lead">
            A sequência traz o caminho ideal para a participação funcionar como continuidade do projeto e não como envio solto.
          </p>
        </div>
      </section>

      <section className="section participate-steps-section">
        <div className="grid-2">
          {items.map((item) => (
            <ParticipationStepCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="section participate-follow-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos passos</p>
            <h2>Depois desta rota, continue pelo projeto.</h2>
          </div>
          <p className="section__lead">A colaboração ganha mais força quando vira leitura, arquivo e acompanhamento do momento.</p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>Envie</h3>
            <p>Canal direto para pista, relato ou documento.</p>
            <Link href="/envie" className="button-secondary">Abrir envio</Link>
          </article>
          <article className="card">
            <h3>Apoie</h3>
            <p>Fortaleça a continuidade do projeto.</p>
            <Link href="/apoie" className="button-secondary">Ver apoio</Link>
          </article>
          <article className="card">
            <h3>Memória</h3>
            <p>Colabore com foto, recorte e lastro documental.</p>
            <Link href="/memoria" className="button-secondary">Abrir memória</Link>
          </article>
          <article className="card">
            <h3>Agora</h3>
            <p>Acompanhe o pulso do momento no radar editorial.</p>
            <Link href="/agora" className="button-secondary">Ver agora</Link>
          </article>
        </div>

        {followupPaths.length ? (
          <div className="grid-3">
            {followupPaths.map((item) => (
              <ParticipationPathCard key={item.id} path={item} href={`/participe/${item.slug}`} itemCount={0} compact />
            ))}
          </div>
        ) : null}
      </section>
    </Container>
  );
}