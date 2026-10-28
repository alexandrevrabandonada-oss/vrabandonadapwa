import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function load(path, dependencies) {
  const source = readFileSync(path, "utf8");
  const compiled = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
  const module = { exports: {} };
  runInNewContext(compiled, {
    module, exports: module.exports, console, process, Response,
    require(name) {
      if (!(name in dependencies)) throw new Error("unexpected dependency " + name);
      return dependencies[name];
    }
  });
  return module.exports;
}

const audit = load("lib/media/private-reconcile.ts", {
  "@/lib/media/private-server": { PRIVATE_BUCKET: "editorial-private" },
});

function service(storagePaths, dbPaths, options = {}) {
  return {
    storage: {
      from(bucket) {
        assert.equal(bucket, "editorial-private");
        return {
          async list(folder, opts) {
            assert.equal(folder, "");
            if (options.storageError) return { error: { message: "blocked" }, data: null };
            return { data: storagePaths.slice(opts.offset, opts.offset + opts.limit).map((name) => ({ id: name, name })), error: null };
          }
        };
      }
    },
    from(table) {
      assert.equal(table, "private_editorial_documents");
      return {
        select(columns) {
          assert.equal(columns, "object_path");
          return {
            order(field) {
              assert.equal(field, "object_path");
              return {
                async range(start, end) {
                  if (options.registryError) return { data: null, error: { message: "blocked" } };
                  return { data: dbPaths.slice(start, end + 1).map((object_path) => ({ object_path })), error: null };
                }
              };
            }
          };
        }
      };
    }
  };
}
test("somente contagens: arquivos órfãos e registros sem objeto", async () => {
  const result = await audit.auditPrivateStorage(service(["a.jpg", "b.pdf"], ["a.jpg", "c.pdf"]));
  assert.equal(result.orphanCount, 1);
  assert.equal(result.missingCount, 1);
  assert.equal(result.storageCount, 2);
  assert.equal(result.registeredCount, 2);
  assert.equal(result.complete, true);
  assert.equal(JSON.stringify(result).includes("a.jpg"), false);
});
test("inventário paginado inclui segunda página", async () => {
  const values = Array.from({ length: 103 }, (_, i) => "file-" + String(i).padStart(3, "0") + ".pdf");
  const result = await audit.auditPrivateStorage(service(values, values));
  assert.equal(result.orphanCount, 0);
  assert.equal(result.storageCount, 103);
});
test("em falha no Storage ou cadastro não inventa resultado", async () => {
  await assert.rejects(audit.auditPrivateStorage(service([], [], { storageError: true })));
  await assert.rejects(audit.auditPrivateStorage(service([], [], { registryError: true })));
});
test("limite impede falso inventário completo", async () => {
  const values = Array.from({ length: 1001 }, (_, i) => "obj-" + i + ".pdf");
  await assert.rejects(audit.auditPrivateStorage(service(values, [])));
});
test("rota sem autorização não consulta Storage", async () => {
  const router = load("app/api/interno/documentos/auditoria/route.ts", {
    "@/lib/media/private-server": { authorizePrivateDocuments: async () => null },
    "@/lib/media/private-reconcile": { auditPrivateStorage: async () => { throw new Error("should not run"); } },
  });
  const response = await router.GET();
  assert.equal(response.status, 403);
  assert.match(response.headers.get("cache-control"), /no-store/);
});
