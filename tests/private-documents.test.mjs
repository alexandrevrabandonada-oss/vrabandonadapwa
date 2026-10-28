import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function load(path, dependencies, globals = {}) {
  const source = readFileSync(path, "utf8");
  const compiled = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
  const module = { exports: {} };
  runInNewContext(compiled, { module, exports: module.exports, File, Uint8Array, Response, console, process, ...globals, require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected import ${name}`);
    return dependencies[name];
  }});
  return module.exports;
}
const validation = load("lib/media/private-validation.ts", {});
const pdf = new Uint8Array([37,80,68,70,45,49,46,55]);
test("valida tamanho, extensão, MIME e assinatura do arquivo", () => {
  assert.equal(validation.validatePrivateFile("teste.pdf", "application/pdf", pdf)?.extension, "pdf");
  assert.equal(validation.validatePrivateFile("teste.jpg", "image/jpeg", pdf), null);
  assert.equal(validation.validatePrivateFile("teste.pdf.exe", "application/pdf", pdf), null);
  assert.equal(validation.validatePrivateFile("teste.pdf", "text/html", pdf), null);
  assert.equal(validation.validatePrivateFile("teste.pdf", "application/pdf", new Uint8Array(900 * 1024 + 1)), null);
});

function makeAction(context) {
  return load("app/interno/capturar/private-actions.ts", {
    "node:crypto": { createHash, randomUUID: () => "11111111-1111-4111-8111-111111111111" },
    "next/cache": { revalidatePath() {} },
    "@/lib/media/private-server": { authorizePrivateDocuments: async () => context, PRIVATE_BUCKET: "editorial-private" },
    "@/lib/media/private-validation": validation,
  }).uploadPrivateCapture;
}
function form() {
  const data = new FormData();
  data.set("capture_id", "11111111-1111-4111-8111-111111111111");
  data.set("file", new File([pdf], "teste.pdf", { type: "application/pdf" }));
  return data;
}
test("sem autorização não recebe arquivo", async () => {
  const result = await makeAction(null)({ ok: false, message: "" }, form());
  assert.equal(result.ok, false);
});
test("rota não autorizada não gera URL assinada e impede cache", async () => {
  let fetched = false;
  const route = load("app/api/interno/documentos/[id]/route.ts", {
    "@/lib/media/private-server": { authorizePrivateDocuments: async () => null, PRIVATE_BUCKET: "editorial-private" },
  }, { fetch: async () => { fetched = true; throw new Error("unexpected"); } });
  const response = await route.GET({}, { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) });
  assert.equal(response.status, 403);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(fetched, false);
});
test("autorização exige sessão, administrador e bucket privado", async () => {
  const previous = process.env.VR_PRIVATE_DOCUMENTS_ENABLED;
  process.env.VR_PRIVATE_DOCUMENTS_ENABLED = "true";
  try {
    let admin = false;
    let isPublic = false;
    const auth = load("lib/media/private-server.ts", {
      "server-only": {},
      "@/lib/admin": { isAdminEmailAllowed: async () => admin },
      "@/lib/supabase/server": { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "id", email: "admin@example.invalid" } }, error: null }) } }) },
      "@/lib/supabase/service": { createSupabaseServiceClient: () => ({ storage: { getBucket: async () => ({ data: { public: isPublic }, error: null }) } }) },
    });
    assert.equal(await auth.authorizePrivateDocuments(), null);
    admin = true;
    isPublic = true;
    assert.equal(await auth.authorizePrivateDocuments(), null);
    isPublic = false;
    assert.ok(await auth.authorizePrivateDocuments());
    process.env.VR_PRIVATE_DOCUMENTS_ENABLED = "false";
    assert.equal(await auth.authorizePrivateDocuments(), null);
  } finally {
    if (previous === undefined) delete process.env.VR_PRIVATE_DOCUMENTS_ENABLED;
    else process.env.VR_PRIVATE_DOCUMENTS_ENABLED = previous;
  }
});
test("falha ao gravar metadados remove objeto recém-enviado", async () => {
  let removed = 0;
  const context = {
    user: { id: "user" },
    userClient: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "capture" }, error: null }) }) }) }) },
    service: {
      storage: { from: () => ({ upload: async () => ({ error: null }), remove: async () => { removed++; return { error: null }; } }) },
      from: () => ({ insert: async () => ({ error: { code: "synthetic" } }) }),
    },
  };
  const result = await makeAction(context)({ ok: false, message: "" }, form());
  assert.equal(result.ok, false);
  assert.equal(removed, 1);
});
