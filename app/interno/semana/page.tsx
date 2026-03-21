import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { WeeklyBoardShell } from "@/components/weekly-board-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWeeklyBoardItems, getWeeklyFocusDict } from "@/lib/semana/queries";

export const metadata: Metadata = {
  title: "Quadro da Semana",
  description: "Visão editorial-operacional e cadência semanal do VR Abandonada.",
};

export default async function SemanaPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/interno/entrar");
  }

  const [focusDict, boardItems] = await Promise.all([
    getWeeklyFocusDict(),
    getWeeklyBoardItems(),
  ]);

  return (
    <Container className="internal-page internal-page--operator">
      <section className="hero internal-hero internal-hero--operator">
        <p className="eyebrow">Quadro de Guerra</p>
        <h1 className="hero__title">A Semana.</h1>
        <p className="hero__lead">O que é prioridade agora, o que sobe hoje e o que fica em observação.</p>
      </section>

      <section className="section internal-panel" style={{ marginTop: "1rem" }}>
        <p className="eyebrow">Decisões Rápidas</p>
        <div className="grid-3">
          <article className="card internal-operator-metric internal-operator-metric--hot">
            <p className="eyebrow">Frente Principal</p>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
              {focusDict["main_front"]?.custom_text || "Nenhuma frente prioritária"}
            </h3>
          </article>
          <article className="card internal-operator-metric internal-operator-metric--watch">
            <p className="eyebrow">Edição do Momento</p>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
              {focusDict["current_edition"]?.custom_text || "Nenhuma edição rodando"}
            </h3>
          </article>
          <article className="card internal-operator-metric internal-operator-metric--calm">
            <p className="eyebrow">Campanha em Foco</p>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
              {focusDict["campaign_focus"]?.custom_text || "Nenhuma campanha ativa"}
            </h3>
          </article>
        </div>
        <div className="grid-2" style={{ marginTop: "1rem" }}>
           <article className="card internal-operator-metric internal-operator-metric--muted">
            <p className="eyebrow">Hoje: Peça que Sobe</p>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
              {focusDict["publish_today"]?.custom_text || "Nenhuma peça hoje"}
            </h3>
          </article>
          <article className="card internal-operator-metric internal-operator-metric--muted">
            <p className="eyebrow">Share Pack</p>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
             {focusDict["share_pack"]?.custom_text || "Nenhum share pack prioritário"}
            </h3>
          </article>
        </div>
      </section>

      <WeeklyBoardShell boardItems={boardItems} />
    </Container>
  );
}
