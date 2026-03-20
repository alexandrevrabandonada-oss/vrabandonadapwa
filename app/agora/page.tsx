import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { EditorialCover } from "@/components/editorial-cover";
import { RadarItemCard } from "@/components/radar-item-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getRadarPageData } from "@/lib/radar/queries";
import { getRadarSectionIntro, getRadarSectionLabel } from "@/lib/radar/navigation";
import type { RadarItem } from "@/lib/radar/types";

export const metadata: Metadata = {
  title: "Agora",
  description: "Pulso editorial vivo do VR Abandonada.",
  openGraph: {
    title: "Agora | VR Abandonada",
    description: "Pulso editorial vivo do VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agora | VR Abandonada",
    description: "Pulso editorial vivo do VR Abandonada.",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function AgoraPage() {
  const radar = await getRadarPageData();
  const homeSignals = Array.from(
    new Map(
      [radar.spotlight, radar.sections.what_changed[0], radar.sections.impact[0], radar.sections.in_course[0], radar.sections.hot_fronts[0], radar.sections.archive_present[0], radar.sections.calls[0]]
        .filter((item): item is RadarItem => Boolean(item))
        .map((item) => [item.href, item] as const),
    ).values(),
  ).slice(0, 3);
  const spotlight = radar.spotlight;

  return (
    <Container className="intro-grid radar-page">
      <section className="hero hero--split radar-hero">
        <div className="hero__copy">
          <p className="eyebrow">radar vivo</p>
          <h1 className="hero__title">Agora no VR Abandonada.</h1>
          <p className="hero__lead">
            O pulso editorial mostra o que mudou, o que está em curso e o que pede retorno responsável. Sem feed solto. Sem ruído. Só o que importa agora.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">última atualização</span>
            <span className="home-hero__signal">casos em andamento</span>
            <span className="home-hero__signal">retorno recorrente</span>
          </div>
          <div className="hero__actions">
            <Link href="#mudou" className="button">
              Ver o que mudou
            </Link>
            <Link href="/dossies" className="button-secondary">
              Abrir dossiês
            </Link>
          </div>
        </div>

        <EditorialCover
          title={spotlight?.title || "Radar vivo"}
          primaryTag={spotlight ? getRadarSectionLabel(spotlight.section) : "pulso editorial"}
          seriesTitle={spotlight?.primaryLabel || "VR Abandonada"}
          coverImageUrl={spotlight?.coverImageUrl || "/editorial/covers/arquivo-inicial.svg"}
          coverVariant={spotlight?.coverVariant || "night"}
        />
      </section>

      <section className="section radar-summary-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">salão de situação editorial</p>
            <h2>Uma visão rápida do que está quente agora.</h2>
          </div>
          <p className="section__lead">
            O radar reúne atualização recente, investigação em curso, frentes temáticas, memória e acervo. Ele existe para fazer o retorno ao site valer a pena.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>{radar.counts.updates} mudanças</h3>
            <p>Atualizações e pautas recentes que pedem leitura imediata.</p>
          </article>
          <article className="card">
            <h3>{radar.counts.impact} efeitos</h3>
            <p>Consequências públicas observadas ou em consolidação.</p>
          </article>
          <article className="card">
            <h3>{radar.counts.dossiers} casos</h3>
            <p>Dossiês em acompanhamento público.</p>
          </article>
          <article className="card">
            <h3>{radar.counts.hubs} frentes</h3>
            <p>Eixos temáticos com movimentação recente.</p>
          </article>
        </div>
      </section>

      <section className="section radar-section" id="mudou">
        <div className="grid-2">
          <div>
            <p className="eyebrow">{getRadarSectionLabel("what_changed")}</p>
            <h2>{getRadarSectionIntro("what_changed")}</h2>
          </div>
          <p className="section__lead">Atualizações de dossiê e pautas recentes entram primeiro aqui para mostrar o que mexeu no projeto desde a última visita.</p>
        </div>

        <div className="grid-2">
          {radar.sections.what_changed.map((item) => (
            <RadarItemCard key={item.id} item={item} compact />
          ))}
        </div>
      </section>

      <section className="section radar-section" id="impacto">
        <div className="grid-2">
          <div>
            <p className="eyebrow">{getRadarSectionLabel("impact")}</p>
            <h2>{getRadarSectionIntro("impact")}</h2>
          </div>
          <p className="section__lead">Consequências já observadas, parcialidades e efeitos em consolidação ajudam a entender que investigação não termina no texto publicado.</p>
        </div>

        <div className="grid-2">
          {radar.sections.impact.map((item) => (
            <RadarItemCard key={item.id} item={item} compact />
          ))}
        </div>
      </section>

      {radar.sections.calls.length ? (
        <section className="section radar-call-section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">{getRadarSectionLabel("calls")}</p>
              <h2>Chamadas públicas que pedem retorno responsável.</h2>
            </div>
            <p className="section__lead">Quando o projeto convoca, é para relato, documento, pista ou checagem que ajude a avançar o caso.</p>
          </div>

          <div className="grid-2">
            {radar.sections.calls.slice(0, 2).map((item) => (
              <RadarItemCard key={item.id} item={item} />
            ))}
            <article className="support-box radar-side-box">
              <p className="eyebrow">envie agora</p>
              <h3>Tem documento, relato ou pista sobre este caso?</h3>
              <p>
                O canal de envio recebe material com cuidado editorial. Se houver risco, descreva o nível de sensibilidade logo no início.
              </p>
              <div className="stack-actions">
                <Link href="/envie" className="button">
                  Abrir canal de envio
                </Link>
                <Link href="/apoie" className="button-secondary">
                  Apoiar a continuidade
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="section radar-section" id="curso">
        <div className="grid-2">
          <div>
            <p className="eyebrow">{getRadarSectionLabel("in_course")}</p>
            <h2>{getRadarSectionIntro("in_course")}</h2>
          </div>
          <p className="section__lead">Casos em andamento com a última movimentação visível, para o leitor entender o estado narrativo sem cronologia bruta.</p>
        </div>

        <div className="grid-2">
          {radar.sections.in_course.map((item) => (
            <RadarItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="section radar-section" id="frentes">
        <div className="grid-2">
          <div>
            <p className="eyebrow">{getRadarSectionLabel("hot_fronts")}</p>
            <h2>{getRadarSectionIntro("hot_fronts")}</h2>
          </div>
          <p className="section__lead">Eixos temáticos com movimento recente atravessando pauta, memória, acervo e dossiê.</p>
        </div>

        <div className="grid-2">
          {radar.sections.hot_fronts.map((item) => (
            <RadarItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="section radar-section" id="arquivo">
        <div className="grid-2">
          <div>
            <p className="eyebrow">{getRadarSectionLabel("archive_present")}</p>
            <h2>{getRadarSectionIntro("archive_present")}</h2>
          </div>
          <p className="section__lead">Memória e acervo entram quando ajudam a ler o presente. O radar não isola documento do caso: ele conecta os dois.</p>
        </div>

        <div className="grid-2">
          {radar.sections.archive_present.map((item) => (
            <RadarItemCard key={item.id} item={item} compact />
          ))}
        </div>
      </section>

      <section className="section radar-follow-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">acompanhe</p>
            <h2>Um retorno ao site precisa contar o que mudou e para onde ir depois.</h2>
          </div>
          <p className="section__lead">
            O radar funciona como superfície de retorno da PWA e como trilha para quem quer seguir a investigação sem perder o fio.
          </p>
        </div>

        <div className="grid-3">
          {homeSignals.map((item) => (
            <RadarItemCard key={item.id} item={item} compact />
          ))}
        </div>
        <div className="stack-actions">
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
          <Link href="/eixos" className="button-secondary">
            Entrar nos eixos
          </Link>
          <Link href="/memoria" className="button-secondary">
            Abrir memória
          </Link>
        </div>
      </section>
    </Container>
  );
}





