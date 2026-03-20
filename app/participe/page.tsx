import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ParticipationPathCard } from "@/components/participation-path-card";
import { getHomeOpenGraphImagePath } from "@/lib/editorial/share";
import { getPublishedParticipationPathItems, getPublishedParticipationPaths } from "@/lib/participation/queries";

export const metadata: Metadata = {
  title: "Participe",
  description: "Caminhos para colaborar, apoiar e enviar material ao VR Abandonada.",
  openGraph: {
    title: "Participe | VR Abandonada",
    description: "Caminhos para colaborar, apoiar e enviar material ao VR Abandonada.",
    type: "website",
    images: [getHomeOpenGraphImagePath()],
  },
};

export default async function ParticipatePage() {
  const paths = await getPublishedParticipationPaths();
  const counts = new Map(
    await Promise.all(paths.map(async (path) => [path.id, (await getPublishedParticipationPathItems(path.id)).length] as const)),
  );
  const featured = paths.filter((path) => path.featured).slice(0, 4);
  const activePaths = paths.filter((path) => path.status === "active");

  return (
    <Container className="intro-grid participate-page">
      <section className="hero hero--split participate-hero">
        <div className="hero__copy">
          <p className="eyebrow">participe</p>
          <h1 className="hero__title">Como colaborar com o VR Abandonada.</h1>
          <p className="hero__lead">
            Se o projeto fez sentido para você, aqui estão as portas públicas de colaboração: enviar, apoiar, preservar memória, acompanhar e compartilhar.
          </p>
          <div className="home-hero__signals" aria-label="Sinais editoriais">
            <span className="home-hero__signal">acolhimento editorial</span>
            <span className="home-hero__signal">ação pública responsável</span>
            <span className="home-hero__signal">caminhos claros</span>
          </div>
          <div className="hero__actions">
            <Link href="/comecar" className="button-secondary">
              Entender primeiro
            </Link>
            <Link href="/envie" className="button">
              Enviar agora
            </Link>
          </div>
        </div>

        <article className="support-box home-callout home-callout--accent">
          <p className="eyebrow">para quem é</p>
          <h2>Quem quer transformar leitura em gesto.</h2>
          <p>
            A participação funciona melhor quando cada pessoa entra pelo caminho que faz sentido para o que tem em mãos: relato, apoio, memória, documento ou circulação.
          </p>
          <div className="stack-actions">
            <Link href="/envie" className="button-secondary">
              Abrir envio
            </Link>
            <Link href="/apoie" className="button-secondary">
              Ver apoio
            </Link>
            <Link href="/metodo" className="button-secondary">
              Ver como trabalhamos
            </Link>
          </div>
        </article>
      </section>

      <section className="section participate-intro-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">o que esta página faz</p>
            <h2>Organiza a colaboração sem confundir intenção com formulário.</h2>
          </div>
          <p className="section__lead">
            Em vez de um menu frio de links, a página explica o que cada gesto sustenta e para onde ele deve ir dentro do projeto.
          </p>
        </div>
      </section>

      <section className="section participate-cards-section">
        <div className="grid-2">
          {featured.map((path) => (
            <ParticipationPathCard key={path.id} path={path} href={`/participe/${path.slug}`} itemCount={counts.get(path.id) ?? 0} />
          ))}
        </div>
      </section>

      <section className="section participate-guidance-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">quatro portas</p>
            <h2>Escolha a colaboração que combina com sua situação.</h2>
          </div>
          <p className="section__lead">Cada caminho abaixo foi desenhado para reduzir ruído e aumentar a chance de a sua contribuição entrar do jeito certo.</p>
        </div>

        <div className="grid-2">
          <article className="card">
            <h3>Tem relato, pista ou documento?</h3>
            <p>Use o canal de envio e deixe claro o que aconteceu, onde foi e por que isso importa.</p>
            <Link href="/envie" className="button-secondary">Ir para o envio</Link>
          </article>
          <article className="card">
            <h3>Quer fortalecer o projeto?</h3>
            <p>Apoio ajuda a sustentar apuração, arquivo, design e manutenção da casa digital.</p>
            <Link href="/apoie" className="button-secondary">Ver formas de apoio</Link>
          </article>
          <article className="card">
            <h3>Tem foto, recorte ou memória?</h3>
            <p>Colabore com o arquivo vivo e ajude a preservar a cidade antes que ela seja reescrita.</p>
            <Link href="/memoria" className="button-secondary">Entrar na memória</Link>
          </article>
          <article className="card">
            <h3>Quer acompanhar o que está em curso?</h3>
            <p>Veja o radar, os dossiês e as rotas de entrada para não perder a linha do momento.</p>
            <Link href="/agora" className="button-secondary">Abrir o radar</Link>
          </article>
        </div>
      </section>

      <section className="section participate-method-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">como trabalhamos</p>
            <h2>Transparência pública antes e depois da participação.</h2>
          </div>
          <p className="section__lead">
            Se você quer entender o que acontece depois do envio, como o projeto trata cuidado e correção e por que nem tudo vira publicação imediata, siga para o método.
          </p>
        </div>

        <div className="stack-actions">
          <Link href="/metodo" className="button">
            Ler o método
          </Link>
          <Link href="/envie/recebido" className="button-secondary">
            Ver pós-envio
          </Link>
          <Link href="/envie" className="button-secondary">
            Abrir o envio
          </Link>
        </div>
      </section>

      <section className="section participate-follow-section">
        <div className="grid-2">
          <div>
            <p className="eyebrow">continue por aí</p>
            <h2>Depois de colaborar, siga o fio público.</h2>
          </div>
          <p className="section__lead">A participação fica mais forte quando se conecta com leitura, caso, memória e arquivo.</p>
        </div>

        <div className="grid-4">
          <article className="card">
            <h3>Começar</h3>
            <p>Entenda o projeto em uma rota guiada.</p>
            <Link href="/comecar" className="button-secondary">Abrir rotas</Link>
          </article>
          <article className="card">
            <h3>Dossiês</h3>
            <p>Siga investigações em andamento com updates e próximos passos.</p>
            <Link href="/dossies" className="button-secondary">Ver dossiês</Link>
          </article>
          <article className="card">
            <h3>Memória e acervo</h3>
            <p>Ajude a sustentar o arquivo vivo da cidade.</p>
            <Link href="/acervo" className="button-secondary">Ver acervo</Link>
          </article>
          <article className="card">
            <h3>Agora</h3>
            <p>Veja o que mudou recentemente e o que merece retorno.</p>
            <Link href="/agora" className="button-secondary">Abrir agora</Link>
          </article>
        </div>

        {activePaths.length ? (
          <div className="grid-3">
            {activePaths.slice(0, 3).map((path) => (
              <ParticipationPathCard key={path.id} path={path} href={`/participe/${path.slug}`} itemCount={counts.get(path.id) ?? 0} compact />
            ))}
          </div>
        ) : null}
      </section>
    </Container>
  );
}
