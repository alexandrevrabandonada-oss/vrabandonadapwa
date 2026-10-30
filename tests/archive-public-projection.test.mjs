import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const path of ["lib/archive/queries.ts", "lib/archive/collections.ts"]) {
  test(path + ": projeções públicas não solicitam autoria interna", () => {
    const source = readFileSync(path, "utf8");
    const publicFields = source.match(/const publicFields =\s*"([^"]+)";/)?.[1];
    assert.ok(publicFields);
    assert.doesNotMatch(publicFields, /\b(created_by|updated_by|file_path|thumb_path)\b/);
    assert.match(source, /const internalFields = `${publicFields}, created_by, updated_by/);
    const internal = source.slice(source.indexOf("export async function getInternal"));
    assert.doesNotMatch(internal, /\.select\(publicFields\)/);
  });
}
