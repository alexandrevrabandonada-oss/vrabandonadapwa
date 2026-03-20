import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Método",
  description: "Como o VR Abandonada trabalha com relatos, documentos, memória e correção pública.",
};

export default function MetodoPage() {
  return (
    <Container className="intro-grid method-page">
      <PageHero
        kicker="método"
        title="Como o VR Abandonada trabalha."
        lead="Transparência sem juridiquês: o que chega, como é cuidado, o que pode virar publicação e como a memória conversa com a investigação."
      />

      <section className="section method-intro-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que investigamos</p>
            <h2>Volta Redonda como cidade em disputa.</h2>
          </div>
          <p className="section__lead">
            O projeto olha para poluição, trabalho, acidentes, abandono, memória e documentação pública. Tudo começa com território e termina em responsabilidade editorial.
          </p>
        </div>
      </section>

      <section className="section method-grid-section">
        <div className="grid-2">
          <article className="support-box">
            <p className="eyebrow">como chegam materiais</p>
            <h3>Pista, relato, documento, foto ou memória.</h3>
            <p>
              O material pode entrar por `/envie`, por colaboração com memória e acervo, ou por caminhos guiados em `/participe` quando a pessoa ainda está entendendo por onde começar.
            </p>
          </article>
          <article className="support-box">
            <p className="eyebrow">o que ajuda de verdade</p>
            <h3>Contexto ganha de volume.</h3>
            <p>
              Data aproximada, local, referência do fato, quem viu, o que foi registrado e por que isso importa ajudam mais do que envio bruto sem amarração.
            </p>
          </article>
          <article className="support-box">
            <p className="eyebrow">cuidado e anonimato</p>
            <h3>Nem todo envio precisa de nome público.</h3>
            <p>
              O canal aceita envio anônimo quando necessário. Material sensível recebe cuidado extra e não é publicado automaticamente.
            </p>
          </article>
          <article className="support-box">
            <p className="eyebrow">checagem mínima</p>
            <h3>Não publicamos sem disciplina editorial.</h3>
            <p>
              O material passa por leitura, triagem e checagem mínima. Se faltar contexto ou se houver risco, o projeto pode segurar, revisar ou devolver como trabalho em andamento.
            </p>
          </article>
        </div>
      </section>

      <section className="section method-grid-section">
        <div className="grid-2">
          <article className="card">
            <p className="eyebrow">o que acontece depois do envio</p>
            <h3>O material entra numa fila editorial inicial.</h3>
            <p>
              A equipe lê, cruza com o que já existe, decide se cabe em pauta, memória, acervo ou dossiê e só então avança para o que pode ser publicado.
            </p>
          </article>
          <article className="card">
            <p className="eyebrow">o que não esperar</p>
            <h3>Não existe resposta individual garantida.</h3>
            <p>
              O projeto não promete acompanhamento privado em tempo real nem status individual público. O compromisso é editorial, responsável e com retorno coletivo quando houver publicação.
            </p>
          </article>
          <article className="card">
            <p className="eyebrow">correções e atualização</p>
            <h3>Investigações mudam com novos dados.</h3>
            <p>
              Quando surgem documentos, relatos ou correções, pautas, dossiês, memória e acervo podem ser revisados. O site tenta deixar isso visível em vez de fingir acabamento total.
            </p>
          </article>
          <article className="card">
            <p className="eyebrow">memória e arquivo</p>
            <h3>Arquivo vivo não é depósito.</h3>
            <p>
              Fotos antigas, jornais, recortes, documentos e lembranças entram como lastro histórico. Lacunas, datas aproximadas e autoria incerta são tratados como parte do arquivo, não como falha escondida.
            </p>
          </article>
        </div>
      </section>

      <section className="section method-grid-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como usar bem os caminhos</p>
            <h2>Escolha o gesto que combina com o que você tem em mãos.</h2>
          </div>
          <p className="section__lead">
            Se há denúncia ou pista, use `/envie`. Se ainda está entendendo o projeto, siga por `/comecar`. Se quer colaborar com memória, acervo ou acompanhar investigação, vá por `/participe`, `/memoria`, `/acervo`, `/dossies` e `/agora`.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/envie" className="button">
            Abrir envio
          </Link>
          <Link href="/participe" className="button-secondary">
            Ver caminhos de participação
          </Link>
          <Link href="/comecar" className="button-secondary">
            Começar por aqui
          </Link>
        </div>
      </section>
    </Container>
  );
}
