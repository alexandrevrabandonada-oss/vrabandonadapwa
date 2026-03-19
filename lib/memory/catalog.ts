import type { MemoryCollection, MemoryTimelineEntry } from "@/lib/memory/types";

export const memoryCollectionsFallback: MemoryCollection[] = [
  {
    slug: "cidade-operaria",
    title: "Cidade operária",
    description: "Marcos da formação da cidade como território de trabalho, bairro e organização popular.",
    display_order: 1,
    featured: true,
  },
  {
    slug: "poluicao-e-industria",
    title: "Poluição e indústria",
    description: "Recortes sobre ar, fumaça, água e o custo ambiental da produção no cotidiano.",
    display_order: 2,
    featured: true,
  },
  {
    slug: "trabalho-e-acidentes",
    title: "Trabalho e acidentes",
    description: "Memórias do risco, do desgaste e das marcas que o trabalho deixa no corpo.",
    display_order: 3,
    featured: true,
  },
  {
    slug: "apagamentos-e-disputas",
    title: "Apagamentos e disputas",
    description: "O que some quando a cidade se reescreve e o que insiste em permanecer no arquivo vivo.",
    display_order: 4,
    featured: false,
  },
];

export const memoryTimelineFallback: MemoryTimelineEntry[] = [
  {
    label: "Formação operária",
    year: "1946",
    detail: "A cidade se estrutura em torno do trabalho industrial e da reorganização do território.",
    slug: "greve-e-fabrica",
  },
  {
    label: "Expansão e pressão urbana",
    year: "1970-1980",
    detail: "Bairros crescem, conflitos aparecem e o cotidiano passa a carregar mais deslocamento, risco e desgaste.",
    slug: null,
  },
  {
    label: "Memória ambiental",
    year: "1990-2000",
    detail: "A conversa pública sobre poluição e saúde começa a disputar espaço com a narrativa oficial.",
    slug: "poeira-e-fumaca",
  },
  {
    label: "Risco laboral contemporâneo",
    year: "2004-2020",
    detail: "Acidentes, lesões e turnos intensos voltam a mostrar o custo do trabalho na cidade.",
    slug: "acidente-e-turno",
  },
];
