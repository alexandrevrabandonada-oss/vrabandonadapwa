# Estado da Nação 006

## O que foi implementado

Esta etapa fortaleceu a experiência pública do VR Abandonada para que as pautas deixassem de parecer posts soltos e passassem a funcionar como um arquivo editorial navegável.

Entregas principais:
- taxonomia editorial mínima no schema e nos tipos
- suporte a séries editoriais
- cards públicos com capa, tag principal, tags secundárias e tempo de leitura
- hero editorial na listagem de pautas
- página de série em `/series/[slug]`
- página de pauta individual com relacionados e próxima leitura
- mocks editoriais mais ricos para demonstrar a navegação

## Como a taxonomia funciona

Cada item editorial agora carrega:
- `series_slug`
- `series_title`
- `primary_tag`
- `secondary_tags`
- `reading_time`
- `featured_order`
- `cover_variant`

A lógica é simples:
- a série agrupa a linha narrativa do conteúdo
- a tag principal ajuda na navegação por assunto
- as tags secundárias adicionam contexto leve
- o tempo de leitura dá ritmo ao arquivo
- a ordem de destaque organiza a vitrine pública
- a variante de capa mantém consistência visual quando não houver imagem

## Como a navegação pública foi fortalecida

### `/pautas`

A listagem pública passou a ter três camadas:
- destaque principal com linguagem de capa editorial
- blocos de séries com cards próprios
- grid de pautas recentes com cards compactos

Isso faz a página parecer uma plataforma editorial contínua, não um feed cronológico genérico.

### `/pautas/[slug]`

A página da pauta individual agora exibe:
- cabeçalho editorial com série, tag principal, leitura e data
- capa ou fallback visual de acordo com a variante editorial
- corpo da pauta
- blocos de relacionados
- próxima leitura sugerida

### `/series/[slug]`

A página de série agrupa a linha editorial e mostra:
- descrição da série
- quantidade de pautas
- cards dos itens vinculados
- link de volta ao arquivo geral

## Como funcionam as séries

As séries foram implementadas de forma enxuta:
- catálogo estático em `lib/editorial/taxonomy-data.ts`
- vínculo por `series_slug` e `series_title` no item editorial
- uso público em listagem, detalhe e página de série
- sugestão inicial de série a partir da categoria na criação do rascunho interno

Isso mantém a organização editorial sem exigir um CMS de taxonomia separado.

## Como funcionam os relacionados

A lógica de relacionados é simples e útil:
- prioriza itens da mesma série
- depois cruza tag principal e categoria
- ainda considera tags secundárias e território
- a página individual também sugere a próxima leitura na ordem editorial

O resultado é navegação por contexto, não só por ordem de publicação.

## Migrations

Novas migrations desta etapa:
- `supabase/migrations/0005_editorial_taxonomy.sql`

Ela adiciona:
- `series_slug`
- `series_title`
- `primary_tag`
- `secondary_tags`
- `reading_time`
- `featured_order`
- `cover_variant`

## Limitações atuais

- não existe busca avançada ainda
- não existe página de índice geral de séries ainda
- não existe sistema de mídia avançado para capas
- os relacionados são intencionais, mas ainda heurísticos
- o catálogo de séries ainda é fixo em código

## Riscos que permanecem

- a taxonomia precisa de disciplina editorial para não virar um conjunto de campos vazios
- os relacionamentos dependem da qualidade dos metadados preenchidos pelo editor
- o fallback visual resolve ausência de imagem, mas ainda não substitui uma biblioteca de capas real
- se a equipe publicar sem série ou tag principal, a navegação perde força

## Próximos passos recomendados

1. Criar uma página de índice de séries ou eixos para dar mais profundidade à navegação.
2. Evoluir a capa editorial com imagens reais e melhor tratamento de fallback.
3. Criar um bloco de “matérias em sequência” para séries longas.
4. Adicionar uma linha de tempo ou arquivo por ano quando houver volume suficiente.
5. Refinar os relacionados com mais sinais editoriais, sem complicar o sistema.
