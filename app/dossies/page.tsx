import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import type { InvestigationDossier } from "@/lib/dossiers/types";

export const metadata: Metadata = {
  title: "Investigações e dossiês",
  description: "Acompanhe dossiês documentados do VR Abandonada: informações, fontes, atualizações e memória de Volta Redonda.",
  alternates: { canonical: "/dossies" },
  openGraph: {
    type: "website",
    url: "/dossies",
    title: "Investigações | VR Abandonada",
    description: "O acompanhamento documental das investigações de interesse público em Volta Redonda.",
  },
};

const statusGroups = [
  { key: "in_progress", label: "Em andamento" },
  { key: "monitoring", label: "Em acompanhamento" },
  { key: "concluded", label: "Concluídas" },
  { key: "archived", label: "Arquivo" },
] as const;

function groupDossiers(dossiers: InvestigationDossier[]) {
  return statusGroups
    .map((status) => ({
      ...status,
      items: dossiers.filter((dossier) => dossier.status === status.key),
    }))
    .filter((group) => group.items.length > 0);
}

export default async function DossiersPage() {
  const dossiers = await getPublishedDossiers();
  const updates = await getPublishedDossierUpdatesByDossierIds(dossiers.map((dossier) => dossier.id));
  const groups = groupDossiers(dossiers);

  return (
    <Container className="vr3-dossiers">
      <header className="vr3-dossiers__header">
        <p className="vr2-eyebrow">JORNALISMO INVESTIGATIVO · VOLTA REDONDA</p>
        <h1>Investigações</h1>
        <p>Casos acompanhados com documentos, contexto e atualizações. Cada dossiê tem endereço permanente para você voltar ao assunto.</p>
        <nav aria-label="Caminhos da cobertura" className="vr3-agora__quick-links">
          <Link href="/materias">Matérias ↗</Link>
          <Link href="/buscar">Pesquisar temas ↗</Link>
          <Link href="/metodo">Como apuramos ↗</Link>
        </nav>
      </header>

      {groups.length ? (
        <div className="vr3-dossiers__groups">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`vr3-dossiers-${group.key}`} className="vr3-dossiers__section">
              <div className="vr3-dossiers__section-head">
                <h2 id={`vr3-dossiers-${group.key}`}>{group.label}</h2>
                <span>{group.items.length} {group.items.length === 1 ? "dossiê" : "dossiês"}</span>
              </div>
              <div className="vr3-dossiers__list">
                {group.items.map((dossier) => {
                  const update = updates.get(dossier.id)?.[0] ?? null;
                  return (
                    <article key={dossier.id} className="vr3-dossiers__item">
                      <div className="vr2-meta">
                        <span>{getDossierStatusLabel(dossier.status)}</span>
                        {dossier.territory_label ? <span>{dossier.territory_label}</span> : null}
                        {dossier.period_label ? <span>{dossier.period_label}</span> : null}
                      </div>
                      <h3><Link href={`/dossies/${dossier.slug}`}>{dossier.title}</Link></h3>
                      {dossier.lead_question ? <p className="vr3-dossiers__question">{dossier.lead_question}</p> : null}
                      {dossier.excerpt || dossier.description ? <p>{dossier.excerpt || dossier.description}</p> : null}
                      {update ? <p className="vr3-dossiers__update"><strong>Última atualização:</strong> {update.title}</p> : null}
                      <Link href={`/dossies/${dossier.slug}`} className="vr2-readmore">Abrir dossiê ↗</Link>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="vr3-dossiers__empty" aria-labelledby="vr3-dossiers-empty-title">
          <span className="vr2-eyebrow">DOSSIÊS EM PREPARAÇÃO</span>
          <h2 id="vr3-dossiers-empty-title">A investigação continua. O arquivo público está sendo organizado.</h2>
          <p>O portal só apresenta dossiês após revisão e publicação editorial. Você pode acompanhar nossas postagens já divulgadas no Instagram e pesquisar os temas que estamos cobrindo.</p>
          <div className="vr3-agora__quick-links">
            <a href="https://www.instagram.com/vr_abandonada/" target="_blank" rel="noopener noreferrer">Acompanhar Instagram ↗</a>
            <Link href="/buscar">Pesquisar assuntos ↗</Link>
          </div>
        </section>
      )}

      <aside className="vr3-dossiers__tail">
        <p><strong>Um caso não termina na primeira denúncia.</strong> Acompanhamos documentos, respostas públicas, correções e desdobramentos.</p>
        <Link href="/metodo">Conheça nossos critérios ↗</Link>
      </aside>
    </Container>
  );
}
