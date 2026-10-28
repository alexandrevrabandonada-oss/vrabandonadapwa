import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { authorizePrivateDocuments } from "@/lib/media/private-server";
import { auditPrivateStorage } from "@/lib/media/private-reconcile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Auditoria interna de documentos",
  description: "Diagnóstico restrito de integridade do armazenamento privado.",
  robots: { index: false, follow: false },
};

export default async function AuditoriaArmazenamentoPage() {
  const context = await authorizePrivateDocuments().catch(() => null);
  if (!context) notFound();

  const report = await auditPrivateStorage(context.service).catch(() => null);

  return (
    <Container className="internal-page">
      <section className="section internal-panel" style={{ marginTop: "2rem" }}>
        <p className="eyebrow">Acesso administrativo · Apenas leitura</p>
        <h1>Integridade de documentos privados</h1>
        <p className="section__lead">
          Esta auditoria compara os arquivos guardados no bucket privado com os
          registros editoriais. Não exibe caminhos, nomes de arquivos ou links
          temporários. Não exclui, corrige nem altera documentos.
        </p>
        {!report ? (
          <div className="support-box" role="status">
            <h2>Inventário não concluído</h2>
            <p>O armazenamento ou os registros não puderam ser consultados integralmente.
              Nenhum resultado parcial é apresentado como confiável.</p>
          </div>
        ) : (
          <>
            <div className="grid-2" style={{ marginTop: "2rem" }}>
              {[
                { label: "Arquivos armazenados", value: report.storageCount },
                { label: "Registros editoriais", value: report.registeredCount },
                { label: "Arquivos sem cadastro", value: report.orphanCount },
                { label: "Cadastros sem arquivo", value: report.missingCount },
              ].map((metric) => (
                <article className="support-box" key={metric.label}>
                  <p className="eyebrow">{metric.label}</p>
                  <p style={{ fontSize: "2.6rem", fontWeight: 900, margin: "0.35rem 0" }}>{metric.value}</p>
                </article>
              ))}
            </div>
            <div className="support-box" style={{ marginTop: "1.25rem" }}>
              <h2>{report.orphanCount === 0 && report.missingCount === 0
                ? "Inventário consistente dentro do escopo verificado"
                : "Revisão técnica necessária"}</h2>
              <p>{report.orphanCount === 0 && report.missingCount === 0
                ? "Todos os objetos inventariados têm registro correspondente. Isso não substitui o teste de permissões com sessões reais."
                : "Foram encontradas divergências. Não execute limpeza automática: investigue os registros e os arquivos com o procedimento de recuperação aprovado."}</p>
            </div>
          </>
        )}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/interno/capturar">Voltar à Captura Universal</Link>
        </p>
      </section>
    </Container>
  );
}
