import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(path, "utf8");

test("Next.js não pode publicar ignorando erros TypeScript e ESLint", () => {
  const config = read("next.config.ts");
  assert.doesNotMatch(config, /ignoreBuildErrors\s*:\s*true/);
  assert.doesNotMatch(config, /ignoreDuringBuilds\s*:\s*true/);
  assert.match(config, /reactStrictMode:\s*true/);
});

test("CI só conclui após typecheck, lint, build, smoke HTTP e QA acessível", () => {
  const flow = read(".github/workflows/validate-portal.yml");
  const expected = [
    "run: npm run typecheck",
    "run: npm run lint",
    "run: npm run build",
    "run: node scripts/smoke-local-portal.mjs",
    "run: node scripts/audit-local-ux.mjs",
    "run: node scripts/audit-accessibility-v7.mjs",
  ];
  const positions = expected.map(x => flow.indexOf(x));
  assert.ok(positions.every(x => x >= 0), "CI deve manter todos os gates");
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
});

test("mudança de configuração do Next dispara validação no pull request", () => {
  const flow = read(".github/workflows/validate-portal.yml");
  assert.match(flow, /'next\.config\.ts'/);
  assert.match(flow, /'tsconfig\.json'/);
  assert.match(flow, /'\.eslintrc\*'/);
});
