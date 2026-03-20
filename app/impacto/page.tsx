import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ImpactCard } from "@/components/impact-card";
import { ImpactPrimaryPiece } from "@/components/impact-primary-piece";
import { getPublishedImpactLinks, getPublishedImpacts } from "@/lib/impact/queries";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";

export const metadata: Metadata = {
  title: "Impacto",
  description: "Chamados públicos, focos temporários e mobilizações editoriais do VR Abandonada.",
};

function getImpactStartDateLabel(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ImpactsPage() {
  const impacts = await getPublishedImpacts();
  const linkPairs = await Promise.all(impacts.map(async (impact) => [impact.id, await getPublishedImpactLinks(impact.id)] as const));
  const linksByImpactId = new Map(linkPairs);
  const featuredImpact =
    impacts.find((impact) => impact.featured && impact.status === "ongoing") ??
    impacts.find((impact) => impact.status === "ongoing") ??
    impacts[0] ??
    null;

  const activeImpacts = impacts.filter((impact) => impact.status === "ongoing");
  const monitoringImpacts = impacts.filter((impact) => impact.status === "observed" || impact.status === "partial");
  const closedImpacts = impacts.filter((impact) => impact.status === "consolidated" || impact.status === "disputed");
  const archivedImpacts = impacts.filter((impact) => impact.status === "archived");
  const spotlightLinks = featuredImpact ? linksByImpactId.get(featuredImpact.id) ?? [] : [];
  const spotlightLead = spotlightLinks[0] ?? null;

  return (
    <Container className="intro-grid impacts-page">
      <section className="hero hero--split impacts-hero">
        <div className="hero__copy">
          <p className="eyebrow">impacto</p>
          <h1 className="hero__title">Focos públicos do momento.</h1>
          <p className="hero__lead">
            Chamados temporários condensam investigação, participação, método e apoio quando o projeto precisa puxar um tema com mais força.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">urgência editorial</span>
            <span className="home-hero__signal">mobilização responsável</span>
            <span className="home-hero__signal">foco temporário</span>
          </div>
          <div className="hero__actions">
            <Link href="/participe" className="button-secondary">
              Ver como participar
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ler método
            </Link>
          </div>
        </div>

        {featuredImpact ? (
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
            linkCount={spotlightLinks.length}
            latestLink={spotlightLead}
          />
        ) : (
          <article className="support-box home-callout home-callout--accent">
            <p className="eyebrow">sem foco ativo</p>
            <h2>Os impactos entram quando o projeto precisa condensar atenção pública.</h2>
            <p>O sistema está pronto para destacar investigações, chamadas e focos temporários conforme a necessidade editorial.</p>
            <Link href="/participe" className="button">
              Ver participação
            </Link>
          </article>
        )}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que são</p>
            <h2>Os impactos reúnem o que está sendo puxado agora.</h2>
          </div>
          <p className="section__lead">
            O foco temporário não substitui dossiê, eixo ou pauta. Ele os condensa quando há um gesto público a fazer, uma reunião de materiais ou uma frente que pede retorno coletivo.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>{activeImpacts.length}</h3>
            <p>Impactos em andamento pedindo atenção agora.</p>
          </article>
          <article className="card">
            <h3>{monitoringImpacts.length}</h3>
            <p>Impactos observados ou em parcial consolidação.</p>
          </article>
          <article className="card">
            <h3>{closedImpacts.length + archivedImpacts.length}</h3>
            <p>Impactos consolidados, disputados ou em arquivo.</p>
          </article>
          <article className="card">
            <h3>{impacts.length}</h3>
            <p>Total de focos temporários cadastrados.</p>
          </article>
        </div>
      </section>

      {featuredImpact ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">impacto em destaque</p>
              <h2>{featuredImpact.title}</h2>
            </div>
            <p className="section__lead">
              {featuredImpact.lead_question || featuredImpact.excerpt || featuredImpact.description || "Foco público do momento."}
            </p>
          </div>

          <div className="grid-2">
            <ImpactCard impact={featuredImpact} href={`/impacto/${featuredImpact.slug}`} itemCount={spotlightLinks.length} />
            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa agora</p>
              <h3>O chamado público organiza leitura e ação sem virar marketing.</h3>
              <p>
                O impacto reúne o que está em jogo e oferece caminhos responsáveis para participação, envio, método e apoio.
              </p>
              <div className="stack-actions">
                <Link href={`/impacto/${featuredImpact.slug}`} className="button">
                  Abrir impacto
                </Link>
                <Link href="/envie" className="button-secondary">
                  Enviar material
                </Link>
              </div>
              <p className="meta-row">
                <span>{getImpactStatusLabel(featuredImpact.status)}</span>
                <span>{getImpactTypeLabel(featuredImpact.impact_type)}</span>
                {featuredImpact.date_label ? <span>{featuredImpact.date_label}</span> : null}
                {featuredImpact.happened_at ? <span>{getImpactStartDateLabel(featuredImpact.happened_at)}</span> : null}
                {featuredImpact.territory_label ? <span>{featuredImpact.territory_label}</span> : null}
              </p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">ativas</p>
            <h2>Chamados que pedem continuidade.</h2>
          </div>
          <p className="section__lead">Os impactos em andamento condensam o que o projeto está puxando agora e funcionam como porta de entrada para a mobilização pública.</p>
        </div>

        <div className="grid-2">
          {activeImpacts.length ? activeImpacts.map((impact) => (
            <ImpactCard key={impact.id} impact={impact} href={`/impacto/${impact.slug}`} itemCount={linksByImpactId.get(impact.id)?.length ?? 0} compact />
          )) : (
            <div className="support-box">
              <h3>Sem impacto em andamento no momento</h3>
              <p>Quando houver um foco temporário em curso, ele entra aqui com destaque editorial.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">monitoramento</p>
            <h2>O que ainda está sendo acompanhado.</h2>
          </div>
          <p className="section__lead">Impactos observados ou parciais pedem observação pública sem prometer fechamento rápido.</p>
        </div>

        <div className="grid-2">
          {monitoringImpacts.length ? monitoringImpacts.map((impact) => (
            <ImpactCard key={impact.id} impact={impact} href={`/impacto/${impact.slug}`} itemCount={linksByImpactId.get(impact.id)?.length ?? 0} compact />
          )) : (
            <div className="support-box">
              <h3>Sem impacto em observação</h3>
              <p>Quando a frente estiver em observação, ela aparece aqui com o mesmo cuidado visual.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">arquivo</p>
            <h2>Chamados encerrados ou guardados como referência.</h2>
          </div>
          <p className="section__lead">Mesmo quando um foco termina, ele segue útil como referência de percurso, memória e método.</p>
        </div>

        <div className="grid-2">
          {[...closedImpacts, ...archivedImpacts].length ? (
            [...closedImpacts, ...archivedImpacts].map((impact) => (
              <ImpactCard key={impact.id} impact={impact} href={`/impacto/${impact.slug}`} itemCount={linksByImpactId.get(impact.id)?.length ?? 0} compact />
            ))
          ) : (
            <div className="support-box">
              <h3>Sem impacto no arquivo</h3>
              <p>Quando um foco se encerra, ele pode seguir visível como memória editorial do projeto.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhar e participar</p>
            <h2>O impacto conecta consequência pública a gesto concreto.</h2>
          </div>
          <p className="section__lead">Se você quer continuar, use o caminho certo: ler método, enviar material, acompanhar o radar ou apoiar a continuidade.</p>
        </div>

        <div className="stack-actions">
          <Link href="/participe" className="button-secondary">
            Ver participação
          </Link>
          <Link href="/envie" className="button-secondary">
            Abrir envio
          </Link>
          <Link href="/metodo" className="button-secondary">
            Ler o método
          </Link>
          <Link href="/agora" className="button-secondary">
            Ver o radar
          </Link>
        </div>
      </section>
    </Container>
  );
}









