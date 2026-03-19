# Estado da Nação 007

## O que foi implementado

Esta etapa criou a primeira camada sólida de mídia editorial para o VR Abandonada.

- A capa de item editorial agora pode vir de upload real, URL externa ou fallback visual.
- O painel interno ganhou upload, substituição e remoção de capa.
- O projeto passou a ter bucket dedicado para capas editoriais no Supabase Storage.
- As páginas públicas receberam metadados sociais melhores.
- Foram criadas imagens OG programáticas para home, pauta e série.
- Os mocks públicos agora demonstram item com capa real, item sem capa e série com identidade visual própria.

## Como funciona o upload e o vínculo da capa

O vínculo de mídia ficou simples:

- o formulário interno envia `cover_image_file`, `cover_image_url` e `cover_image_clear`;
- a action interna decide se deve fazer upload, substituir, remover ou manter a capa;
- quando o arquivo sobe para o Supabase Storage, o item passa a guardar:
  - `cover_image_url`
  - `cover_image_path`
- quando a imagem vem só por URL, `cover_image_path` fica nulo;
- quando a capa é removida, os dois campos são limpos.

A convenção de storage ficou concentrada no bucket `editorial-covers`.

## Como os fallbacks foram refinados

Quando não existe imagem real, o projeto usa fallback editorial com cara própria:

- variante visual da capa (`steel`, `ember`, `concrete`, `night`);
- bloco tipográfico forte;
- identidade coerente em cards, detalhe e série;
- a experiência não depende de imagem para parecer completa.

Isso evita que a pauta ou série vire um bloco vazio quando não há asset disponível.

## Como funciona o share / Open Graph

Foram criadas imagens programáticas para compartilhamento:

- `/opengraph-image`
- `/pautas/[slug]/opengraph-image`
- `/series/[slug]/opengraph-image`

Essas imagens servem como fallback ou imagem social principal para WhatsApp, X, Facebook e outras superfícies. Elas usam uma composição editorial com contraste alto, tipografia grande e linhas de cor compatíveis com o projeto.

Também foram ajustados os metadados de:

- home
- pauta individual
- série

## Limitações que permanecem

- Ainda não há editor de imagem.
- Ainda não há crop, corte ou ajuste fino de proporção.
- Ainda não há biblioteca de mídia nem fluxo de múltiplos assets.
- As séries ainda usam imagem estática simples para demonstração.
- Não existe automação de distribuição social.

## Próximos passos recomendados

- ligar uma galeria interna mínima para escolher capas já enviadas;
- começar a usar imagem real em séries importantes;
- criar uma convenção editorial para proporção e enquadramento;
- adicionar validação de tamanho/peso de arquivo;
- revisar a experiência de compartilhamento com imagens reais publicadas.

## Validação

- `npm run typecheck` passou
- `npm run lint` passou sem warnings
- `npm run build` passou

## Arquivos-chave

- `supabase/migrations/0006_editorial_media.sql`
- `lib/media/editorial.ts`
- `components/editorial-share-image.tsx`
- `app/opengraph-image.tsx`
- `app/pautas/[slug]/opengraph-image.tsx`
- `app/series/[slug]/opengraph-image.tsx`
- `components/editorial-form.tsx`
- `app/interno/editorial/actions.ts`
- `app/pautas/page.tsx`
- `app/pautas/[slug]/page.tsx`
- `app/series/[slug]/page.tsx`
