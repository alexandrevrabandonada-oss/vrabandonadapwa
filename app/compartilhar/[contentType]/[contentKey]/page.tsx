import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { SharePackExportPanel } from "@/components/share-pack-export";
import { SharePackCard } from "@/components/share-pack-card";
import { ShareTools } from "@/components/share-tools";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getSharePackCoverVariant, getSharePackOpenGraphImagePath } from "@/lib/share-packs/navigation";
import { getPublishedSharePacks } from "@/lib/share-packs/queries";
import { resolveSharePack } from "@/lib/share-packs/resolve";
import type { SharePack, SharePackContext } from "@/lib/share-packs/types";

function buildFallbackPack(contentType: string, contentKey: string): SharePack {
  return {
    id: `${contentType}:${contentKey}`,
    content_type: contentType,
    content_key: contentKey,
    title_override: null,
    short_summary: null,
    share_caption: null,
    share_status: "published",
    cover_variant: getSharePackCoverVariant(contentType),
    preferred_format: "both",
    featured: false,
    public_visibility: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
  };
}

function isSupportedContentType(contentType: string) {
  return ["edicao", "campanha", "dossie", "impacto", "padrao", "pauta"].includes(contentType);
}

type PageProps = {
  params: Promise<{ contentType: string; contentKey: string }>;
};

export async function generateStaticParams() {
  const packs = await getPublishedSharePacks();
  return packs.map((pack) => ({ contentType: pack.content_type, contentKey: pack.content_key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { contentType, contentKey } = await params;

  if (!isSupportedContentType(contentType)) {
    return {
      title: "Compartilhar",
      description: "Pacotes editoriais prontos para circular fora do site.",
    };
  }

  const [packs, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getPublishedSharePacks(),
    getPublishedEditorialEditions(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedPatternReads(),
  ]);

  const context: SharePackContext = {
    editions,
    campaigns,
    impacts,
    dossiers,
    pautas,
    patterns,
  };
  const pack = packs.find((item) => item.content_type === contentType && item.content_key === contentKey) ?? buildFallbackPack(contentType, contentKey);
  const resolved = resolveSharePack(pack, context);

  return {
    title: `${resolved.title} | Compartilhar`,
    description: resolved.summary,
    openGraph: {
      title: resolved.title,
      description: resolved.summary,
      type: "article",
      images: [getSharePackOpenGraphImagePath(contentType, contentKey)],
    },
    twitter: {
      card: "summary_large_image",
      title: resolved.title,
      description: resolved.summary,
      images: [getSharePackOpenGraphImagePath(contentType, contentKey)],
    },
  };
}

export default async function SharePackPage({ params }: PageProps) {
  const { contentType, contentKey } = await params;

  if (!isSupportedContentType(contentType)) {
    notFound();
  }

  const [packs, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getPublishedSharePacks(),
    getPublishedEditorialEditions(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedPatternReads(),
  ]);

  const context: SharePackContext = {
    editions,
    campaigns,
    impacts,
    dossiers,
    pautas,
    patterns,
  };
  const pack = packs.find((item) => item.content_type === contentType && item.content_key === contentKey) ?? buildFallbackPack(contentType, contentKey);
  const resolved = resolveSharePack(pack, context);

  return (
    <Container className="intro-grid share-pack-detail-page">
      <section className="hero hero--split share-pack-hero">
        <div className="hero__copy">
          <p className="eyebrow">pacote de circulação</p>
          <h1 className="hero__title">{resolved.title}</h1>
          <p className="hero__lead">{resolved.summary}</p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">{resolved.typeLabel}</span>
            <span className="home-hero__signal">{resolved.statusLabel}</span>
            <span className="home-hero__signal">pronto para compartilhar</span>
          </div>
          <div className="hero__actions">
            <Link href={resolved.contentHref} className="button-secondary">
              Abrir conteúdo
            </Link>
            <Link href="/compartilhar" className="button-secondary">
              Ver outros pacotes
            </Link>
          </div>
        </div>

        <EditorialCover
          title={resolved.title}
          primaryTag={resolved.typeLabel}
          seriesTitle={resolved.summary}
          coverVariant={resolved.coverVariantResolved}
        />
      </section>

      <SharePackExportPanel pack={resolved} contentHref={resolved.contentHref} />

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">legenda</p>
            <h2>Copie, cole e circule.</h2>
          </div>
          <p className="section__lead">O pacote guarda o texto curto, a legenda e o link de origem para evitar link cru e leitura solta.</p>
        </div>

        <div className="grid-2">
          <SharePackCard pack={resolved} primaryHref={resolved.contentHref} primaryLabel="Abrir conteúdo" secondaryHref={resolved.href} secondaryLabel="Ver pacote" />
          <ShareTools title={resolved.title} summary={resolved.summary} caption={resolved.caption} url={resolved.href} />
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">de onde veio</p>
            <h2>O que esse pacote condensa.</h2>
          </div>
          <p className="section__lead">
            Este pacote não substitui o conteúdo original. Ele organiza a leitura para circulação e deixa a porta de volta ao site mais clara.
          </p>
        </div>

        <article className="support-box">
          <p>{resolved.caption}</p>
          <div className="stack-actions">
            <Link href={resolved.contentHref} className="button-secondary">
              Abrir origem
            </Link>
            <Link href="/participe" className="button-secondary">
              Participar
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ler método
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">seguir lendo</p>
            <h2>O pacote é uma porta. O arquivo continua do outro lado.</h2>
          </div>
          <p className="section__lead">Se a circulação trouxe alguém até aqui, o restante do site continua a leitura com contexto, consequência e investigação.</p>
        </div>

        <div className="stack-actions">
          <Link href="/agora" className="button-secondary">
            Ver radar
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver campanhas
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
          </Link>
          <Link href="/edicoes" className="button-secondary">
            Ver edições
          </Link>
        </div>
      </section>
    </Container>
  );
}


