"use client";

import type { WeeklyBoardItem } from "@/lib/semana/queries";

type WeeklyBoardShellProps = {
  boardItems: WeeklyBoardItem[];
};

export function WeeklyBoardShell({ boardItems }: WeeklyBoardShellProps) {
  // Group items by column
  const groups = {
    radar: boardItems.filter((i) => i.board_column === "radar"),
    publish_fast: boardItems.filter((i) => i.board_column === "publish_fast"),
    observe: boardItems.filter((i) => i.board_column === "observe"),
    enrich: boardItems.filter((i) => i.board_column === "enrich"),
    pull_edition: boardItems.filter((i) => i.board_column === "pull_edition"),
    pull_circulation: boardItems.filter((i) => i.board_column === "pull_circulation"),
  };

  return (
    <section className="section internal-panel" style={{ marginTop: "2rem" }}>
      <div className="grid-2">
        <div>
          <p className="eyebrow">Quadro Semanal</p>
          <h2>O ritmo da operação.</h2>
        </div>
        <p className="section__lead">
          Itens puxados de Intake, Editorial, Dossiês e Campanhas com foco estrito no que acontece esta semana.
        </p>
      </div>

      <div className="grid-3" style={{ marginTop: "2rem" }}>
        {/* Radar da semana */}
        <article className="support-box">
          <p className="eyebrow">Radar</p>
          <h3>Quente esta semana</h3>
          <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groups.radar.length > 0 ? (
              groups.radar.map((i) => (
                <li key={i.id} style={{ padding: "0.5rem", background: "var(--foreground-5)", borderRadius: "4px" }}>
                  {i.notes || `Item ${i.entity_type}`}
                </li>
              ))
            ) : (
              <p style={{ color: "var(--foreground-50)", fontSize: "0.875rem" }}>Nada no radar.</p>
            )}
          </ul>
        </article>

        {/* Peças que sobem */}
        <article className="support-box">
          <p className="eyebrow">Publicar Rápido</p>
          <h3>Peças que sobem</h3>
          <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groups.publish_fast.length > 0 ? (
              groups.publish_fast.map((i) => (
                <li key={i.id} style={{ padding: "0.5rem", background: "var(--foreground-5)", borderRadius: "4px" }}>
                  {i.notes || `Item ${i.entity_type}`}
                </li>
              ))
            ) : (
              <p style={{ color: "var(--foreground-50)", fontSize: "0.875rem" }}>Nenhuma peça pra subir correndo.</p>
            )}
          </ul>
        </article>

        {/* Observação */}
        <article className="support-box">
          <p className="eyebrow">Fica pra depois</p>
          <h3>Observação</h3>
          <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groups.observe.length > 0 ? (
              groups.observe.map((i) => (
                <li key={i.id} style={{ padding: "0.5rem", background: "var(--foreground-5)", borderRadius: "4px" }}>
                  {i.notes || `Item ${i.entity_type}`}
                </li>
              ))
            ) : (
              <p style={{ color: "var(--foreground-50)", fontSize: "0.875rem" }}>Nada apenas em observação.</p>
            )}
          </ul>
        </article>
        
        {/* Pede dossiê/impacto */}
        <article className="support-box">
          <p className="eyebrow">Enriquecimento Maior</p>
          <h3>Pede Dossiê / Campanha</h3>
          <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groups.enrich.length > 0 ? (
              groups.enrich.map((i) => (
                <li key={i.id} style={{ padding: "0.5rem", background: "var(--foreground-5)", borderRadius: "4px" }}>
                  {i.notes || `Item ${i.entity_type}`}
                </li>
              ))
            ) : (
              <p style={{ color: "var(--foreground-50)", fontSize: "0.875rem" }}>Nenhuma peça para enriquecer pesado.</p>
            )}
          </ul>
        </article>

        {/* Edição */}
        <article className="support-box">
          <p className="eyebrow">Editorial</p>
          <h3>Puxar para Edição</h3>
          <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groups.pull_edition.length > 0 ? (
              groups.pull_edition.map((i) => (
                <li key={i.id} style={{ padding: "0.5rem", background: "var(--foreground-5)", borderRadius: "4px" }}>
                  {i.notes || `Item ${i.entity_type}`}
                </li>
              ))
            ) : (
              <p style={{ color: "var(--foreground-50)", fontSize: "0.875rem" }}>Nenhuma peça para plugar em edição.</p>
            )}
          </ul>
        </article>

        {/* Circulação */}
        <article className="support-box">
          <p className="eyebrow">Distribuição</p>
          <h3>Puxar para Circulação</h3>
          <ul style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {groups.pull_circulation.length > 0 ? (
              groups.pull_circulation.map((i) => (
                <li key={i.id} style={{ padding: "0.5rem", background: "var(--foreground-5)", borderRadius: "4px" }}>
                  {i.notes || `Item ${i.entity_type}`}
                </li>
              ))
            ) : (
              <p style={{ color: "var(--foreground-50)", fontSize: "0.875rem" }}>Nenhuma peça para circular nos grupos.</p>
            )}
          </ul>
        </article>
      </div>
    </section>
  );
}
