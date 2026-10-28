export type SiteLink = {
  href: string;
  label: string;
};

export type SiteGroup = {
  title: string;
  items: SiteLink[];
};

export const site = {
  name: "VR Abandonada",
  description:
    "Publicações, investigações e comunicação popular sobre Volta Redonda.",
  shortDescription:
    "Notícias, Reels e memória popular de Volta Redonda.",
  primaryNav: [
    { href: "/", label: "Início" },
    { href: "/agora", label: "Últimas" },
    { href: "/dossies", label: "Investigações" },
    { href: "/noticias", label: "Notícias" },
    { href: "/buscar", label: "Buscar" },
  ] satisfies SiteLink[],
  mobileNav: [
    { href: "/", label: "Início" },
    { href: "/agora", label: "Últimas" },
    { href: "/dossies", label: "Investigar" },
    { href: "/buscar", label: "Buscar" },
  ] satisfies SiteLink[],
  menuGroups: [
    {
      title: "Jornalismo",
      items: [
        { href: "/agora", label: "Últimas" },
        { href: "/materias", label: "Matérias" },
        { href: "/dossies", label: "Investigações" },
        { href: "/publicacoes", label: "Instagram" },
        { href: "/acompanhar", label: "Acompanhar" },
      ],
    },
    {
      title: "Cidade e arquivo",
      items: [
        { href: "/territorios", label: "Bairros e lugares" },
        { href: "/acervo", label: "Acervo" },
        { href: "/memoria", label: "Memória" },
        { href: "/linha-do-tempo", label: "Linha do tempo" },
        { href: "/buscar", label: "Pesquisar" },
      ],
    },
    {
      title: "Meu espaço",
      items: [
        { href: "/salvos", label: "Salvos" },
        { href: "/acompanhar", label: "Acompanhar casos" },
        { href: "/apoie", label: "Apoiar" },
      ],
    },
    {
      title: "Sobre o projeto",
      items: [
        { href: "/sobre", label: "Quem somos" },
        { href: "/metodo", label: "Como apuramos" },
        { href: "/participe", label: "Participar" },
      ],
    },
  ] satisfies SiteGroup[],
  footerQuickLinks: [
    { href: "/agora", label: "Últimas" },
    { href: "/materias", label: "Matérias" },
    { href: "/dossies", label: "Investigações" },
    { href: "/territorios", label: "Bairros" },
    { href: "/acervo", label: "Acervo" },
    { href: "/metodo", label: "Método" },
  ] satisfies SiteLink[],
  hero: {
    kicker: "arquivo vivo da cidade operária",
    title: "Volta Redonda não é cenário. É disputa.",
    lead:
      "VR Abandonada documenta o que tentam apagar: memória da cidade, abandono urbano, denúncias públicas e organização popular com método, contexto e responsabilidade.",
    ctas: [
      { href: "/buscar", label: "Buscar na cidade" },
      { href: "https://comunsocial.online", label: "Participar no COMUN" },
      { href: "/pautas", label: "Ler pautas" },
      { href: "/linha-do-tempo", label: "Tempo" },
    ],
  },
  principles: [
    {
      title: "Memória como ferramenta",
      text: "Recuperar histórias, imagens, relatos e marcas do trabalho, da luta e da vida cotidiana na cidade.",
    },
    {
      title: "Denúncia com contexto",
      text: "Não publicar ruído. Organizar evidência, território, responsável e impacto social.",
    },
    {
      title: "Organização popular",
      text: "Transformar informação em vínculo, agenda, mobilização e ação coletiva.",
    },
  ],
  editorialAxes: [
    {
      title: "Poluição e CSN",
      text: "Ambiente, ar, água e os efeitos da indústria sobre a vida concreta da cidade.",
    },
    {
      title: "Trabalho e acidentes",
      text: "Risco, desgaste, rotina laboral e o preço da produção na cidade operária.",
    },
    {
      title: "Cidade e abandono",
      text: "Infraestrutura, transporte, saúde, educação, saneamento e o que falha no cotidiano.",
    },
    {
      title: "Memória de Volta Redonda",
      text: "Relatos, imagens e marcos da cidade para impedir que a história vire apagamento.",
    },
  ],
  featuredPautas: [
    {
      tag: "Siderurgia",
      title: "O que sobrou da cidade depois das promessas de desenvolvimento?",
      summary:
        "Uma leitura sobre os vazios deixados pela desindustrialização, pelos cortes e pela maquiagem urbana.",
    },
    {
      tag: "Transporte",
      title: "Linha, tarifa e espera: quem paga o tempo roubado da cidade?",
      summary:
        "Como a mobilidade ruim reorganiza o acesso ao trabalho, à escola e ao direito de circular.",
    },
    {
      tag: "Saúde",
      title: "Fila, distância e desgaste: o sistema que empurra o problema para o usuário.",
      summary:
        "Relato de como o atendimento fragmentado vira rotina para quem depende da rede pública.",
    },
  ],
  memoryHighlights: [
    {
      title: "Fábrica, bairro, sindicato",
      text: "A cidade não nasceu limpa nem neutra. Ela foi feita de conflito, trabalho e organização.",
    },
    {
      title: "Fotografia de época",
      text: "Arquivos visuais para comparar o discurso oficial com a cidade concreta.",
    },
    {
      title: "Relatos de quem viveu",
      text: "Memória oral como método para não deixar o território virar legenda de prefeitura.",
    },
  ],
  supportWays: [
    "Acompanhar e compartilhar as pautas com critério.",
    "Enviar material, documentos, fotos e relatos.",
    "Contribuir com apuração, design, código e rede.",
    "Apoiar financeiramente quando o projeto abrir esse fluxo.",
  ],
  intakeNotes: [
    "Denúncia anônima possível.",
    "Contexto ajuda mais do que volume.",
    "Material sensível deve vir com indicação do nível de risco.",
    "Se houver urgência, destaque no assunto e descreva o local com precisão.",
  ],
  manifestoPhrases: [
    "A cidade não é propriedade de gabinete.",
    "Memória também é disputa por futuro.",
    "Denunciar é um ato coletivo quando o problema é estrutural.",
  ],
} as const;


