import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { FollowButton } from "@/components/follow-button";
import { EditorialCover } from "@/components/editorial-cover";
import { PlaceHubCard } from "@/components/place-hub-card";
import { PlaceHubPrimaryPiece } from "@/components/place-hub-primary-piece";
import { PlaceHubTimeline } from "@/components/place-hub-timeline";
import { PlaceHubLinkCard } from "@/components/place-hub-link-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";

import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { buildPlaceHubTimeline, groupPlaceHubLinksByType, resolvePlaceHubLinks } from "@/lib/territories/resolve";
import { getPublishedPlaceHubBySlug, getPublishedPlaceHubLinks, getPublishedPlaceHubs } from "@/lib/territories/queries";

export async function generateStaticParams() {
  const items = await getPublishedPlaceHubs();
  return items.map((item) => ({ slug: item.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPublishedPlaceHubBySlug(slug);

  if (!place) {
    return {
      title: "Territórios",
      description: "Atlas vivo de bairros e lugares do VR Abandonada.",
      openGraph: {
        title: "Territórios | VR Abandonada",
        description: "Atlas vivo de bairros e lugares do VR Abandonada.",
        type: "article",
        images: [getHomeOpenGraphImagePath()],
      },
    };
  }

  return {
    title: place.title,
    description: place.excerpt || place.description || "Lugar vivo do VR Abandonada.",
    openGraph: {
      title: place.title,
      description: place.excerpt || place.description || "Lugar vivo do VR Abandonada.",
      type: "article",
      images: [place.cover_image_url || getHomeOpenGraphImagePath()],
    },
    twitter: {
      card: "summary_large_image",
      title: place.title,
      description: place.excerpt || place.description || "Lugar vivo do VR Abandonada.",
      images: [place.cover_image_url || getHomeOpenGraphImagePath()],
    },
  };
}

export default async function TerritoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const placeHub = await getPublishedPlaceHubBySlug(slug);

  if (!placeHub) {
    notFound();
  }

  const [territories, links, editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, themeHubs] = await Promise.all([
    getPublishedPlaceHubs(),
    getPublishedPlaceHubLinks(placeHub.id),
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

  const linksByType = groupPlaceHubLinksByType(resolvedLinks);
  const leadLink = resolvedLinks.find((link) => link.link_role === "lead") ?? resolvedLinks[0] ?? null;
  const relatedPlaces = territories.filter((item) => item.slug !== placeHub.slug && (item.parent_place_slug === placeHub.parent_place_slug || item.place_type === placeHub.place_type || item.territory_label === placeHub.territory_label)).slice(0, 3);
  const relatedPlaceCounts = new Map(
    await Promise.all(relatedPlaces.map(async (item) => [item.id, (await getPublishedPlaceHubLinks(item.id)).length] as const)),
  );


  return (
    <Container className="intro-grid territory-detail-page">
      <section className="section editorial-detail-hero">
        <div className="editorial-hero__copy">
          <p className="eyebrow">território público</p>
          <h1>{placeHub.title}</h1>
          <p className="hero__lead">{placeHub.excerpt || placeHub.description}</p>
          <div className="meta-row">
            <span>{getPlaceHubStatusLabel(placeHub.status)}</span>
            <span>{getPlaceHubPlaceTypeLabel(placeHub.place_type)}</span>
            {placeHub.territory_label ? <span>{placeHub.territory_label}</span> : null}
            {placeHub.address_label ? <span>{placeHub.address_label}</span> : null}
            {placeHub.parent_place_slug ? <span>Hierarquia: {placeHub.parent_place_slug}</span> : null}
          </div>
          {placeHub.lead_question ? <p className="impact-primary-piece__question">{placeHub.lead_question}</p> : null}
          <div className="stack-actions">
            <Link href="/territorios" className="button-secondary">
              Ver territórios
            </Link>
            <Link href="/participe" className="button-secondary">
              Participar
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ler método
            </Link>
            <FollowButton kind="territory" keyValue={placeHub.slug} title={placeHub.title} summary={placeHub.excerpt || placeHub.description || placeHub.title} href={`/territorios/${placeHub.slug}`} compact />
          </div>
        </div>
        <EditorialCover
          title={placeHub.title}
          primaryTag={getPlaceHubStatusLabel(placeHub.status)}
          seriesTitle={placeHub.territory_label || placeHub.address_label || placeHub.place_type}
          coverImageUrl={placeHub.cover_image_url}
          coverVariant={placeHub.featured ? "ember" : "concrete"}
        />
      </section>

      <section className="section editorial-article">
        <div className="editorial-article__meta">
          <p className="eyebrow">o que está em jogo</p>
          <p>{getPlaceHubStatusLabel(placeHub.status)}</p>
        </div>

        <div className="editorial-article__body">
          <p>{placeHub.description}</p>
          {placeHub.address_label ? <p>Endereço público: {placeHub.address_label}</p> : null}
          {placeHub.latitude && placeHub.longitude ? <p>Coordenadas editoriais: {placeHub.latitude}, {placeHub.longitude}</p> : null}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">por onde começar neste lugar</p>
            <h2>Peça central e entrada editorial.</h2>
          </div>
          <p className="section__lead">A primeira peça organiza o percurso e ajuda a ligar o lugar ao arquivo vivo.</p>
        </div>

        <PlaceHubPrimaryPiece placeHub={placeHub} leadLink={leadLink} />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">linha do lugar</p>
            <h2>Marcos, retornos e movimentações.</h2>
          </div>
          <p className="section__lead">A timeline leve ajuda a ler o endereço como caso, memória e consequência pública.</p>
        </div>

        <PlaceHubTimeline entries={timelineEntries} />
      </section>

      {linksByType.editorial?.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">pautas e investigação</p>
              <h2>Leituras que abrem o território.</h2>
            </div>
            <p className="section__lead">As pautas ajudam a entrar pelo tema e depois descer para o lugar.</p>
          </div>

          <div className="grid-3">
            {linksByType.editorial.map((link) => <PlaceHubLinkCard key={link.id} link={link} compact />)}
          </div>
        </section>
      ) : null}

      {linksByType.dossier?.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">dossiês</p>
              <h2>Casos que sustentam a leitura do lugar.</h2>
            </div>
            <p className="section__lead">O lugar não fica isolado: ele aponta para a investigação maior.</p>
          </div>

          <div className="grid-3">
            {linksByType.dossier.map((link) => <PlaceHubLinkCard key={link.id} link={link} compact />)}
          </div>
        </section>
      ) : null}

      {linksByType.memory?.length || linksByType.archive?.length || linksByType.collection?.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">memória e acervo</p>
              <h2>Do arquivo ao conflito atual.</h2>
            </div>
            <p className="section__lead">Documentos, imagens e lembranças ajudam a ler continuidades e rupturas no território.</p>
          </div>

          <div className="grid-3">
            {[...(linksByType.memory ?? []), ...(linksByType.archive ?? []), ...(linksByType.collection ?? [])].map((link) => (
              <PlaceHubLinkCard key={link.id} link={link} compact />
            ))}
          </div>
        </section>
      ) : null}

      {linksByType.campaign?.length || linksByType.impact?.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">campanhas e impacto</p>
              <h2>O que mudou ou precisa mudar neste lugar.</h2>
            </div>
            <p className="section__lead">O território mostra consequências, chamados públicos e mobilizações que nascem ou retornam ao endereço.</p>
          </div>

          <div className="grid-3">
            {[...(linksByType.campaign ?? []), ...(linksByType.impact ?? [])].map((link) => (
              <PlaceHubLinkCard key={link.id} link={link} compact />
            ))}
          </div>
        </section>
      ) : null}

      {linksByType.hub?.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">eixos e contexto maior</p>
              <h2>O lugar dentro da linha temática da cidade.</h2>
            </div>
            <p className="section__lead">Entrar pelo território também ajuda a encontrar o eixo maior que organiza a disputa.</p>
          </div>

          <div className="grid-3">
            {linksByType.hub.map((link) => <PlaceHubLinkCard key={link.id} link={link} compact />)}
          </div>
        </section>
      ) : null}

      {relatedPlaces.length ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">lugares próximos</p>
              <h2>Outras entradas territoriais na mesma linha.</h2>
            </div>
            <p className="section__lead">O atlas funciona melhor quando o lugar leva a outros pontos da cidade.</p>
          </div>

          <div className="grid-3">
            {relatedPlaces.map((item) => (
              <PlaceHubCard key={item.id} placeHub={item} href={`/territorios/${item.slug}`} itemCount={relatedPlaceCounts.get(item.id) ?? 0} compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhe este lugar</p>
            <h2>Leitura, envio e continuidade pública.</h2>
          </div>
          <p className="section__lead">Se este endereço importa para sua memória, relato ou documento, o caminho certo continua sendo o envio responsável.</p>
        </div>

        <div className="stack-actions">
          <Link href="/envie" className="button-secondary">
            Enviar material
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
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

