import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("envio de arquivo ao acervo legado falha antes de acessar o Storage", async () => {
  const source = readFileSync("lib/media/archive.ts", "utf8");
  const compiled = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
  let storageAccessed = false;
  const module = { exports: {} };
  runInNewContext(compiled, {
    module,
    exports: module.exports,
    require(name) {
      if (name === "@/lib/supabase/service") return { createSupabaseServiceClient() { storageAccessed = true; throw new Error("Storage acessado"); } };
      if (name === "@/lib/editorial/utils") return { slugifyEditorialValue: (value) => value };
      if (name === "node:path" || name === "node:crypto") return {};
      throw new Error(`Importação inesperada: ${name}`);
    },
  });
  await assert.rejects(module.exports.uploadArchiveAsset({ name: "teste.pdf" }, "id"), /temporariamente suspenso/);
  assert.equal(storageAccessed, false);
});
