import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns = supabaseUrl
  ? [
      {
        protocol: "https" as const,
        hostname: new URL(supabaseUrl).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // TypeScript e lint são gates obrigatórios também durante next build.
  // Nunca aprovar publicação por ignorar erros de qualidade.
  images: {
    remotePatterns,
  },
  serverActions: {
    bodySizeLimit: "10mb",
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    parallelServerBuildTraces: false,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
