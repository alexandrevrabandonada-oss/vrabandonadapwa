/** Conteúdo demonstrativo nunca equivale a uma publicação em produção. */
export function allowPublicDemoContent() {
  return process.env.NODE_ENV === "development" && process.env.VR_ENABLE_DEMO_FIXTURES === "true";
}
