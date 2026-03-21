import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { DossierCard } from "@/components/dossier-card";
import { PlaceHubCard } from "@/components/place-hub-card";
import { ActorHubCard } from "@/components/actor-hub-card";
import { PatternReadCard } from "@/components/pattern-read-card";
import { TimelineHighlightCard } from "@/components/timeline-highlight-card";
import { EditorialCard } from "@/components/editorial-card";
import { EditorialCover } from "@/components/editorial-cover";
import { EditorialHero } from "@/components/editorial-hero";
import { RadarItemCard } from "@/components/radar-item-card";
import { CampaignCard } from "@/components/campaign-card";
import { ImpactPrimaryPiece } from "@/components/impact-primary-piece";
import { EntryRouteCard } from "@/components/entry-route-card";
import { ParticipationPathCard } from "@/components/participation-path-card";
import { ThemeHubCard } from "@/components/theme-hub-card";
import { getPublishedDossierLinks, getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEntryRouteItems, getPublishedEntryRoutes } from "@/lib/entry-routes/queries";
import { getPublishedParticipationPathItems, getPublishedParticipationPaths } from "@/lib/participation/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getSharePackCardDownloadPath } from "@/lib/share-packs/navigation";
import { SaveReadButton } from "@/components/save-read-button";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getPublishedCampaigns, getPublishedCampaignLinks } from "@/lib/campaigns/queries";
import { getPublishedImpactLinks, getPublishedImpacts } from "@/lib/impact/queries";
import { getRadarHomeItems } from "@/lib/radar/queries";
import { getPublishedPlaceHubLinks, getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedActorHubLinks, getPublishedActorHubs } from "@/lib/actors/queries";
import { getPublishedPatternReadLinks, getPublishedPatternReads } from "@/lib/patterns/queries";
import { getPublishedTimelineHighlights, getPublishedTimelineHighlightLinks } from "@/lib/timeline/highlight-queries";
import { EditionPrimaryPiece } from "@/components/edition-primary-piece";
import { getPublishedEditorialEditionLinks, getPublishedEditorialEditions } from "@/lib/editions/queries";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function HomePage() {
  const items = await getPublishedEditorialItems();
  const dossiers = await getPublishedDossiers();
  const hubs = await getPublishedThemeHubs();
  const dossierIds = dossiers.map((dossier) => dossier.id);
  const updatesByDossierId = await getPublishedDossierUpdatesByDossierIds(dossierIds);
  const featuredItem = items[0] ?? null;
  const secondaryItems = items.slice(1, 4);
  const seriesCards = getEditorialSeriesCards(items);
  const featuredSeries = seriesCards.slice(0, 4);
  const featuredDossier = dossiers[0] ?? null;
  const featuredDossierLinkCount = featuredDossier ? (await getPublishedDossierLinks(featuredDossier.id)).length : 0;
  const featuredDossierUpdate = featuredDossier ? updatesByDossierId.get(featuredDossier.id)?.[0] ?? null : null;
  const featuredHubs = hubs.slice(0, 3);
  const campaigns = await getPublishedCampaigns();
  const featuredCampaign = campaigns[0] ?? null;
  const featuredCampaignLinks = featuredCampaign ? await getPublishedCampaignLinks(featuredCampaign.id) : [];
  const impacts = await getPublishedImpacts();
  const featuredImpact = impacts.find((impact) => impact.featured && impact.status === "ongoing") ?? impacts.find((impact) => impact.status === "ongoing") ?? impacts[0] ?? null;
  const featuredImpactLinks = featuredImpact ? await getPublishedImpactLinks(featuredImpact.id) : [];
  const placeHubs = await getPublishedPlaceHubs();
  const featuredPlaceHub = placeHubs.find((place) => place.featured && place.status === "active") ?? placeHubs.find((place) => place.status === "active") ?? placeHubs[0] ?? null;
  const featuredPlaceHubLinks = featuredPlaceHub ? await getPublishedPlaceHubLinks(featuredPlaceHub.id) : [];
  const actors = await getPublishedActorHubs();
  const featuredActor = actors.find((actor) => actor.featured && actor.status === "active") ?? actors.find((actor) => actor.status === "active") ?? actors[0] ?? null;
  const featuredActorLinks = featuredActor ? await getPublishedActorHubLinks(featuredActor.id) : [];
  const editions = await getPublishedEditorialEditions();
  const featuredEdition = editions.find((edition) => edition.featured && edition.status === "published") ?? editions.find((edition) => edition.status === "published") ?? editions[0] ?? null;
  const featuredEditionLinks = featuredEdition ? await getPublishedEditorialEditionLinks(featuredEdition.id) : [];
  const patternReads = await getPublishedPatternReads();
  const featuredPattern = patternReads.find((pattern) => pattern.featured && pattern.status === "active") ?? patternReads.find((pattern) => pattern.status === "active") ?? patternReads[0] ?? null;
  const featuredPatternLinks = featuredPattern ? await getPublishedPatternReadLinks(featuredPattern.id) : [];
  const timelineHighlights = await getPublishedTimelineHighlights();
  const featuredTimelineHighlights = timelineHighlights.slice(0, 2);
  const timelineHighlightCounts = new Map(
    await Promise.all(featuredTimelineHighlights.map(async (highlight) => [highlight.id, (await getPublishedTimelineHighlightLinks(highlight.id)).length] as const)),
  );
  const radarItems = await getRadarHomeItems(3);
  const entryRoutes = await getPublishedEntryRoutes();
  const entryRouteCounts = new Map(
    await Promise.all(entryRoutes.map(async (route) => [route.id, (await getPublishedEntryRouteItems(route.id)).length] as const)),
  );
  const featuredStartRoutes = entryRoutes.filter((route) => route.featured).slice(0, 3);
  const startRoutes = featuredStartRoutes.length ? featuredStartRoutes : entryRoutes.slice(0, 3);
  const participationPaths = await getPublishedParticipationPaths();
  const participationCounts = new Map(
    await Promise.all(participationPaths.map(async (path) => [path.id, (await getPublishedParticipationPathItems(path.id)).length] as const)),
  );
  const featuredParticipationPaths = participationPaths.filter((path) => path.featured).slice(0, 4);
  const participationHighlights = featuredParticipationPaths.length ? featuredParticipationPaths : participationPaths.slice(0, 4);

  return (
    <Container className="intro-grid landing-page">
      <section className="hero hero--split landing-hero">
        <div className="hero__copy landing-hero__copy">
          <p className="eyebrow">{site.hero.kicker}</p>
          <h1 className="hero__title">{site.hero.title}</h1>
          <p className="hero__lead">{site.hero.lead}</p>

          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">arquivo vivo</span>
            <span className="home-hero__signal">denúncia com contexto</span>
            <span className="home-hero__signal">organização popular</span>
          </div>

          <div className="hero__actions">
            {site.hero.ctas.map((cta, index) =>
              index === 0 ? (
                <Link key={cta.href} href={cta.href} className="button">
                  {cta.label}
                </Link>
              ) : (
                <Link key={cta.href} href={cta.href} className="button-secondary">
                  {cta.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <EditorialCover
          title={site.hero.title}
          primaryTag="arquivo vivo"
          seriesTitle="VR Abandonada"
          coverImageUrl="/editorial/covers/arquivo-inicial.svg"
          coverVariant="night"
        />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">O que é o VR Abandonada</p>
            <h2>Uma casa digital para memória, denúncia e organização popular.</h2>
          </div>
          <p className="section__lead">
            O projeto existe para reunir arquivo, pauta e apoio numa mesma casa editorial. Ele documenta o que a cidade vive, o que tentam esconder e o que precisa virar ação pública.
          </p>
        </div>

        <div className="grid-3">
          {site.principles.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section home-start-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Por onde começar</p>
            <h2>Rotas curtas para entrar sem dispersão.</h2>
          </div>
          <p className="section__lead">
            Se você chegou agora, escolha uma porta guiada: projeto em 5 minutos, tema, memória ou acompanhamento do agora.
          </p>
        </div>

        <div className="grid-3">
          {startRoutes.map((route) => (
            <EntryRouteCard key={route.id} route={route} href={`/comecar/${route.slug}`} itemCount={entryRouteCounts.get(route.id) ?? 0} compact />
          ))}
        </div>

        <div className="stack-actions">
          <Link href="/comecar" className="button-secondary">
            Abrir guias de leitura
          </Link>
        </div>
      </section>

      <section className="section home-participation-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Participe</p>
            <h2>O que fazer depois de entender o projeto.</h2>
          </div>
          <p className="section__lead">
            A participação não começa em um formulário. Ela começa no gesto certo: enviar, apoiar, preservar ou compartilhar com contexto.
          </p>
        </div>

        <div className="grid-2">
          {participationHighlights.map((path) => (
            <ParticipationPathCard key={path.id} path={path} href={`/participe/${path.slug}`} itemCount={participationCounts.get(path.id) ?? 0} compact />
          ))}
        </div>

        <div className="stack-actions">
          <Link href="/participe" className="button-secondary">
            Abrir caminhos de participação
          </Link>
          <Link href="/metodo" className="button-secondary">
            Entender o método
          </Link>
        </div>
      </section>

      {featuredItem ? (
        <section className="section home-featured-wrap">
          <div className="grid-2">
            <div>
              <p className="eyebrow">Pauta principal</p>
              <h2>Radar editorial em destaque.</h2>
            </div>
            <p className="section__lead">
              O destaque da vez abre caminho para a leitura e puxa o restante do arquivo sem virar feed solto.
            </p>
          </div>
          <EditorialHero item={featuredItem} />
        </section>
      ) : null}

      {featuredDossier ? (
        <section className="section home-dossier-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">Investigação em curso</p>
              <h2>Uma linha maior para reunir documento, memória e pauta.</h2>
            </div>
            <p className="section__lead">
              O dossiê organiza o arquivo como percurso. Quem entra por aqui encontra uma hipótese pública, materiais de base, desdobramentos e a última atualização da linha.
            </p>
          </div>

          <div className="grid-2">
            <DossierCard
              dossier={featuredDossier}
              href={`/dossies/${featuredDossier.slug}`}
              itemCount={featuredDossierLinkCount}
              latestUpdate={featuredDossierUpdate}
            />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>Não é uma página solta.</h3>
              <p>
                O dossiê costura o caso, aponta a pergunta central e distribui a leitura entre pauta, memória, acervo, coleção e atualização pública.
              </p>
              {featuredDossierUpdate ? (
                <article className="support-box">
                  <p className="eyebrow">última movimentação</p>
                  <h4>{featuredDossierUpdate.title}</h4>
                  <p>{featuredDossierUpdate.excerpt || featuredDossierUpdate.body}</p>
                </article>
              ) : null}
              <div className="stack-actions">
                <Link href={`/dossies/${featuredDossier.slug}`} className="button">
                  Abrir dossiê
                </Link>
                <Link href="/envie" className="button-secondary">
                  Enviar pista
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {radarItems.length ? (
        <section className="section home-radar-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">Agora no VR Abandonada</p>
              <h2>O pulso editorial do momento.</h2>
            </div>
            <p className="section__lead">
              O que mudou, o que está em curso e o que merece retorno imediato. Uma superfície curta para quem quer voltar ao site sem perder o fio.
            </p>
          </div>

          <div className="grid-3">
            {radarItems.map((item) => (
              <RadarItemCard key={item.id} item={item} compact />
            ))}
          </div>
          <div className="stack-actions">
            <Link href="/agora" className="button-secondary">
              Ver radar completo
            </Link>
            <Link href="/acompanhar" className="button-secondary">
              Acompanhar frentes
            </Link>
          </div>
        </section>
      ) : null}

      {featuredTimelineHighlights.length ? (
        <section className="section home-timeline-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">marcos da cidade</p>
              <h2>Rupturas e continuidades que estruturam a leitura histórica.</h2>
            </div>
            <p className="section__lead">Os marcos curados dão o mapa da disputa antes de seguir para a cronologia ampla e para a camada de acompanhamento.</p>
          </div>

          <div className="grid-2">
            {featuredTimelineHighlights.map((highlight) => (
              <TimelineHighlightCard
                key={highlight.id}
                highlight={highlight}
                href={`/linha-do-tempo/marcos/${highlight.slug}`}
                itemCount={timelineHighlightCounts.get(highlight.id) ?? 0}
                latestMovement={highlight.lead_question || highlight.excerpt || highlight.description}
                compact
              />
            ))}
          </div>

          <div className="stack-actions">
            <Link href="/linha-do-tempo" className="button-secondary">
              Abrir linha do tempo
            </Link>
            <Link href="/buscar" className="button-secondary">
              Buscar marcos
            </Link>
          </div>
        </section>
      ) : null}

      {featuredEdition ? (
        <section className="section home-edition-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">Edição do momento</p>
              <h2>Uma síntese para circular o que o radar está dizendo.</h2>
            </div>
            <p className="section__lead">
              A edição concentra o pulso do momento, costura campanha, impacto, padrão e dossiê, e devolve ao público uma leitura pronta para compartilhar.
            </p>
          </div>

          <div className="grid-2">
            <EditionPrimaryPiece
              title={featuredEdition.title}
              excerpt={featuredEdition.excerpt}
              description={featuredEdition.description}
              status={featuredEdition.status}
              editionType={featuredEdition.edition_type}
              periodLabel={featuredEdition.period_label}
              publishedAt={featuredEdition.published_at}
              href={`/edicoes/${featuredEdition.slug}`}
              linkCount={featuredEditionLinks.length}
              latestLink={featuredEditionLinks[0] ?? null}
            />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>A síntese dá ritmo ao arquivo.</h3>
              <p>
                Em vez de deixar o leitor montar o quebra-cabeça, a edição entrega uma leitura rápida do estado do momento e aponta para onde seguir.
              </p>
              <div className="stack-actions">
                <Link href={`/edicoes/${featuredEdition.slug}`} className="button">
                  Abrir edição
                </Link>
                <SaveReadButton kind="edition" keyValue={featuredEdition.slug} title={featuredEdition.title} summary={featuredEdition.excerpt || featuredEdition.description || featuredEdition.title} href={`/edicoes/${featuredEdition.slug}`} compact />
                <Link href="/edicoes" className="button-secondary">
                  Ver edições
                </Link>
                <Link href={getSharePackCardDownloadPath("edicao", featuredEdition.slug, "square")} className="button-secondary">
                  Baixar card
                </Link>
                <Link href="/agora" className="button-secondary">
                  Ver radar
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {featuredCampaign ? (
        <section className="section home-campaign-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">Chamado em curso</p>
              <h2>O foco temporário que está puxando o momento.</h2>
            </div>
            <p className="section__lead">
              Campanhas condensam investigação, participação, método e apoio quando o projeto precisa concentrar atenção coletiva em um ponto específico.
            </p>
          </div>

          <div className="grid-2">
            <CampaignCard campaign={featuredCampaign} href={`/campanhas/${featuredCampaign.slug}`} itemCount={featuredCampaignLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que agora</p>
              <h3>O chamado do momento não é marketing. É foco público.</h3>
              <p>
                Use a campanha para entender o que está em jogo, reunir o que ajuda de verdade e seguir para o método, a participação e o radar.
              </p>
              <div className="stack-actions">
                <Link href={`/campanhas/${featuredCampaign.slug}`} className="button">
                  Abrir campanha
                </Link>
                <Link href="/participe" className="button-secondary">
                  Ver participação
                </Link>
                <Link href="/metodo" className="button-secondary">
                  Ler método
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}
      {featuredImpact ? (
        <section className="section home-impact-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">o que já mudou</p>
              <h2>A consequência pública que dá continuidade ao projeto.</h2>
            </div>
            <p className="section__lead">
              Impacto registra o que mudou por causa de uma pauta, campanha ou investigação, sem prometer causalidade total nem virar dashboard frio.
            </p>
          </div>

          <div className="grid-2">
            <ImpactPrimaryPiece
              title={featuredImpact.title}
              question={featuredImpact.lead_question}
              description={featuredImpact.excerpt || featuredImpact.description}
              status={featuredImpact.status}
              impactType={featuredImpact.impact_type}
              dateLabel={featuredImpact.date_label}
              happenedAt={featuredImpact.happened_at}
              territoryLabel={featuredImpact.territory_label}
              href={`/impacto/${featuredImpact.slug}`}
              linkCount={featuredImpactLinks.length}
              latestLink={featuredImpactLinks[0] ?? null}
            />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>Uma consequência pública precisa continuar visível.</h3>
              <p>
                Aqui o projeto presta conta sem relatório burocrático: mostra o que mudou, o que segue em aberto e para onde ir depois.
              </p>
              <div className="stack-actions">
                <Link href={`/impacto/${featuredImpact.slug}`} className="button">
                  Abrir impacto
                </Link>
                <Link href="/campanhas" className="button-secondary">
                  Ver campanhas
                </Link>
                <Link href="/agora" className="button-secondary">
                  Ver radar
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

            {featuredPlaceHub ? (
        <section className="section home-territory-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">a cidade por lugares</p>
              <h2>Territórios vivos para entrar por endereço, bairro e ponto crítico.</h2>
            </div>
            <p className="section__lead">
              Os lugares ajudam a localizar o conflito no mapa concreto da cidade e conectam memória, arquivo, pauta e consequência pública sem virar mapa burocrático.
            </p>
          </div>

          <div className="grid-2">
            <PlaceHubCard placeHub={featuredPlaceHub} href={`/territorios/${featuredPlaceHub.slug}`} itemCount={featuredPlaceHubLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>O território dá chão ao arquivo vivo.</h3>
              <p>
                Aqui o projeto mostra que memória e conflito têm endereço. Entre pelo lugar e siga para os casos, documentos e impactos ligados a ele.
              </p>
              <div className="stack-actions">
                <Link href={`/territorios/${featuredPlaceHub.slug}`} className="button">
                  Abrir território
                </Link>
                <Link href="/territorios" className="button-secondary">
                  Ver atlas
                </Link>
                <Link href="/memoria" className="button-secondary">
                  Ver memória
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {featuredActor ? (
        <section className="section home-actors-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">quem atravessa os conflitos da cidade</p>
              <h2>Entrar pelo nome recorrente da responsabilidade.</h2>
            </div>
            <p className="section__lead">
              Atores, instituições e equipamentos ajudam a localizar o poder que reaparece nos casos. A leitura cruza pauta, memória, território, campanha e impacto.
            </p>
          </div>

          <div className="grid-2">
            <ActorHubCard actorHub={featuredActor} href={`/atores/${featuredActor.slug}`} itemCount={featuredActorLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>O projeto também lê quem atravessa o conflito.</h3>
              <p>
                Entre pelo ator e siga para os lugares, os dossiês, os impactos e os chamados públicos ligados a ele.
              </p>
              <div className="stack-actions">
                <Link href={`/atores/${featuredActor.slug}`} className="button">
                  Abrir ator
                </Link>
                <Link href="/atores" className="button-secondary">
                  Ver mapa de atores
                </Link>
                <Link href="/territorios" className="button-secondary">
                  Ver territórios
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {featuredPattern ? (
        <section className="section home-patterns-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">o que se repete na cidade</p>
              <h2>Leitura estrutural para sair do caso isolado.</h2>
            </div>
            <p className="section__lead">
              Padrões juntam as peças que insistem em voltar. Aqui a cidade aparece como recorrência, não como acúmulo de posts.
            </p>
          </div>

          <div className="grid-2">
            <PatternReadCard patternRead={featuredPattern} href={`/padroes/${featuredPattern.slug}`} itemCount={featuredPatternLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa</p>
              <h3>O padrão mostra a estrutura por trás do conflito.</h3>
              <p>
                Entre pela recorrência e siga para atores, territórios, impactos e casos que voltam a se cruzar no tempo.
              </p>
              <div className="stack-actions">
                <Link href={`/padroes/${featuredPattern.slug}`} className="button">
                  Abrir padrão
                </Link>
                <Link href="/padroes" className="button-secondary">
                  Ver padrões
                </Link>
                <Link href="/atores" className="button-secondary">
                  Ver atores
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section home-hubs-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Grandes frentes</p>
            <h2>Entrar pelo tema, não pelo formato.</h2>
          </div>
          <p className="section__lead">
            Os eixos atravessam o site inteiro e ajudam a encontrar, no mesmo lugar, pauta, memória, acervo e dossiê.
          </p>
        </div>

        <div className="grid-3">
          {featuredHubs.map((hub) => (
            <ThemeHubCard key={hub.id} hub={hub} href={`/eixos/${hub.slug}`} itemCount={0} compact />
          ))}
        </div>
        <div className="stack-actions">
          <Link href="/eixos" className="button-secondary">
            Abrir mapa temático
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Pautas em sequência</p>
            <h2>Mais leituras que mantêm o fio puxado.</h2>
          </div>
          <p className="section__lead">
            As pautas abaixo entram como continuidade do arquivo e funcionam melhor quando lidas em conjunto.
          </p>
        </div>

        <div className="grid-3">
          {(secondaryItems.length ? secondaryItems : items.slice(0, 3)).map((item) => (
            <EditorialCard key={item.id} item={item} href={`/pautas/${item.slug}`} compact />
          ))}
        </div>
        <div className="stack-actions">
          <Link href="/memoria" className="button-secondary">
            Entrar no arquivo vivo
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Eixos editoriais</p>
            <h2>Uma navegação pública por conflito, memória e território.</h2>
          </div>
          <p className="section__lead">
            Os eixos ajudam a entender que a página não é um acúmulo de posts. Ela organiza disputa, contexto e recorrência.
          </p>
        </div>

        <div className="grid-4">
          {site.editorialAxes.map((item) => (
            <article className="card" key={item.title}>
              <span className="pill">Eixo</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Séries em evidência</p>
            <h2>Linhas de investigação com continuidade visual.</h2>
          </div>
          <p className="section__lead">
            Cada série dá corpo ao arquivo e ajuda a ler o projeto como método, não como coleção de peças isoladas.
          </p>
        </div>

        <div className="series-grid landing-series-grid">
          {featuredSeries.map((series) => (
            <article className="series-card landing-series-card" key={series.slug}>
              <EditorialCover
                title={series.title}
                primaryTag="Série"
                seriesTitle={series.title}
                coverImageUrl={series.coverImageUrl ?? null}
                coverVariant={series.coverVariant}
              />
              <div className="series-card__body">
                <p className="eyebrow">{series.axis}</p>
                <h3>{series.title}</h3>
                <p>{series.description}</p>
                <p className="series-card__count">
                  {series.items.length} pauta{series.items.length === 1 ? "" : "s"}
                </p>
                <Link href={`/series/${series.slug}`} className="button-secondary">
                  Ver série
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section home-memory-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Memória e arquivo vivo</p>
            <h2>Preservar a cidade antes que ela seja reescrita.</h2>
          </div>
          <p className="section__lead">
            A memória entra como arquivo vivo: o que a cidade foi, o que deixou de ser e o que insiste em aparecer apesar do apagamento.
          </p>
        </div>

        <div className="grid-3">
          {site.memoryHighlights.map((item) => (
            <article className="quote" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section home-intake-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Envie sua denúncia</p>
            <h2>Se é urgente, precisa entrar com contexto e cuidado.</h2>
          </div>
          <p className="section__lead">
            O canal de envio foi feito para relatos, documentos e sinais de problema público. Denúncia anônima é possível.
          </p>
        </div>

        <div className="grid-2">
          <div className="support-box home-callout">
            <h3>O que pode entrar</h3>
            <ul>
              {site.intakeNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="support-box home-callout home-callout--accent">
            <h3>Enviar agora</h3>
            <p>
              Se houver dado sensível, descreva o nível de risco. Se houver urgência, marque isso no começo do relato.
            </p>
            <div className="stack-actions">
              <Link href="/envie" className="button">
                Abrir canal de envio
              </Link>
              <Link href="/metodo" className="button-secondary">
                Entender o método
              </Link>
              <Link href="/sobre" className="button-secondary">
                Entender o cuidado editorial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-support-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Apoie o projeto</p>
            <h2>Sem base coletiva, o projeto não sustenta ritmo.</h2>
          </div>
          <p className="section__lead">
            O apoio sustenta apuração, redação, design, infraestrutura e o tempo necessário para transformar relato em publicação séria.
          </p>
        </div>

        <div className="grid-2">
          <div className="support-box home-callout">
            <h3>Como apoiar</h3>
            <ul>
              {site.supportWays.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="support-box home-callout">
            <h3>Onde sua ajuda entra</h3>
            <p>
              Em leitura, material, colaboração técnica, revisão, design, rede e, quando disponível, apoio financeiro.
            </p>
            <div className="stack-actions">
              <Link href="/apoie" className="button">
                Apoiar o projeto
              </Link>
              <Link href="/participe" className="button-secondary">
                Ver participação
              </Link>
              <Link href="/manifesto" className="button-secondary">
                Ler o manifesto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-manifesto">
        <div className="grid-2">
          <div>
            <p className="eyebrow">Manifesto curto</p>
            <h2>O projeto existe para nomear a cidade em disputa.</h2>
          </div>
          <p className="section__lead">
            VR Abandonada é arquivo, denúncia e organização popular. Quem chega pela home precisa entender isso em poucos segundos.
          </p>
        </div>

        <div className="grid-3">
          {site.manifestoPhrases.map((phrase) => (
            <article className="card" key={phrase}>
              <p className="manifesto-line">{phrase}</p>
            </article>
          ))}
        </div>

        <div className="stack-actions">
          <Link href="/manifesto" className="button">
            Ler manifesto completo
          </Link>
          <Link href="/pautas" className="button-secondary">
            Entrar no arquivo
          </Link>
        </div>
      </section>
    </Container>
  );
}























