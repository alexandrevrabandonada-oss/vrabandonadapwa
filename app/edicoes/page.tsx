import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import type { EditorialEditionType } from "@/lib/editions/types";
import { EditionCard } from "@/components/edition-card";
import { EditionPrimaryPiece } from "@/components/edition-primary-piece";
import { EditorialCover } from "@/components/editorial-cover";
import { getPublishedEditorialEditionLinks, getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getEditionStatusLabel, getEditionStatusTone, getEditionTypeLabel } from "@/lib/editions/navigation";
import { getEditionsOpenGraphImagePath } from "@/lib/editions/share";

export const metadata: Metadata = {
  title: "Edições",
  description: "Sínteses editoriais recorrentes do VR Abandonada: o caderno curto do momento, dos temas e dos arquivos vivos.",
  openGraph: {
    title: "Edições | VR Abandonada",
    description: "Sínteses editoriais recorrentes do VR Abandonada: o caderno curto do momento, dos temas e dos arquivos vivos.",
    type: "website",
    images: [getEditionsOpenGraphImagePath()],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edições | VR Abandonada",
    description: "Sínteses editoriais recorrentes do VR Abandonada: o caderno curto do momento, dos temas e dos arquivos vivos.",
    images: [getEditionsOpenGraphImagePath()],
  },
};

export default async function EditionsPage() {
  const editions = await getPublishedEditorialEditions();
  const linkPairs = await Promise.all(editions.map(async (edition) => [edition.id, await getPublishedEditorialEditionLinks(edition.id)] as const));
  const linksByEditionId = new Map(linkPairs);
  const featuredEdition = editions.find((edition) => edition.featured && edition.status === "published") ?? editions.find((edition) => edition.status === "published") ?? editions[0] ?? null;
  const featuredLinks = featuredEdition ? linksByEditionId.get(featuredEdition.id) ?? [] : [];
  const featuredLeadLink = featuredLinks[0] ?? null;

  const editionSections: Array<{ title: string; types: EditorialEditionType[] }> = [
    { title: "Pulso do momento", types: ["city_pulse", "weekly"] },
    { title: "Temáticas", types: ["thematic"] },
    { title: "Campanhas e casos", types: ["campaign", "dossier"] },
    { title: "Especiais e arquivo", types: ["special", "archive"] },
  ];


  return (
    <Container className="intro-grid editions-page">
      <section className="hero hero--split editions-hero">
        <div className="hero__copy">
          <p className="eyebrow">edições</p>
          <h1 className="hero__title">Cadernos públicos para circular a leitura do momento.</h1>
          <p className="hero__lead">
            As edições condensam o radar, as campanhas, o impacto e as leituras estruturais em um formato curto, compartilhável e recorrente.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">síntese pública</span>
            <span className="home-hero__signal">circulação externa</span>
            <span className="home-hero__signal">caderno vivo</span>
          </div>
          <div className="hero__actions">
            <Link href="/agora" className="button-secondary">
              Ver radar
            </Link>
            <Link href="/campanhas" className="button-secondary">
              Ver campanhas
            </Link>
          </div>
        </div>

        {featuredEdition ? (
          <EditionPrimaryPiece
            title={featuredEdition.title}
            excerpt={featuredEdition.excerpt}
            description={featuredEdition.description}
            status={featuredEdition.status}
            editionType={featuredEdition.edition_type}
            periodLabel={featuredEdition.period_label}
            publishedAt={featuredEdition.published_at}
            href={`/edicoes/${featuredEdition.slug}`}
            linkCount={featuredLinks.length}
            latestLink={featuredLeadLink}
          />
        ) : (
          <article className="support-box home-callout home-callout--accent">
            <p className="eyebrow">sem edição ativa</p>
            <h2>As edições entram quando o projeto precisa condensar o que importa.</h2>
            <p>O sistema está pronto para destacar o estado do momento, um tema ou um arquivo especial com força editorial.</p>
            <Link href="/agora" className="button">
              Ver o radar
            </Link>
          </article>
        )}
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que são</p>
            <h2>Edição não é newsletter. É recorte curado do que precisa circular.</h2>
          </div>
          <p className="section__lead">
            Cada edição junta tese, peças principais e caminhos de leitura para transformar profundidade em circulação pública sem virar feed genérico.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>{editions.filter((edition) => edition.status === "published").length}</h3>
            <p>Edições públicas prontas para circulação.</p>
          </article>
          <article className="card">
            <h3>{editions.filter((edition) => edition.edition_type === "city_pulse").length}</h3>
            <p>Recortes de pulso do momento.</p>
          </article>
          <article className="card">
            <h3>{editions.filter((edition) => edition.edition_type === "thematic").length}</h3>
            <p>Recortes temáticos de leitura mais longa.</p>
          </article>
          <article className="card">
            <h3>{editions.filter((edition) => edition.status === "archived").length}</h3>
            <p>Edições arquivadas como referência.</p>
          </article>
        </div>
      </section>

      {featuredEdition ? (
        <section className="section">
          <div className="grid-2">
            <div>
              <p className="eyebrow">edição em destaque</p>
              <h2>{featuredEdition.title}</h2>
            </div>
            <p className="section__lead">{featuredEdition.excerpt || featuredEdition.description || "Edição pública do momento."}</p>
          </div>

          <div className="grid-2">
            <article className="card">
              <EditorialCover
                title={featuredEdition.title}
                primaryTag={getEditionStatusLabel(featuredEdition.status)}
                seriesTitle={featuredEdition.period_label || getEditionTypeLabel(featuredEdition.edition_type)}
                coverImageUrl={featuredEdition.cover_image_url}
                coverVariant={featuredEdition.edition_type === "city_pulse" ? "ember" : "steel"}
              />
              <div className="meta-row">
                <span className={getEditionStatusTone(featuredEdition.status)}>{getEditionStatusLabel(featuredEdition.status)}</span>
                <span>{getEditionTypeLabel(featuredEdition.edition_type)}</span>
                {featuredEdition.period_label ? <span>{featuredEdition.period_label}</span> : null}
              </div>
              <p>{featuredEdition.description}</p>
              <div className="stack-actions">
                <Link href={`/edicoes/${featuredEdition.slug}`} className="button-secondary">
                  Abrir edição
                </Link>
              </div>
            </article>

            <article className="support-box home-callout home-callout--accent">
              <p className="eyebrow">por que importa agora</p>
              <h3>A síntese dá forma ao que o radar aponta.</h3>
              <p>
                As edições condensam o momento, apontam o que mudou e deixam o arquivo mais fácil de compartilhar fora do site.
              </p>
              <div className="stack-actions">
                <Link href="/agora" className="button">
                  Abrir radar
                </Link>
                <Link href="/participe" className="button-secondary">
                  Participar
                </Link>
                <Link href="/metodo" className="button-secondary">
                  Ler método
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {editionSections.map((section) => {
        const items = editions.filter((edition) => {
          const editionType = edition.edition_type as EditorialEditionType;
          return section.types.includes(editionType) && edition.status !== "draft";
        });

        if (!items.length) {
          return null;
        }

        return (
          <section className="section" key={section.title}>
            <div className="grid-2">
              <div>
                <p className="eyebrow">{section.title}</p>
                <h2>Leituras para entrar por foco editorial.</h2>
              </div>
              <p className="section__lead">
                Cada bloco reúne o melhor do momento, do tema ou do arquivo para manter a circulação simples e forte.
              </p>
            </div>

            <div className="grid-3">
              {items.map((edition) => (
                <EditionCard key={edition.id} edition={edition} href={`/edicoes/${edition.slug}`} itemCount={linksByEditionId.get(edition.id)?.length ?? 0} compact />
              ))}
            </div>
          </section>
        );
      })}

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">seguir lendo</p>
            <h2>As edições apontam para o radar, os chamados e os casos.</h2>
          </div>
          <p className="section__lead">Se a edição abriu o caminho, o restante do site continua a leitura com contexto, participação e consequência.</p>
        </div>

        <div className="stack-actions">
          <Link href="/agora" className="button-secondary">
            Ver o radar
          </Link>
          <Link href="/campanhas" className="button-secondary">
            Ver campanhas
          </Link>
          <Link href="/impacto" className="button-secondary">
            Ver impacto
          </Link>
          <Link href="/padroes" className="button-secondary">
            Ver padrões
          </Link>
          <Link href="/dossies" className="button-secondary">
            Ver dossiês
          </Link>
        </div>
      </section>
    </Container>
  );
}

