import type { EditorialItem } from "@/lib/editorial/types";

export const editorialMockItems: EditorialItem[] = [
  {
    id: "mock-1",
    intake_submission_id: null,
    title: "Linha, tarifa e espera: quem paga o tempo roubado da cidade?",
    slug: "linha-tarifa-e-espera",
    excerpt:
      "Uma leitura sobre transporte, atraso e custo cotidiano para quem depende da cidade em movimento.",
    body:
      "Volta Redonda opera com um relógio desigual.\n\nEnquanto alguns circulam rápido, outros acumulam atraso, custo e desgaste. O transporte se torna uma forma de disciplina urbana, e o corpo trabalhador paga o preço da espera.",
    category: "cidade",
    neighborhood: "Centro e bairros conectados",
    cover_image_url: null,
    published: true,
    published_at: "2026-03-19T12:00:00.000Z",
    editorial_status: "published",
    featured: true,
    source_visibility_note: "Conteúdo editorial de demonstração para a fundação do projeto.",
    created_at: "2026-03-19T12:00:00.000Z",
    updated_at: "2026-03-19T12:00:00.000Z",
    created_by: null,
    updated_by: null,
  },
  {
    id: "mock-2",
    intake_submission_id: null,
    title: "O que sobrou da promessa de desenvolvimento industrial?",
    slug: "o-que-sobrou-da-promessa-industrial",
    excerpt:
      "Memória operária e abandono urbano numa cidade que ainda carrega a marca da siderurgia.",
    body:
      "A cidade foi vendida como símbolo de progresso.\n\nO arquivo popular conta outra história: bairro desigual, infraestrutura cansada e uma lembrança constante de que desenvolvimento sem distribuição vira ruína organizada.",
    category: "memoria",
    neighborhood: "Vila Santa Cecília",
    cover_image_url: null,
    published: true,
    published_at: "2026-03-19T12:00:00.000Z",
    editorial_status: "published",
    featured: false,
    source_visibility_note: "Mock editorial para acervo inicial da home pública.",
    created_at: "2026-03-19T12:00:00.000Z",
    updated_at: "2026-03-19T12:00:00.000Z",
    created_by: null,
    updated_by: null,
  },
];
