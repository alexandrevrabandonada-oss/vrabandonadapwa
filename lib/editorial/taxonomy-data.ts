import type { EditorialSeries } from "@/lib/editorial/types";

export const editorialSeriesCatalog: EditorialSeries[] = [
  {
    slug: "cidade-e-abandono",
    title: "Cidade e abandono",
    description: "Infraestrutura, transporte, saúde e as falhas que moldam o cotidiano de Volta Redonda.",
    axis: "Cidade e abandono",
    coverVariant: "concrete",
  },
  {
    slug: "memoria-operaria",
    title: "Memória operária",
    description: "Relatos, imagens e marcos da formação industrial e popular da cidade.",
    axis: "Memória operária",
    coverVariant: "steel",
  },
  {
    slug: "poluicao-e-csn",
    title: "Poluição e CSN",
    description: "Ambiente, ar, água e os efeitos da indústria sobre a vida concreta.",
    axis: "Apuração pública",
    coverVariant: "ember",
  },
  {
    slug: "trabalho-e-acidentes",
    title: "Trabalho e acidentes",
    description: "Risco, desgaste, rotina laboral e o preço da produção na cidade operária.",
    axis: "Apuração pública",
    coverVariant: "night",
  },
];
