import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getMaterias, materiaKind, materiaKindLabel, publishedDate } from "@/lib/materias";

export const metadata: Metadata = {
  title: "Matérias e publicações originais",
  description: "Textos, vídeos e investigações do VR Abandonada sobre Volta Redonda, organizados em um arquivo permanente e pesquisável.",
  alternates: { canonical: "/materias" },
  openGraph: { title: "Matérias | VR Abandonada", description: "Informação que não desaparece no feed.", type: "website", url: "/materias" }
};

type Props = { searchParams: Promise<{ q?: string; tema?: string; tipo?: string }> };
export default async function MateriasPage({ searchParams }: Props) {
  const { q = "", tema = "", tipo = "" } = await searchParams;
  const articles = await getMaterias();
  const filtered = articles.filter((a) => (!q || (a.title + " " + a.summary + " " + a.section).toLocaleLowerCase("pt-BR").includes(q.slice(0, 80).toLocaleLowerCase("pt-BR")))
    && (!tema || a.section.toLocaleLowerCase("pt-BR") === tema.toLocaleLowerCase("pt-BR"))
    && (!tipo || materiaKind(a) === tipo));
  const sections = [...new Set(articles.map((a) => a.section))];
  return (
    <Container className="vr-pubs">
      <header className="vr-pubs-hero">
        <span className="vr-pubs-eyebrow">VR ABANDONADA / ARQUIVO PÚBLICO</span>
        <h1>O que acontece na cidade merece ficar registrado.</h1>
        <p>As publicações do VR Abandonada com endereço próprio, informações verificáveis, fontes e atualizações. Sem depender da vida útil de um post nas redes.</p>
      </header>
      <form className="vr-pubs-search" action="/materias">
        <label htmlFor="busca-materia">Encontre uma matéria</label>
        <div><input id="busca-materia" name="q" type="search" placeholder="Buscar CSN, obra, saúde, trabalhadores…" defaultValue={q} maxLength={80}/><button type="submit">Buscar</button></div>
      </form>
      <nav className="vr-pubs-topics" aria-label="Filtrar por formato jornalístico">
        <Link href="/materias" aria-current={!tipo ? "page" : undefined}>Todas as matérias</Link>
        <Link href="/materias?tipo=news" aria-current={tipo === "news" ? "page" : undefined}>Notícias</Link>
        <Link href="/materias?tipo=investigation" aria-current={tipo === "investigation" ? "page" : undefined}>Investigações</Link>
        <Link href="/materias?tipo=explainer" aria-current={tipo === "explainer" ? "page" : undefined}>Explicações</Link>
      </nav>
      <nav className="vr-pubs-topics" aria-label="Filtrar matérias por tema">
        <Link href="/materias" aria-current={!tema ? "page" : undefined}>Todas</Link>
        {sections.map((s) => <Link key={s} href={"/materias?tema=" + encodeURIComponent(s)} aria-current={tema === s ? "page" : undefined}>{s}</Link>)}
      </nav>
      <div className="vr-pubs-heading"><h2>Arquivo editorial</h2><span>{filtered.length} publicação{filtered.length === 1 ? "" : "ões"}</span></div>
      {filtered.length ? (
        <div className="vr-pubs-grid">
          {filtered.map((a) => <article key={a.slug} className="vr-pub-card">
            <div className="vr-pub-card__meta">{materiaKindLabel(a)} · {a.section} · {publishedDate(a.publishedAt)}</div>
            <h3><Link href={"/materias/" + a.slug}>{a.title}</Link></h3>
            <p>{a.summary}</p>
            <Link href={"/materias/" + a.slug} className="vr-pub-card__more">Ler matéria <span aria-hidden="true">↗</span></Link>
          </article>)}
        </div>
      ) : (
        <div className="vr-pubs-empty">
          <h2>{articles.length ? "Nenhum resultado para a busca." : "O acervo de matérias começa aqui."}</h2>
          <p>{articles.length ? "Experimente outras palavras ou veja todas as matérias." : "As publicações aparecerão aqui depois da aprovação editorial. Não colocamos conteúdo de demonstração como se fosse notícia."}</p>
          <Link href="/agora">Conhecer o arquivo já existente</Link>
        </div>
      )}
      <aside className="vr-pubs-comun"><strong>Participar também transforma a cidade.</strong><p>O COMUN mantém sua própria proposta e seus próprios espaços. O VR Abandonada reúne aqui seu arquivo de comunicação e publicações.</p><a href="https://comunsocial.online" target="_blank" rel="noopener noreferrer">Conhecer o COMUN ↗</a></aside>
    </Container>
  );
}
