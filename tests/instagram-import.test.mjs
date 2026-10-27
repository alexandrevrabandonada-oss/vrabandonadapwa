import test from "node:test";
import assert from "node:assert/strict";
import { postFromApi } from "../scripts/import-instagram.mjs";

test("aceita post com permalink e data", () => {
  const post = postFromApi({id:"1790000000000000000",caption:"Uma obra pública explicada",permalink:"https://www.instagram.com/p/ABC123/",timestamp:"2026-10-27T20:00:00+0000",media_type:"IMAGE"});
  assert.equal(post.id,"1790000000000000000");
  assert.equal(post.published_at,"2026-10-27T20:00:00.000Z");
});
test("não importa publicações sem legenda", () => {
  assert.equal(postFromApi({id:"1790000000000000000",caption:"",permalink:"https://www.instagram.com/p/ABC123/",timestamp:"2026-10-27T20:00:00Z"}),null);
});
test("rejeita link externo", () => {
  assert.equal(postFromApi({id:"1790000000000000000",caption:"Teste de post",permalink:"https://evil.test/fake",timestamp:"2026-10-27T20:00:00Z"}),null);
});
