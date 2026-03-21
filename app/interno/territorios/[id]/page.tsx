import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/container";
import { PlaceHubCard } from "@/components/place-hub-card";
import { PlaceHubForm } from "@/components/place-hub-form";
import { PlaceHubLinkCard } from "@/components/place-hub-link-card";
import { PlaceHubLinkForm } from "@/components/place-hub-link-form";
import { PlaceHubPrimaryPiece } from "@/components/place-hub-primary-piece";
import { PlaceHubTimeline } from "@/components/place-hub-timeline";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";

import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { buildPlaceHubLinkOptions, buildPlaceHubTimeline, resolvePlaceHubLinks } from "@/lib/territories/resolve";
import { getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { getInternalPlaceHubById, getInternalPlaceHubLinks, getInternalPlaceHubs } from "@/lib/territories/queries";
import { removePlaceHubLinkAction } from "@/app/interno/territorios/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Território interno",
  description: "Curadoria e operação de um lugar vivo do VR Abandonada.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternalTerritoryDetailPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const { id } = await params;
  const placeHub = await getInternalPlaceHubById(id);

  if (!placeHub) {
    notFound();
  }

  const [territories, links, editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs] = await Promise.all([
    getInternalPlaceHubs({ status: "all" }),
    getInternalPlaceHubLinks(placeHub.id),
    getPublishedEditorialItems(),
    getPublishedMemoryItems(),
    getPublishedArchiveAssets(),
    getPublishedArchiveCollections(),
    getPublishedDossiers(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedThemeHubs(),
  ]);

  const resolvedLinks = resolvePlaceHubLinks(links, { editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs });
  const timelineEntries = buildPlaceHubTimeline(resolvedLinks);
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const options = buildPlaceHubLinkOptions({ editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs });
  const relatedPlaces = territories.filter((item) => item.id !== placeHub.id && (item.parent_place_slug === placeHub.parent_place_slug || item.place_type === placeHub.place_type || item.territory_label === placeHub.territory_label)).slice(0, 3);

  return (
    <Container className="intro-grid internal-page territory-internal-page">
      <section className="hero internal-hero">
        <p className="eyebrow">territórios internos</p>
        <h1 className="hero__title">{placeHub.title}</h1>
        <p className="hero__lead">Lugar editorial para ligar endereço, memória, documento e consequência pública.</p>
        <div className="meta-row">
          <span>{getPlaceHubStatusLabel(placeHub.status)}</span>
          {placeHub.place_type ? <span>{placeHub.place_type}</span> : null}
          {placeHub.territory_label ? <span>{placeHub.territory_label}</span> : null}
          {timelineEntries.length ? <span>{timelineEntries.length} marcos</span> : null}
        </div>
        <div className="hero__actions">`r`n          <Link href="/interno/territorios" className="button-secondary">
            Voltar à lista
          </Link>
          <Link href={`/territorios/${placeHub.slug}`} className="button">
            Ver público
          </Link>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-4">
          <article className="support-box">
            <p className="eyebrow">status</p>
            <h3>{getPlaceHubStatusLabel(placeHub.status)}</h3>
            <p>Estado narrativo do território.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">vínculos</p>
            <h3>{resolvedLinks.length}</h3>
            <p>Peças conectadas ao lugar.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">timeline</p>
            <h3>{timelineEntries.length}</h3>
            <p>Marcos e retornos organizados.</p>
          </article>
          <article className="support-box">
            <p className="eyebrow">destaque</p>
            <h3>{placeHub.featured ? "sim" : "não"}</h3>
            <p>Se o lugar deve puxar a home pública.</p>
          </article>
        </div>
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">editar</p>
            <h2>Dados do lugar</h2>
          </div>
          <p className="section__lead">Atualize título, território, hierarquia e visibilidade sem perder a leitura pública.</p>
        </div>

        <PlaceHubForm placeHub={placeHub} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">peça central</p>
            <h2>Entrada principal do território</h2>
          </div>
          <p className="section__lead">A peça central orienta o leitor no lugar.</p>
        </div>

        <PlaceHubPrimaryPiece placeHub={placeHub} leadLink={leadLink} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">timeline</p>
            <h2>Ordem de leitura</h2>
          </div>
          <p className="section__lead">Organize os marcos do lugar por ano, papel e ordenação do vínculo.</p>
        </div>

        <PlaceHubTimeline entries={timelineEntries} />
      </section>

      <section className="section internal-panel">
        <div className="grid-2">
          <div>
            <p className="eyebrow">vínculos</p>
            <h2>Ligações do território</h2>
          </div>
          <p className="section__lead">Conecte o lugar a pauta, memória, acervo, coleção, dossiê, campanha, impacto e eixo.</p>
        </div>

        <div className="grid-2">
          <div>
            <PlaceHubLinkForm placeHubId={placeHub.id} placeHubSlug={placeHub.slug} options={options} existingLinksCount={resolvedLinks.length} />
          </div>
          <div className="support-box">
            <h3>Vínculos já ligados</h3>
            <div className="stacked-list">
              {resolvedLinks.length ? (
                resolvedLinks.map((link) => (
                  <article className="card" key={link.id}>
                    <PlaceHubLinkCard link={link} />
                    <div className="stack-actions">
                      <Link href={link.href} className="button-secondary">
                        Abrir
                      </Link>
                      <form action={removePlaceHubLinkAction}>
                        <input type="hidden" name="place_hub_id" value={placeHub.id} />
                        <input type="hidden" name="link_id" value={link.id} />
                        <button type="submit" className="button-secondary">
                          Remover
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p>Nenhum vínculo registrado ainda.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {relatedPlaces.length ? (
        <section className="section internal-panel">
          <div className="grid-2">
            <div>
              <p className="eyebrow">lugares próximos</p>
              <h2>Outros territórios na mesma linha</h2>
            </div>
            <p className="section__lead">Ajuda a enxergar a cidade como rede de endereços conectados.</p>
          </div>

          <div className="grid-2">
            {relatedPlaces.map((item) => (
              <PlaceHubCard key={item.id} placeHub={item} href={`/interno/territorios/${item.id}`} itemCount={0} compact />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}


