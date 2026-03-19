import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    cpus: 1,
    workerThreads: false,
    parallelServerBuildTraces: false,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
