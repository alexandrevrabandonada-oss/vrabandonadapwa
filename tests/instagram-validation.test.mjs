import test from "node:test";
import assert from "node:assert/strict";
import { validateInstagramPosts } from "../scripts/validate-instagram.mjs";

const post = {
  id: "1790000000000000000",
  caption: "Texto de uma publicação já divulgada no Instagram.",
  permalink: "https://www.instagram.com/p/CODEexemplo/",
  published_at: "2026-10-27T20:00:00.000Z",
  media_type: "IMAGE",
  local_image: "/instagram-media/1790000000000000000.jpg",
};

test("aceita índice vazio sem criar publicações falsas", () => {
  assert.deepEqual(validateInstagramPosts([]), []);
});
test("aceita postagem real normalizada", () => {
  assert.deepEqual(validateInstagramPosts([post]), []);
});
test("recusa duplicações de IDs", () => {
  assert.match(validateInstagramPosts([post,post]).join(" "), /duplicado/);
});
test("rejeita imagens externas e caminhos de arquivo arbitrários", () => {
  assert.match(validateInstagramPosts([{...post,local_image:"https://cdn.tld/a.jpg"}]).join(" "), /imagem inválido/);
  assert.match(validateInstagramPosts([{...post,local_image:"/instagram-media/other.jpg"}]).join(" "), /imagem inválido/);
});
test("recusa link não Instagram e legenda vazia", () => {
  assert.match(validateInstagramPosts([{...post,permalink:"https://evil.test/post"}]).join(" "), /permalink/);
  assert.match(validateInstagramPosts([{...post,caption:""}]).join(" "), /legenda/);
});
test("recusa registros com URL de imagem manipulada, formato de data inválido", () => {
  assert.match(validateInstagramPosts([{...post,published_at:"invalid"}]).join(" "), /data/);
  assert.match(validateInstagramPosts([{...post,id:"../../bad"}]).join(" "), /id inválido/);
});
