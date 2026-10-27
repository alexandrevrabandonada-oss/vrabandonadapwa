import type { MetadataRoute } from "next";
import { getInstagramPosts } from "@/lib/instagram/posts";
import { getMaterias } from "@/lib/materias";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getSiteUrl();
  const articles = await getMaterias();
  const routes = ["/", "/materias", "/publicacoes", "/agora", "/buscar", "/acompanhar", "/pautas", "/dossies", "/campanhas", "/memoria", "/acervo", "/linha-do-tempo", "/eixos", "/territorios", "/sobre", "/metodo", "/apoie"];
  return [
    ...routes.map((route) => ({
      url: url + (route === "/" ? "" : route),
      changeFrequency: (route === "/" || route === "/materias" ? "daily" : "weekly") as "daily" | "weekly",
      priority: route === "/" ? 1 : route === "/materias" ? 0.95 : 0.6,
    })),
    ...articles.map((a) => ({url: url + "/materias/" + a.slug, lastModified: new Date(a.updatedAt || a.publishedAt), changeFrequency: "monthly" as const, priority: 0.85})),
    ...getInstagramPosts().map((p) => ({url: url + "/publicacoes/" + p.id, lastModified: new Date(p.published_at), changeFrequency: "monthly" as const, priority: 0.65})),
  ];
}
