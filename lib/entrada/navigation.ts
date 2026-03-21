import type { EditorialEntryType } from "@/lib/entrada/types";
import { editorialEntryTypeLabels } from "@/lib/entrada/types";

export type EntryTypeConfig = {
  title: string;
  description: string;
  quickLead: string;
  examples: string[];
  accept: string;
  actionPrimary: string;
  actionSecondary: string;
  actionTertiary: string;
};

export const entryTypeConfig: Record<EditorialEntryType, EntryTypeConfig> = {
  post: {
    title: editorialEntryTypeLabels.post,
    description: "Para fato quente, atualização rápida, denúncia curta ou relato breve.",
    quickLead: "Entre rápido, salve o mínimo e só depois escolha a camada profunda.",
    examples: ["post do Instagram", "fato quente", "denúncia curta"],
    accept: "image/*",
    actionPrimary: "Publicar em Agora",
    actionSecondary: "Guardar rascunho",
    actionTertiary: "Guardar para enriquecer",
  },
  document: {
    title: editorialEntryTypeLabels.document,
    description: "Para artigo, relatório, estudo, processo, parecer ou PDF importante.",
    quickLead: "Suba o arquivo, marque o básico e decida o resto depois.",
    examples: ["artigo", "relatório", "PDF"],
    accept: "application/pdf,image/*",
    actionPrimary: "Guardar no Acervo",
    actionSecondary: "Guardar e vincular depois",
    actionTertiary: "Guardar e criar resumo depois",
  },
  image: {
    title: editorialEntryTypeLabels.image,
    description: "Para foto antiga, recorte de jornal, escaneado ou memória visual.",
    quickLead: "Suba a imagem e deixe o restante para a etapa de revisão.",
    examples: ["foto antiga", "jornal", "documento escaneado"],
    accept: "image/*,application/pdf",
    actionPrimary: "Guardar no Acervo",
    actionSecondary: "Guardar e publicar como Memória depois",
    actionTertiary: "Guardar e revisar depois",
  },
};
