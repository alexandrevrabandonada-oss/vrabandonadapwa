import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { SharePackCard } from "@/components/share-pack-card";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getInternalSharePacks } from "@/lib/share-packs/queries";
import { resolveSharePacks, groupSharePacksByType } from "@/lib/share-packs/resolve";

export default async function InternalSharePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const [packs, editions, campaigns, impacts, dossiers, pautas, patterns] = await Promise.all([
    getInternalSharePacks(),
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
  const featuredPack = resolvedPacks.find((pack) => pack.featured) ?? resolvedPacks[0] ?? null;
  const statusSections = [
    { key: "published", title: "Publicados" },
    { key: "draft", title: "Rascunhos" },
    { key: "archived", title: "Arquivados" },
  ] as const;

  return (
    <Container className="intro-grid internal-page share-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">compartilhar interno</p>
        <h1 className="hero__title">Pacotes de circulação do ecossistema.</h1>
        <p className="hero__lead">Organize links, resumos e legendas para que a leitura saia do site sem perder o corte editorial.</p>
        <div className="hero__actions">
          <Link href="/interno/compartilhar/novo" className="button">
            Novo pack
          </Link>
          <Link href="/compartilhar" className="button-secondary">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-3">
          <article className="support-box">
            <p className="eyebrow">packs públicos</p>
            <h3>{resolvedPacks.filter((pack) => pack.share_status === "published" && pack.public_visibility).length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">destaques</p>
            <h3>{resolvedPacks.filter((pack) => pack.featured).length}</h3>
          </article>
          <article className="support-box">
            <p className="eyebrow">em rascunho</p>
            <h3>{resolvedPacks.filter((pack) => pack.share_status === "draft").length}</h3>
          </article>
        </div>
      </section>

      {featuredPack ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">em destaque</p>
              <h2>{featuredPack.title}</h2>
            </div>
            <p className="section__lead">O pack em destaque ajuda a transformar o melhor conteúdo do momento em circulação pronta.</p>
          </div>

          <div className="grid-2">
            <SharePackCard
              pack={featuredPack}
              primaryHref={`/interno/compartilhar/${featuredPack.id}`}
              primaryLabel="Editar pack"
              secondaryHref={featuredPack.href}
              secondaryLabel="Ver público"
            />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">nota</p>
              <p>
                Use o pacote para fazer a ponte entre o texto no site e a legenda fora dele. O objetivo é reduzir ruído e aumentar retorno recorrente.
              </p>
              <div className="stack-actions">
                <Link href="/edicoes" className="button-secondary">
                  Ver edições
                </Link>
                <Link href="/campanhas" className="button-secondary">
                  Ver campanhas
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {statusSections.map((section) => {
        const items = resolvedPacks.filter((pack) => pack.share_status === section.key);
        if (!items.length) {
          return null;
        }

        return (
          <section className="section internal-panel" key={section.key}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{section.title}</p>
                <h2>Pacotes em circulação.</h2>
              </div>
              <p className="section__lead">Packs por estado editorial e por tipo de conteúdo.</p>
            </div>

            <div className="grid-2">
              {items.map((pack) => (
                <SharePackCard
                  key={pack.id}
                  pack={pack}
                  primaryHref={`/interno/compartilhar/${pack.id}`}
                  primaryLabel="Editar pack"
                  secondaryHref={pack.href}
                  secondaryLabel="Ver público"
                  compact
                />
              ))}
            </div>
          </section>
        );
      })}

      {Object.entries(grouped).map(([type, items]) => {
        if (!items.length) {
          return null;
        }

        return (
          <section className="section internal-panel" key={type}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{type}</p>
                <h2>Leitura por formato.</h2>
              </div>
              <p className="section__lead">Os packs por tipo ajudam a manter a circulação coerente com o lugar de origem.</p>
            </div>

            <div className="grid-2">
              {items.map((pack) => (
                <SharePackCard
                  key={pack.id}
                  pack={pack}
                  primaryHref={`/interno/compartilhar/${pack.id}`}
                  primaryLabel="Editar pack"
                  secondaryHref={pack.href}
                  secondaryLabel="Ver público"
                  compact
                />
              ))}
            </div>
          </section>
        );
      })}
    </Container>
  );
}
