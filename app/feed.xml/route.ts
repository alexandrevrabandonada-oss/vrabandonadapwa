import { getInstagramPosts, titleFor, summaryFor } from "@/lib/instagram/posts";
import { getSiteUrl } from "@/lib/site-url";

const escapeXml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const revalidate = 3600;

export function GET() {
  const host = getSiteUrl();
  const items = getInstagramPosts().slice(0, 50).map((post) => {
    const url = host + "/publicacoes/" + post.id;
    return [
      "<item>", "<title>" + escapeXml(titleFor(post)) + "</title>",
      "<link>" + escapeXml(url) + "</link>",
      "<guid isPermaLink=\"true\">" + escapeXml(url) + "</guid>",
      "<description>" + escapeXml(summaryFor(post)) + "</description>",
      "<pubDate>" + new Date(post.published_at).toUTCString() + "</pubDate>",
      "</item>"
    ].join("");
  }).join("");
  const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0"><channel><title>VR Abandonada - Publicações</title>' +
    '<link>' + escapeXml(host) + '</link><language>pt-BR</language>' +
    '<description>Notícias, vídeos e publicações de Volta Redonda</description>' + items + '</channel></rss>';
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
