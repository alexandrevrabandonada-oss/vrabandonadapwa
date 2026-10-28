import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getRadarPageData } from "@/lib/radar/queries";
import { getMaterias } from "@/lib/materias";
import { getInstagramPosts, summaryFor, titleFor } from "@/lib/instagram/posts";

export const metadata: Metadata = {
  title: "Últimas notícias e atualizações",
  description: "Acompanhe matérias, atualizações documentadas e publicações do VR Abandonada sobre Volta Redonda.",
  alternates: { canonical: "/agora" },
  openGraph: {
    type: "website",
    url: "/agora",
    title: "Últimas notícias | VR Abandonada",
    description: "Atualizações, investigações e notícias documentadas de Volta Redonda.",
  },
};

type LatestEntry = {
  id: string;
  title: string;
  summary: string;
  href: string;
  category: string;
  date: string;
};

function showDate(value: string) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(time));
}

export default async function AgoraPage() {
  const [radar, materias] = await Promise.all([getRadarPageData(), getMaterias()]);
  const socialPosts = getInstagramPosts();
  const observedHrefs = new Set<string>();

  const candidates: LatestEntry[] = [
    ...materias.map((m) => ({
      id: "materia-" + m.slug,
      title: m.title,
      summary: m.summary,
      href: "/materias/" + m.slug,
      category: m.section,
      date: m.publishedAt,
    })),
    ...socialPosts.map((p) => ({
      id: "instagram-" + p.id,
      title: titleFor(p),
      summary: summaryFor(p),
      href: "/publicacoes/" + p.id,
      category: "Publicação do Instagram",
      date: p.published_at,
    })),
    ...[
      ...radar.sections.what_changed,
      ...radar.sections.in_course,
      ...radar.sections.impact,
      ...radar.sections.hot_fronts,
      ...radar.sections.calls,
      ...radar.sections.archive_present,
    ].map((item) => ({
      id: "radar-" + item.id,
      title: item.title,
      summary: item.excerpt || "",
      href: item.href,
      category: item.primaryLabel,
      date: item.sortDate,
    })),
  ];

  const entries = candidates
    .filter((item) => {
      if (observedHrefs.has(item.href)) return false;
      observedHrefs.add(item.href);
      return true;
    })
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));

  return (
    <Container className="vr3-agora">
      <header className="vr3-agora__header">
        <p className="vr2-eyebrow">VR ABANDONADA · INFORMAÇÃO COM CONTEXTO</p>
        <h1>Últimas publicações</h1>
        <p>O que foi publicado e atualizado sobre Volta Redonda, reunido em um único lugar.</p>
        <div className="vr3-agora__quick-links">
          <Link href="/dossies">Investigações ↗</Link>
          <Link href="/publicacoes">Arquivo do Instagram ↗</Link>
          <Link href="/buscar">Buscar ↗</Link>
        </div>
      </header>

      <section id="mudou" aria-labelledby="vr3-agora-title" className="vr3-agora__news">
        <div className="vr2-section__heading">
          <div>
            <span className="vr2-eyebrow">ARQUIVO ORGANIZADO</span>
            <h2 id="vr3-agora-title">Atualizações</h2>
          </div>
          {entries.length > 0 ? <span className="vr3-agora__count">{entries.length} registro{entries.length === 1 ? "" : "s"}</span> : null}
        </div>

        {entries.length ? (
          <div className="vr3-agora__feed">
            {entries.slice(0, 24).map((entry) => (
              <article key={entry.id} className="vr3-agora__entry">
                <div className="vr2-meta">
                  <span>{entry.category}</span>
                  {showDate(entry.date) ? <span>{showDate(entry.date)}</span> : null}
                </div>
                <h3><Link href={entry.href}>{entry.title}</Link></h3>
                {entry.summary ? <p>{entry.summary}</p> : null}
                <Link className="vr2-readmore" href={entry.href}>Abrir publicação ↗</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="vr3-agora__empty">
            <strong>As primeiras publicações do novo arquivo estão em preparação.</strong>
            <p>Nenhuma atualização editorial foi cadastrada nesta área ainda. Nosso perfil do Instagram continua disponível enquanto a integração é concluída.</p>
            <div className="vr3-agora__quick-links">
              <a href="https://www.instagram.com/vr_abandonada/" target="_blank" rel="noopener noreferrer">Ver Instagram oficial ↗</a>
              <Link href="/buscar">Pesquisar temas ↗</Link>
            </div>
          </div>
        )}
      </section>

      <aside className="vr3-agora__footer">
        <div>
          <span className="vr2-eyebrow">CONTEÚDO PERMANENTE</span>
          <h2>O assunto não termina no feed.</h2>
          <p>Nosso objetivo é reunir cada matéria aprovada com documentos e atualizações no mesmo endereço, para que possa ser consultada depois.</p>
        </div>
        <Link href="/metodo">Conheça nosso método ↗</Link>
      </aside>
    </Container>
  );
}
