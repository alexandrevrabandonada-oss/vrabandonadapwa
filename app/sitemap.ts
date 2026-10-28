import type { MetadataRoute } from "next";
import { getInstagramPosts } from "@/lib/instagram/posts";
import { getMaterias } from "@/lib/materias";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedDossiers } from "@/lib/dossiers/queries";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPublishedEditorialTerritories } from "@/lib/territories/editorial";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getSiteUrl();
  const [articles, pautas, dossiers, places, articlePlaces] = await Promise.all([
    getMaterias(), getPublishedEditorialItems(), getPublishedDossiers(), getPublishedPlaceHubs(), getPublishedEditorialTerritories(),
  ]);
  const routes = ["/", "/noticias", "/agora", "/buscar", "/acompanhar", "/pautas", "/dossies", "/campanhas", "/memoria", "/acervo", "/linha-do-tempo", "/eixos", "/territorios", "/sobre", "/metodo", "/apoie"];
  if (articles.length) routes.push("/materias");
  // O índice antigo /publicacoes redireciona para /noticias; links de posts individuais persistem.
  return [
    ...routes.map((route) => ({
      url: url + (route === "/" ? "" : route),
      changeFrequency: (route === "/" || route === "/materias" ? "daily" : "weekly") as "daily" | "weekly",
      priority: route === "/" ? 1 : route === "/materias" ? 0.95 : 0.6,
    })),
    ...articles.map((a) => ({url: url + "/materias/" + a.slug, lastModified: new Date(a.updatedAt || a.publishedAt), changeFrequency: "monthly" as const, priority: 0.85})),
    ...pautas.map((p) => ({url: url + "/pautas/" + p.slug, lastModified: new Date(p.updated_at || p.published_at || p.created_at), changeFrequency: "weekly" as const, priority: 0.75})),
    ...dossiers.map((d) => ({url: url + "/dossies/" + d.slug, lastModified: new Date(d.updated_at || d.created_at), changeFrequency: "weekly" as const, priority: 0.8})),
    ...places.map((p) => ({url: url + "/territorios/" + p.slug, lastModified: new Date(p.updated_at || p.created_at), changeFrequency: "monthly" as const, priority: 0.7})),
    ...articlePlaces.filter((place) => !places.some((hub) => hub.slug === place.slug))
      .map((place) => ({url: url + "/territorios/" + place.slug, lastModified: new Date(place.lastUpdated), changeFrequency: "weekly" as const, priority: 0.72})),
    ...getInstagramPosts().map((p) => ({url: url + "/publicacoes/" + p.id, lastModified: new Date(p.published_at), changeFrequency: "monthly" as const, priority: 0.65})),
  ];
}
