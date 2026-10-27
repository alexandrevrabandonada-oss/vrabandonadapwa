import type { MetadataRoute } from "next";
import { getInstagramPosts } from "@/lib/instagram/posts";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  const routes = ["/", "/publicacoes", "/agora", "/buscar", "/acompanhar", "/pautas", "/dossies", "/campanhas", "/memoria", "/acervo", "/linha-do-tempo", "/eixos", "/territorios", "/sobre", "/metodo", "/apoie"];
  return [
    ...routes.map((route) => ({ url: url + (route === "/" ? "" : route), lastModified: new Date(), changeFrequency: route === "/" || route === "/publicacoes" ? "daily" as const : "weekly" as const, priority: route === "/" ? 1 : route === "/publicacoes" ? 0.9 : 0.6 })),
    ...getInstagramPosts().map((post) => ({ url: url + "/publicacoes/" + post.id, lastModified: new Date(post.published_at), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
