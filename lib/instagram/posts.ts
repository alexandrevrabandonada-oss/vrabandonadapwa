import rawPosts from "@/public/data/instagram-posts.json";

export type InstagramPost = {
  id: string;
  caption: string;
  permalink: string;
  published_at: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_product_type?: string;
  local_image?: string;
};

const posts = rawPosts as InstagramPost[];

export function getInstagramPosts(): InstagramPost[] {
  return posts.filter((post) =>
    /^\d{6,30}$/.test(post.id) &&
    /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//.test(post.permalink) &&
    post.caption.trim().length > 0 &&
    !Number.isNaN(Date.parse(post.published_at))
  ).sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}

export function getInstagramPost(id: string) {
  return getInstagramPosts().find((post) => post.id === id);
}

export function titleFor(post: InstagramPost) {
  const first = post.caption.split(/\n+/).map((line) => line.trim()).find((line) => line.length > 8) ?? "Publicação do VR Abandonada";
  return first.replace(/^#[\wÀ-ÿ]+\s*/, "").slice(0, 118);
}

export function summaryFor(post: InstagramPost) {
  return post.caption.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/\s+/g, " ").trim().slice(0, 230);
}

export const TOPICS = ["CSN e poluição", "Trabalho", "Cidade", "Saúde", "Educação", "Transporte", "Memória"] as const;

export function topicsFor(post: InstagramPost): string[] {
  const content = post.caption.toLocaleLowerCase("pt-BR");
  const terms: Record<string, RegExp> = {
    "CSN e poluição": /csn|siderurgia|poluiç|qualidade do ar|emissõ|particulad|cbsi/,
    Trabalho: /trabalh|salári|terceiriz|sindicat|acidente|emprego/,
    Cidade: /rua|bairro|obra|prefeitura|praça|calçada|terreno|abandono/,
    Saúde: /hospital|saúde|paciente|sus|médic|unidade de saúde/,
    Educação: /educaç|escola|professor|creche|aluno/,
    Transporte: /ônibus|tarifa|transporte|mobilidade|rodoviária/,
    Memória: /história|memória|arquivo|fotografia antiga|greve/,
  };
  return TOPICS.filter((topic) => terms[topic].test(content));
}

export function formattedDate(post: InstagramPost) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(new Date(post.published_at));
}
