import { getMaterias } from "@/lib/materias";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const host = getSiteUrl();
  const articles = await getMaterias();
  const originals = articles.map((a) => ({
    title: a.title,
    url: host + "/materias/" + a.slug,
    summary: a.summary,
    date: a.publishedAt,
  }));
  const items = originals.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 60).map((item) => [
      "<item>",
      "<title>" + xmlEscape(item.title) + "</title>",
      "<link>" + xmlEscape(item.url) + "</link>",
      '<guid isPermaLink="true">' + xmlEscape(item.url) + "</guid>",
      "<description>" + xmlEscape(item.summary) + "</description>",
      "<pubDate>" + new Date(item.date).toUTCString() + "</pubDate>",
      "</item>"
    ].join("")).join("");
  const body = '<?xml version="1.0" encoding="UTF-8"?>' + '<rss version="2.0"><channel>' +
    "<title>VR Abandonada — Publicações</title><link>" + xmlEscape(host) + "</link>" +
    "<language>pt-BR</language><description>Comunicação pública e memória de Volta Redonda</description>" +
    items + "</channel></rss>";
  return new Response(body, {headers: {"Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600"}});
}
