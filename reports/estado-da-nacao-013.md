# Estado da Nação 013

## O que foi implementado

Esta etapa criou a primeira camada de curadoria pública do acervo do VR Abandonada.

Entraram:
- coleções temáticas de acervo
- modelagem leve em `archive_collections`
- vínculo simples de asset com coleção por `collection_slug`
- rota pública `/acervo/colecoes/[slug]`
- home do acervo mais curada, com coleções em destaque
- área interna mínima de coleções
- criação e edição de coleção em backoffice
- filtro interno por coleção
- ligação do asset com a coleção no formulário interno
- conexão pública entre coleção, memória e pauta

## Como funciona a modelagem de coleções

A coleção foi mantida simples de propósito.

Tabela nova:
- `public.archive_collections`

Campos principais:
- `title`
- `slug`
- `excerpt`
- `description`
- `cover_image_url`
- `public_visibility`
- `featured`
- `sort_order`

O vínculo com os assets acontece por:
- `public.archive_assets.collection_slug`

Isso evita uma estrutura relacional mais pesada neste estágio e mantém a edição operacional simples.

## Como ficou a home do acervo

A página `/acervo` agora abre com uma camada de curadoria antes da grade de itens.

Blocos principais:
- hero de entrada
- coleções curadas em destaque
- introdução do acervo
- coleções leves por tipo de material
- filtros simples por tipo, período, lugar e memória
- resultados consultáveis
- bloco final ligando documento, memória e pauta

A home deixou de parecer apenas uma listagem e passou a funcionar como porta de entrada para dossiês leves.

## Como funciona a página pública da coleção

A rota `/acervo/colecoes/[slug]` apresenta a coleção como recorte editorial.

Ela mostra:
- abertura da coleção
- capa editorial da coleção
- resumo e contexto
- materiais vinculados à coleção
- memórias relacionadas
- pautas relacionadas
- série ou recorte maior quando existe
- material em destaque dentro da própria coleção

A coleção não é catálogo frio. Ela é uma trilha de leitura.

## Como assets, memória e pauta se conectam na coleção

A conexão acontece em três camadas:
- o asset pode apontar para uma memória por `memory_item_id`
- o asset pode apontar para uma pauta por `editorial_item_id`
- o asset pode apontar para uma coleção por `collection_slug`

Na prática:
- a coleção pública lista os assets que compartilham o mesmo `collection_slug`
- a página da coleção puxa memórias e pautas do mesmo eixo
- o detalhe do asset mostra sua coleção conectada
- o backoffice do asset permite escolher a coleção sem tocar no código

## Como ficou a área interna de coleções

Entraram três rotas internas:
- `/interno/acervo/colecoes`
- `/interno/acervo/colecoes/novo`
- `/interno/acervo/colecoes/[id]`

Elas permitem:
- listar coleções
- criar coleção
- editar coleção
- controlar visibilidade pública
- marcar destaque
- acompanhar os assets ligados ao recorte

O vínculo dos assets continua sendo feito de forma simples no cadastro de anexo, pelo campo de coleção.

## Mudanças de schema

Nova migration:
- `supabase/migrations/0010_archive_collections.sql`

Ela cria:
- `public.archive_collections`
- índice para `archive_assets.collection_slug`
- foreign key leve de `archive_assets.collection_slug` para `archive_collections.slug`
- RLS e policies para leitura pública controlada e gestão autenticada

## Arquivos principais

- `supabase/migrations/0010_archive_collections.sql`
- `lib/archive/types.ts`
- `lib/archive/mock.ts`
- `lib/archive/collections.ts`
- `lib/archive/queries.ts`
- `lib/archive/navigation.ts`
- `components/archive-collection-card.tsx`
- `components/archive-collection-form.tsx`
- `components/archive-asset-card.tsx`
- `components/archive-asset-form.tsx`
- `app/acervo/page.tsx`
- `app/acervo/[id]/page.tsx`
- `app/acervo/colecoes/[slug]/page.tsx`
- `app/interno/acervo/page.tsx`
- `app/interno/acervo/novo/page.tsx`
- `app/interno/acervo/[id]/page.tsx`
- `app/interno/acervo/colecoes/page.tsx`
- `app/interno/acervo/colecoes/novo/page.tsx`
- `app/interno/acervo/colecoes/[id]/page.tsx`
- `app/interno/acervo/colecoes/actions.ts`
- `app/globals.css`

## Limitações atuais

Ainda não existe:
- coleção com relação N:N
- busca avançada no acervo
- recortes automáticos por sistema editorial
- taxonomia arquivística pesada
- ingestão em massa inteligente
- OCR

A curadoria ainda depende de operação humana, e isso é intencional.

## Próximos passos recomendados

1. Alimentar as coleções com alguns assets reais por eixo.
2. Criar uma seção curada de “coleção em curso” na home principal.
3. Quando o volume crescer, introduzir filtros por coleção no público.
4. Se a operação pedir, separar melhor memória, acervo e pauta por linhas de curadoria mais finas.
