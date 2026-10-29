import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(path, "utf8");

test("materia possui identidade própria; editorial permanece pauta Supabase", () => {
  for (const domain of ["dossiers", "territories"]) {
    const types = read("lib/" + domain + "/types.ts");
    const nav = read("lib/" + domain + "/navigation.ts");
    assert.match(types, /"editorial", "materia"/);
    assert.match(nav, /materia: "Reportagem"/);
    assert.match(nav, /case "editorial":[\s\S]*?\`\/pautas\/\$\{key\}\`/);
    assert.match(nav, /case "materia":[\s\S]*?\`\/materias\/\$\{key\}\`/);
  }
});

test("links de reportagens só resolvem com publicação e revisão confirmadas", () => {
  for (const domain of ["dossiers","territories"]) {
    const resolve = read("lib/" + domain + "/resolve.ts");
    assert.match(resolve, /context\.materias \?\? \[\]/);
    assert.match(resolve, /item\.status === "published" && item\.reviewed === true/);
    assert.match(resolve, /parsed\.type === "materia"/);
    assert.match(resolve, /return null/);
    assert.match(resolve, /Reportagem ·/);
  }
});

test("páginas públicas e internas obtêm matérias do catálogo Git", () => {
  const detail = ["app/dossies/[slug]/page.tsx","app/territorios/[slug]/page.tsx"];
  const internal = ["app/interno/dossies/[id]/page.tsx","app/interno/territorios/[id]/page.tsx"];
  for (const path of [...detail,...internal]) {
    const s = read(path);
    assert.match(s, /getMaterias/);
    assert.match(s, /materias,/);
  }
  assert.match(read(detail[0]), /link\.link_type === "materia"/);
  assert.match(read(detail[1]), /linksByType\.materia/);
});

test("ações servidoras rejeitam slug Git ausente ou não aprovado", () => {
  for (const path of ["app/interno/dossies/actions.ts","app/interno/territorios/actions.ts"]) {
    const source = read(path);
    assert.match(source, /import \{ getMateria \}/);
    assert.match(source, /parsed\.type === "materia" && !\(await getMateria\(parsed\.key\)\)/);
    assert.match(source, /reportagem não está publicada e revisada/i);
  }
});

test("o rollout proíbe migrar vínculos sem CHECK e RLS de staging", () => {
  const plan = read("docs/PLANO_IMPLANTACAO_EDITORIAL_SUPABASE.md");
  assert.match(plan, /CHECKs antigos/);
  assert.match(plan, /não admitem \`materia\`/);
  assert.match(plan, /não é considerado pronto pela V9/);
});
