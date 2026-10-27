const fallbackLocalUrl = "http://localhost:3000";
const canonicalProductionHost = "www.vrabandonada.com.br";

function normalizeCanonicalUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "vrabandonada.com.br") {
      url.hostname = canonicalProductionHost;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return value;
  }

  return value;
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeCanonicalUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    // SEO: previews também apontam para o domínio canônico, nunca para URLs efêmeras.
    return `https://${canonicalProductionHost}`;
  }

  return fallbackLocalUrl;
}
