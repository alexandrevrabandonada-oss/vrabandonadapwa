# Estado da Nação 010

## O que foi implementado

Este tijolo criou a operação interna da memória do VR Abandonada.

Entraram:
- painel interno em `/interno/memoria`
- criação em `/interno/memoria/novo`
- edição em `/interno/memoria/[id]`
- estados operacionais `draft`, `ready`, `published` e `archived`
- publicação e arquivamento sem mexer no código
- upload, substituição e remoção de capa para itens de memória
- coleções/recortes alimentadas por dados do banco em `memory_collections`
- timeline leve orientada por `timeline_rank`
- vínculo simples com pauta e série
- fallback editorial preservado quando não houver imagem real

## Como funciona o painel interno

O painel interno usa o mesmo modelo de proteção já existente no backoffice do projeto.

Fluxo:
- entrar em `/interno/entrar`
- acessar `/interno/memoria`
- filtrar por estado editorial
- criar item novo em `/interno/memoria/novo`
- editar item em `/interno/memoria/[id]`
- controlar publicação, destaque, arquivamento e capa

A tela de edição agora concentra a operação mínima necessária para alimentar a memória sem editar arquivos do projeto.

## Como a timeline e as coleções passaram a ser operadas

Antes, a memória dependia mais de catálogo curado em código.
Agora:
- `memory_collections` guarda os recortes editoriais
- `memory_items.collection_slug` e `collection_title` ligam o item ao recorte
- `timeline_rank` define a ordem da timeline pública
- `featured` reforça a abertura editorial e os destaques

Isso reduz a dependência de mock duro e permite operar a memória como conteúdo vivo.

## Como a memória se conecta às pautas e séries

A conexão continua leve:
- `related_editorial_slug` liga memória a uma pauta publicada
- `related_series_slug` liga memória a uma série editorial

Na prática, isso mantém a ponte entre arquivo e presente sem criar uma camada arquivística pesada.

## Mudanças de schema

Nova migration:
- `supabase/migrations/0008_memory_operations.sql`

Ela adiciona:
- `memory_collections`
- campos operacionais em `memory_items`
- bucket público `memory-covers`
- policies simples para leitura pública dos assets e operação por admin autenticado
- constraint para estados editoriais válidos

## Arquivos principais

- `app/interno/memoria/page.tsx`
- `app/interno/memoria/novo/page.tsx`
- `app/interno/memoria/[id]/page.tsx`
- `app/interno/memoria/actions.ts`
- `components/memory-form.tsx`
- `lib/memory/admin.ts`
- `lib/memory/queries.ts`
- `lib/memory/navigation.ts`
- `lib/memory/types.ts`
- `lib/memory/catalog.ts`
- `lib/memory/mock.ts`
- `lib/media/memory.ts`
- `next.config.ts`

## Limitações atuais

Ainda não existe:
- ingestão em massa
- importação de acervo externo
- busca avançada na memória
- taxonomia arquivística complexa
- workflow de revisão em múltiplas camadas

A operação continua leve por desenho.

## Observação de build

O `next build` neste ambiente Windows estava falhando com `spawn EPERM` durante a geração estática.
A correção foi reduzir a concorrência do build no `next.config.ts`:
- `cpus: 1`
- `workerThreads: false`
- `parallelServerBuildTraces: false`
- `webpackBuildWorker: false`

Depois disso, o build passou normalmente.

## Próximos passos recomendados

1. Alimentar a memória com conteúdo real pela interface interna.
2. Começar a substituir os mocks mais antigos por registros publicados.
3. Criar um caminho de revisão leve para recortes mais sensíveis.
4. Se necessário, adicionar importação manual de lotes pequenos de memória.
