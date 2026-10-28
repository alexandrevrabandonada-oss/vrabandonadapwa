import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { AgentEditorialComposer } from "@/components/agent-editorial-composer";
import { getMaterias } from "@/lib/materias";
import { getInstagramPosts } from "@/lib/instagram/posts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import "./agente.css";

export const metadata: Metadata = {
  title: "Agente Editorial | Área interna",
  description: "Operação editorial, comandos do agente e acompanhamento da publicação.",
  robots: { index: false, follow: false },
};

export default async function AgentEditorialPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/interno/entrar");

  const published = await getMaterias();
  const importedPosts = getInstagramPosts();

  return (
    <Container className="agent-hub">
      <header className="agent-hub__intro">
        <span className="eyebrow">Operação editorial · ChatGPT + GitHub + Vercel</span>
        <h1>Agente de publicação</h1>
        <p>Você define a pauta. O agente pesquisa, prepara, revisa com você e entrega a matéria no site. Não precisamos conectar o Instagram para publicar.</p>
      </header>

      <div className="agent-hub__metrics" aria-label="Indicadores do acervo público">
        <article><strong>{published.length}</strong><span>Matérias aprovadas no site</span></article>
        <article><strong>{importedPosts.length}</strong><span>Posts importados do Instagram</span></article>
        <article><strong>4</strong><span>Etapas do fluxo editorial</span></article>
      </div>

      <nav aria-label="Acessos operacionais" className="agent-hub__links">
        <Link href="/interno/capturar">Capturar material ↗</Link>
        <Link href="/interno/editorial">Fila editorial ↗</Link>
        <Link href="/interno/dossies">Dossiês internos ↗</Link>
        <Link href="/materias">Matérias públicas ↗</Link>
      </nav>

      <AgentEditorialComposer />

      <section className="agent-hub__flow" aria-labelledby="agent-flow-title">
        <div className="agent-hub__flow-heading">
          <span className="eyebrow">Operação assistida</span>
          <h2 id="agent-flow-title">Da conversa ao site</h2>
        </div>
        <ol>
          <li><b>Apuração</b><span>Organizar fontes, hipóteses, respostas e pendências.</span></li>
          <li><b>Texto</b><span>Produzir a matéria e conferir atribuições, títulos, datas e links.</span></li>
          <li><b>Aprovação</b><span>Você aprova a versão exata antes da publicação. Materiais sensíveis permanecem internos.</span></li>
          <li><b>Distribuição</b><span>O agente prepara PR, verifica CI/preview e acompanha o deploy. A página entra no sitemap e no RSS; indexação do Google exige acompanhamento separado.</span></li>
        </ol>
      </section>

      <section className="agent-hub__footer">
        <div>
          <span className="eyebrow">Sem chaves da Meta</span>
          <h2>O Instagram continua sendo o megafone. O site é o nosso arquivo.</h2>
          <p>Links e legendas publicados podem ser usados como material de partida. Nenhuma sincronização da Meta é necessária para as novas matérias criadas por aqui.</p>
        </div>
        <a href="https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/pulls" target="_blank" rel="noopener noreferrer">Acompanhar revisões no GitHub ↗</a>
      </section>
    </Container>
  );
}
