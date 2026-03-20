import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Envio recebido",
  description: "Confirmação do envio e próximos passos do VR Abandonada.",
};

export default function EnvioRecebidoPage() {
  return (
    <Container className="intro-grid receipt-page">
      <PageHero
        kicker="envie"
        title="Recebemos seu envio."
        lead="O material entrou na fila editorial inicial. Obrigado por confiar no projeto com cuidado e contexto."
      />

      <section className="section receipt-intro-section">
        <div className="grid-2">
          <article className="support-box home-callout home-callout--accent">
            <p className="eyebrow">o que acontece agora</p>
            <h3>A equipe lê, cruza e decide o próximo passo.</h3>
            <p>
              O envio pode virar pauta, memória, acervo, dossiê ou ficar em espera até ter contexto suficiente. Nem tudo entra na publicação imediatamente.
            </p>
          </article>
          <article className="support-box">
            <p className="eyebrow">o que não esperar</p>
            <h3>Não existe acompanhamento individual garantido.</h3>
            <p>
              O projeto não oferece status público da submissão nem promessa de resposta privada em tempo real. O compromisso é com leitura responsável e uso editorial adequado.
            </p>
          </article>
        </div>
      </section>

      <section className="section receipt-next-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">próximos passos</p>
            <h2>Se quiser continuar por aí, estes caminhos ajudam.</h2>
          </div>
          <p className="section__lead">
            Você pode acompanhar o que está em curso, entender o método, colaborar com memória ou fortalecer o projeto.
          </p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>Agora</h3>
            <p>Veja o pulso do momento.</p>
            <Link href="/agora" className="button-secondary">
              Abrir radar
            </Link>
          </article>
          <article className="card">
            <h3>Participe</h3>
            <p>Escolha a melhor porta para colaborar.</p>
            <Link href="/participe" className="button-secondary">
              Ver caminhos
            </Link>
          </article>
          <article className="card">
            <h3>Método</h3>
            <p>Entenda como o projeto trabalha.</p>
            <Link href="/metodo" className="button-secondary">
              Ler método
            </Link>
          </article>
          <article className="card">
            <h3>Apoie</h3>
            <p>Ajude a sustentar a continuidade do projeto.</p>
            <Link href="/apoie" className="button-secondary">
              Ver apoio
            </Link>
          </article>
        </div>
      </section>
    </Container>
  );
}