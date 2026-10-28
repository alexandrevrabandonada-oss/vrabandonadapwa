import type { SupabaseClient } from "@supabase/supabase-js";
import { PRIVATE_BUCKET } from "@/lib/media/private-server";

// Conservador: um resultado incompleto nunca é apresentado como inventário confiável.
const PAGE_SIZE = 100;
const MAX_OBJECTS = 1000;

export type PrivateStorageAudit = {
  storageCount: number;
  registeredCount: number;
  orphanCount: number;
  missingCount: number;
  complete: true;
};

export function reconcilePathSets(storagePaths: readonly string[], recordedPaths: readonly string[]): PrivateStorageAudit {
  const storage = new Set(storagePaths);
  const recorded = new Set(recordedPaths);
  if (storage.size !== storagePaths.length || recorded.size !== recordedPaths.length) {
    throw new Error("Duplicate paths: reconciliation is not conclusive");
  }
  return {
    storageCount: storage.size,
    registeredCount: recorded.size,
    orphanCount: [...storage].filter((path) => !recorded.has(path)).length,
    missingCount: [...recorded].filter((path) => !storage.has(path)).length,
    complete: true,
  };
}

/**
 * Auditoria SOMENTE LEITURA no bucket privado.
 * Não divulga caminhos, hashes, URLs, nomes ou dados das capturas.
 * Não baixa objetos, não gera signed URLs e não executa remove/copy/upload.
 */
export async function auditPrivateStorage(service: SupabaseClient): Promise<PrivateStorageAudit> {
  const objects: string[] = [];
  const records: string[] = [];

  for (let offset = 0; offset <= MAX_OBJECTS; offset += PAGE_SIZE) {
    const { data, error } = await service.storage.from(PRIVATE_BUCKET).list("", {
      limit: PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" },
    });
    if (error || !data) throw new Error("Storage inventory unavailable");
    // A versão atual guarda UUID.ext diretamente na raiz. Caso haja
    // subpastas, falha fechado em vez de ignorar arquivos nelas.
    if (data.some((entry) => !entry.id || entry.name.includes("/"))) {
      throw new Error("Storage folders require a recursive inventory");
    }
    if (offset === MAX_OBJECTS && data.length) throw new Error("Storage inventory limit exceeded");
    for (const item of data) objects.push(item.name);
    if (data.length < PAGE_SIZE) break;
  }

  for (let offset = 0; offset <= MAX_OBJECTS; offset += PAGE_SIZE) {
    const { data, error } = await service
      .from("private_editorial_documents")
      .select("object_path")
      .order("object_path", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error || !data) throw new Error("Document registry unavailable");
    if (offset === MAX_OBJECTS && data.length) throw new Error("Registry inventory limit exceeded");
    for (const item of data) records.push(item.object_path);
    if (data.length < PAGE_SIZE) break;
  }

  return reconcilePathSets(objects, records);
}
