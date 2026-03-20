import type { ThemeHub } from "@/lib/hubs/types";

export const themeHubCatalog: Array<Pick<ThemeHub, "slug" | "title" | "excerpt" | "description" | "lead_question" | "cover_image_url" | "featured" | "public_visibility" | "sort_order" | "status">> = [
  {
    slug: "poluicao-e-csn",
    title: "Poluição e CSN",
    excerpt: "Ar, fumaça e impacto cotidiano em torno da siderurgia.",
    description:
      "Eixo que reúne o que a cidade respira, o que o entorno industrial produz e o que vira custo ambiental para bairros e corpos.",
    lead_question: "Quem paga o custo ambiental da cidade e por que isso foi naturalizado?",
    cover_image_url: "/editorial/covers/arquivo-inicial.svg",
    featured: true,
    public_visibility: true,
    sort_order: 1,
    status: "active",
  },
  {
    slug: "trabalho-e-acidentes",
    title: "Trabalho e acidentes",
    excerpt: "Turno, risco e desgaste como rotina pública.",
    description:
      "Frente dedicada a lesão, pressão produtiva, adoecimento e a normalização do risco no cotidiano do trabalho operário.",
    lead_question: "Quando o acidente deixa de ser exceção e vira estrutura?",
    cover_image_url: "/archive/assets/acervo-relatorio.svg",
    featured: true,
    public_visibility: true,
    sort_order: 2,
    status: "monitoring",
  },
  {
    slug: "cidade-e-abandono",
    title: "Cidade e abandono",
    excerpt: "Infraestrutura, espera e desgaste urbano como política cotidiana.",
    description:
      "Eixo que trata da falha prolongada do espaço público, da manutenção interrompida e da cidade como território de abandono administrado.",
    lead_question: "O que a cidade deixa cair quando o abandono vira normalidade?",
    cover_image_url: "/archive/assets/acervo-foto-oficina.svg",
    featured: true,
    public_visibility: true,
    sort_order: 3,
    status: "active",
  },
  {
    slug: "memoria-de-volta-redonda",
    title: "Memória de Volta Redonda",
    excerpt: "Arquivo vivo da cidade, do trabalho e das disputas pela narrativa pública.",
    description:
      "Frente que cruza fotografia, relato oral, marcos urbanos e documentos para impedir que a história da cidade vire apagamento.",
    lead_question: "Que memória a cidade ainda consegue sustentar contra o esquecimento oficial?",
    cover_image_url: "/archive/assets/acervo-recorte-jornal.svg",
    featured: false,
    public_visibility: true,
    sort_order: 4,
    status: "monitoring",
  },
] as const;
