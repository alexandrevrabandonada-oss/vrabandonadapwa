import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { IntakeForm } from "@/components/intake-form";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Envie",
  description: "Canal inicial para denúncia e envio de material.",
};

export default function EnviePage() {
  return (
    <Container className="intro-grid">
      <PageHero
        kicker="envie"
        title="Denúncia sem excesso, com contexto e precisão."
        lead="A base já deixa claro que o canal precisa ser simples, seguro e orientado. O fluxo real agora está ligado ao Supabase."
      />

      <section className="section">
        <div className="grid-2">
          <article className="support-box">
            <h2>Orientações iniciais</h2>
            <ul>
              {site.intakeNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="support-box">
            <h2>O que enviar</h2>
            <ul>
              <li>Relato objetivo do fato</li>
              <li>Local, data e contexto</li>
              <li>Fotos, documentos ou links</li>
              <li>Indicação de risco ou urgência</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">formulário</p>
            <h2>Canal inicial de entrada</h2>
          </div>
          <p className="section__lead">
            O envio vai para a tabela `intake_submissions`, preparada para fila editorial, moderação e cruzamento com futuras ferramentas internas.
          </p>
        </div>

        <IntakeForm />
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">regras do envio</p>
            <h2>Disciplina editorial antes da publicação.</h2>
          </div>
          <p className="section__lead">
            Relatos sensíveis recebem cuidado extra. Envio não significa publicação automática.
          </p>
        </div>

        <div className="grid-2">
          <article className="support-box">
            <h3>Pode enviar</h3>
            <ul>
              <li>Fatos observados diretamente</li>
              <li>Documentos, imagens e links úteis</li>
              <li>Contexto territorial, data e impacto</li>
              <li>Pedido explícito de anonimato, se necessário</li>
            </ul>
          </article>
          <article className="support-box">
            <h3>Evite enviar</h3>
            <ul>
              <li>Boatos sem contexto verificável</li>
              <li>Dados de terceiros sem necessidade</li>
              <li>Material que coloque fontes em risco sem aviso</li>
              <li>Conteúdo que dependa de publicação imediata</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como tratamos relatos</p>
            <h2>Método, cuidado e limites em linguagem pública.</h2>
          </div>
          <p className="section__lead">
            Se quiser entender o que acontece depois do envio e como o projeto trata anonimato, correção e checagem, leia a página de método antes ou depois de participar.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/metodo" className="button">
            Ler como trabalhamos
          </Link>
          <Link href="/participe" className="button-secondary">
            Ver caminhos de participação
          </Link>
          <Link href="/comecar" className="button-secondary">
            Entender o projeto
          </Link>
        </div>
      </section>
    </Container>
  );
}
