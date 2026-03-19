import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { editorialStatusLabels, type EditorialStatus } from "@/lib/editorial/types";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pautas",
  description: "Agenda pública e arquivo editorial do VR Abandonada.",
};

export default async function PautasPage() {
  const items = await getPublishedEditorialItems();

  return (
    <Container className="intro-grid">
      <PageHero
        kicker="pautas"
        title="Arquivo editorial da cidade."
        lead="A pauta pública nasce da triagem interna, passa por sanitização e só aparece aqui quando está marcada como publicada."
      />

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que aparece aqui</p>
            <h2>Itens publicados, não dados brutos.</h2>
          </div>
          <p className="section__lead">
            O material exibido foi derivado da camada interna e limpo para o público.
            Se não houver publicação real, a base mostra peças editoriais iniciais do projeto.
          </p>
        </div>

        <div className="grid-3">
          {items.map((item) => (
            <article className="entry editorial-card" key={item.id}>
              <span className="entry__tag">{item.featured ? "Destaque" : item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
              <div className="meta-row">
                <span>{item.neighborhood || "Volta Redonda"}</span>
                <span>{editorialStatusLabels[item.editorial_status as EditorialStatus] ?? item.editorial_status}</span>
              </div>
              <Link href={`/pautas/${item.slug}`} className="button-secondary">
                Ler pauta
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">eixos</p>
            <h2>Linhas editoriais do arquivo.</h2>
          </div>
          <p className="section__lead">
            Os eixos seguem como organização estrutural do site, sem virar feed aleatório.
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
    </Container>
  );
}
