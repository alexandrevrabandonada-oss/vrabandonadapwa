import Link from "next/link";

import { materiaKindLabel, publishedDate, type Materia } from "@/lib/materias";

type Props = {
  article: Materia;
  contextLabel?: string;
  headingLevel?: 3 | 4;
  showMainPlaces?: boolean;
  actionLabel?: string;
};

/**
 * Uma reportagem, um permalink, múltiplos contextos de leitura.
 * Bairros apenas citados são rotulados pelo chamador, nunca tratados como
 * acontecimentos de causalidade compartilhada.
 */
export function EditorialStoryCard({
  article,
  contextLabel,
  headingLevel = 3,
  showMainPlaces = false,
  actionLabel = "Ler reportagem",
}: Props) {
  const href = "/materias/" + article.slug;
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const hasExternalSources = article.sources.some((source) => /^https?:\/\//i.test(source.url));
  const mainPlaces = showMainPlaces
    ? article.territories?.filter((place) => place.role === "main") ?? []
    : [];

  return (
    <article className="vr-index__item vr7-editorial-card" data-reading-block>
      <div className="vr-index__meta vr7-editorial-card__meta">
        <span>{contextLabel ? contextLabel + " · " : ""}{materiaKindLabel(article)} · {article.section}</span>
        <time dateTime={article.publishedAt}>{publishedDate(article.publishedAt)}</time>
      </div>
      <Heading className="vr7-editorial-card__title" data-reading-title>
        <Link href={href}>{article.title}</Link>
      </Heading>
      <p data-reading-summary>{article.summary}</p>
      <div className="vr-index__foot vr7-editorial-card__actions">
        <Link href={href}>{actionLabel} ↗</Link>
        {hasExternalSources ? <Link href={"/acervo#fontes-" + article.slug}>Conferir fontes ↗</Link> : null}
        {mainPlaces.map((place) => (
          <Link key={place.slug} href={"/territorios/" + place.slug}>{place.label} ↗</Link>
        ))}
      </div>
    </article>
  );
}
