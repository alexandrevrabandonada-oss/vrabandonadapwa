import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = (path) => readFileSync(join(process.cwd(), path), "utf8");
const publicQueries = [
  "actors", "archive", "campaigns", "dossiers", "editions", "editorial",
  "entry-routes", "hubs", "impact", "memory", "participation",
  "patterns", "share-packs", "territories",
];

test("dados demonstrativos só podem ser exibidos em desenvolvimento local explicitamente habilitado", () => {
  const guard = source("lib/editorial/demo-content.ts");
  assert.match(guard, /process\.env\.NODE_ENV === "development"/);
  assert.match(guard, /process\.env\.VR_ENABLE_DEMO_FIXTURES === "true"/);
  for (const section of publicQueries) {
    assert.match(source(`lib/${section}/queries.ts`), /allowPublicDemoContent\(\)/, section);
  }
  assert.match(source("lib/archive/collections.ts"), /allowPublicDemoContent\(\)/);
  assert.match(source("lib/timeline/highlight-queries.ts"), /allowPublicDemoContent\(\)/);
});

test("publicação rápida exige aprovação e autorização no servidor", () => {
  const actions = source("lib/captura/actions.ts");
  assert.match(actions, /isAdminEmailAllowed\(user\.email\)/);
  assert.match(actions, /if \(!editorialApproved\)/);
  assert.match(actions, /confirm_editorial_review/);
  assert.match(actions, /\.eq\("status", "inbox"\)/);
  const ui = source("components/universal-capture-inbox-item.tsx");
  assert.match(ui, /name="confirm_editorial_review" value="yes" required/);
});

test("acervo direto integra a busca geral e sitemap", () => {
  assert.match(source("lib/search/index.ts"), /getMaterias\(\)/);
  assert.match(source("lib/search/types.ts"), /"materia"/);
  assert.match(source("app/sitemap.ts"), /getPublishedDossiers\(\)/);
});
