import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { SharePackCard } from "@/components/share-pack-card";
import { SharePackExportPanel } from "@/components/share-pack-export";
import { SharePackForm } from "@/components/share-pack-form";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildSharePackLinkOptions, resolveSharePack } from "@/lib/share-packs/resolve";
import { getInternalSharePackById, getInternalSharePacks } from "@/lib/share-packs/queries";
import type { SharePackContext } from "@/lib/share-packs/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const pack = await getInternalSharePackById(id);

  if (!pack) {
    return {
      title: "Compartilhar interno",
      description: "Curadoria e operação dos pacotes editoriais do VR Abandonada.",
    };
  }

  return {
    title: `${pack.title_override || pack.content_key} | Compartilhar interno`,
    description: pack.short_summary || pack.share_caption || "Curadoria e operação dos pacotes editoriais do VR Abandonada.",
  };
}

export default async function InternalSharePackPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const pack = await getInternalSharePackById(id);
  if (!pack) {
    notFound();
  }

  const [allPacks, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getInternalSharePacks(),
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
  const resolved = resolveSharePack(pack, context);
  const options = buildSharePackLinkOptions(context);
  const relatedPackCount = allPacks.filter((item) => item.content_type === pack.content_type).length;

  return (
    <Container className="intro-grid internal-page share-internal-detail-page">
      <section className="hero internal-hero">
        <p className="eyebrow">compartilhar interno</p>
        <h1 className="hero__title">{resolved.title}</h1>
        <p className="hero__lead">{resolved.summary}</p>
        <div className="hero__actions">`r`n          <Link href="/interno/compartilhar" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={resolved.href} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{resolved.statusLabel}</h3>
            <p>Estado do pack.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">tipo</p>
            <h3>{resolved.typeLabel}</h3>
            <p>Conteúdo condensado.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">packs do tipo</p>
            <h3>{relatedPackCount}</h3>
            <p>Quantidade de packs ligados à mesma origem.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">edição do pack</p>
            <h2>Editar resumo e legenda.</h2>
          </div>
          <p className="section__lead">A edição do pack deve ser curta, direta e pronta para circular fora do site.</p>
        </div>

        <SharePackForm pack={pack} options={options} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">preview</p>
            <h2>Como isso vai circular.</h2>
          </div>
          <p className="section__lead">O preview ajuda a validar manchete, resumo e legenda antes de publicar o pack.</p>
        </div>

        <div className="grid-2">
          <SharePackCard
            pack={resolved}
            primaryHref={resolved.href}
            primaryLabel="Ver público"
            secondaryHref={resolved.contentHref}
            secondaryLabel="Abrir conteúdo"
          />
          <article className="support-box">
            <p className="eyebrow">nota editorial</p>
            <p>
              O pack é uma camada de circulação. Ele não substitui o conteúdo original; ele ajuda o conteúdo a sair do site com menos atrito e mais contexto.
            </p>
            <div className="stack-actions">
              <Link href="/compartilhar" className="button-secondary">
                Ver área pública
              </Link>
              <Link href={resolved.href} className="button-secondary">
                Abrir pacote
              </Link>
            </div>
          </article>
        </div>
      </section>

      <SharePackExportPanel pack={resolved} contentHref={resolved.contentHref} />
    </Container>
  );
}


