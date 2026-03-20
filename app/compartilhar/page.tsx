import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { SharePackCard } from "@/components/share-pack-card";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getSharePackContentTypeLabel } from "@/lib/share-packs/navigation";
import { getPublishedSharePacks } from "@/lib/share-packs/queries";
import { resolveSharePacks, groupSharePacksByType } from "@/lib/share-packs/resolve";

export const metadata: Metadata = {
  title: "Compartilhar",
  description: "Pacotes editoriais prontos para circular fora do site: links, resumos e legendas do VR Abandonada.",
  openGraph: {
    title: "Compartilhar | VR Abandonada",
    description: "Pacotes editoriais prontos para circular fora do site: links, resumos e legendas do VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compartilhar | VR Abandonada",
    description: "Pacotes editoriais prontos para circular fora do site: links, resumos e legendas do VR Abandonada.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function SharePacksPage() {
  const [packs, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getPublishedSharePacks(),
    getPublishedEditorialEditions(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedPatternReads(),
  ]);

  const resolvedPacks = resolveSharePacks(packs, {
    editions,
    campaigns,
    impacts,
    dossiers,
    pautas,
    patterns,
  });
  const grouped = groupSharePacksByType(resolvedPacks);
  const featuredPack = resolvedPacks.find((pack) => pack.featured && pack.share_status === "published") ?? resolvedPacks[0] ?? null;
  const typeSections = [
    { type: "edicao", title: "Edições" },
    { type: "campanha", title: "Campanhas" },
    { type: "impacto", title: "Impactos" },
    { type: "dossie", title: "Dossiês" },
    { type: "pauta", title: "Pautas" },
    { type: "padrao", title: "Padrões" },
  ] as const;

  return (
    <Container className="intro-grid share-packs-page">
      <section className="hero hero--split">
        <div className="hero__copy">
          <p className="eyebrow">compartilhar</p>
          <h1 className="hero__title">Pacotes editoriais prontos para circular fora do site.</h1>
          <p className="hero__lead">
            O VR Abandonada transforma leitura, síntese e consequência pública em material curto, legível e compartilhável.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">link pronto</span>
            <span className="home-hero__signal">resumo curto</span>
            <span className="home-hero__signal">legenda editorial</span>
          </div>
          <div className="hero__actions">
            <Link href="/edicoes" className="button-secondary">
              Ver edições
            </Link>
            <Link href="/agora" className="button-secondary">
              Ver radar
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">estado atual</p>
          <h2>{featuredPack ? featuredPack.title : "Compartilhe a leitura do momento."}</h2>
          <p>{featuredPack ? featuredPack.summary : "Cada pacote junta manchete, resumo e legenda para circular melhor no WhatsApp e nas redes."}</p>
          <div className="stack-actions">
            <Link href={featuredPack ? featuredPack.href : "/edicoes"} className="button">
              Abrir pacote
            </Link>
            <Link href="/participe" className="button-secondary">
              Participar
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que isso faz</p>
            <h2>Converte conteúdo em peça pronta para circular.</h2>
          </div>
          <p className="section__lead">
            Cada pacote guarda link, resumo curto, legenda curta e capa coerente com a identidade editorial do projeto.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>{resolvedPacks.length}</h3>
            <p>Pacotes de circulação prontos ou em preparação.</p>
          </article>
          <article className="card">
            <h3>{resolvedPacks.filter((pack) => pack.featured).length}</h3>
            <p>Pacotes em destaque.</p>
          </article>
          <article className="card">
            <h3>{resolvedPacks.filter((pack) => pack.content_type === "edicao").length}</h3>
            <p>Edições preparadas para compartilhar.</p>
          </article>
          <article className="card">
            <h3>{resolvedPacks.filter((pack) => pack.content_type === "campanha").length}</h3>
            <p>Chamados e campanhas em circulação.</p>
          </article>
        </div>
      </section>

      {featuredPack ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">em destaque</p>
              <h2>{featuredPack.title}</h2>
            </div>
            <p className="section__lead">O pacote em destaque junta tese, resumo e legenda para sair do site com uma leitura já organizada.</p>
          </div>

          <div className="grid-2">
            <SharePackCard
              pack={featuredPack}
              primaryHref={featuredPack.href}
              primaryLabel="Abrir pacote"
              secondaryHref={featuredPack.contentHref}
              secondaryLabel="Abrir conteúdo"
            />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">como usar</p>
              <p>
                Copie o link, o resumo ou a legenda. Se fizer sentido, use o pacote como base de WhatsApp, Instagram ou chamada direta para o site.
              </p>
              <div className="stack-actions">
                <Link href={featuredPack.href} className="button-secondary">
                  Ver versão pública
                </Link>
                <Link href={`/compartilhar/${featuredPack.content_type}/${featuredPack.content_key}`} className="button-secondary">
                  Abrir link direto
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {typeSections.map((section) => {
        const items = grouped[section.type] ?? [];

        if (!items.length) {
          return null;
        }

        return (
          <section className="section" key={section.type}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{section.title}</p>
                <h2>{getSharePackContentTypeLabel(section.type)} em circulação.</h2>
              </div>
              <p className="section__lead">Pacotes curtos que condensam a leitura e deixam o conteúdo pronto para sair do site.</p>
            </div>

            <div className="grid-2">
              {items.map((pack) => (
                <SharePackCard
                  key={pack.id}
                  pack={pack}
                  primaryHref={pack.href}
                  primaryLabel="Abrir pacote"
                  secondaryHref={pack.contentHref}
                  secondaryLabel="Abrir conteúdo"
                  compact
                />
              ))}
            </div>
          </section>
        );
      })}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">seguir lendo</p>
            <h2>A circulação começa no pacote, mas continua no arquivo vivo.</h2>
          </div>
          <p className="section__lead">
            Se a peça circulou, o restante do site continua a leitura com método, participação e consequência.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/edicoes" className="button-secondary">
            Ver edições
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver campanhas
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
          <Link href="/participe" className="button-secondary">
            Participar
          </Link>
        </div>
      </section>
    </Container>
  );
}
