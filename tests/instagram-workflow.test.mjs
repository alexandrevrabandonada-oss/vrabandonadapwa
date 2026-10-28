import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) => readFileSync(name, "utf8");

test("nenhum agendamento grava diretamente na main do repositório", () => {
  const source = read(".github/workflows/import-instagram.yml");
  assert.match(source, /schedule:/);
  assert.match(source, /workflow_dispatch:/);
  assert.match(source, /peter-evans\/create-pull-request@v8/);
  assert.match(source, /draft: always-true/);
  assert.match(source, /branch: automation\/instagram-import/);
  assert.match(source, /add-paths:/);
  assert.doesNotMatch(source, /\bgit push\b/);
  assert.doesNotMatch(source, /\bgit commit\b/);
});
test("a importação exige secret Meta e não coloca token nos argumentos", () => {
  const source = read(".github/workflows/import-instagram.yml");
  assert.match(source, /secrets\.INSTAGRAM_ACCESS_TOKEN/);
  assert.match(source, /steps\.meta\.outputs\.available == 'true'/);
  assert.match(source, /scripts\/validate-instagram\.mjs/);
  assert.match(source, /contents: write/);
  assert.match(source, /pull-requests: write/);
});
test("build de produção valida o índice; arquivos do Instagram disparam pipeline", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.match(packageJson.scripts.prebuild, /validate-instagram/);
  const workflow = read(".github/workflows/validate-portal.yml");
  assert.match(workflow, /public\/data\/instagram-posts\.json/);
  assert.match(workflow, /public\/instagram-media\/\*\*/);
});
test("download de capa restringe formato e redirecionamentos a domínios autorizados", () => {
  const importer = read("scripts/import-instagram.mjs");
  assert.match(importer, /safeMediaUrl\(response\.url\)/);
  assert.match(importer, /image\\\/jpeg/);
  assert.match(importer, /binary\[0\] !== 0xff/);
});
