# Estado da Nação 009

## O que foi implementado

Esta etapa transformou a memória em uma camada pública real do VR Abandonada.

- A rota `/memoria` deixou de ser uma página-placeholder e passou a funcionar como arquivo vivo.
- Foi criada uma tabela própria `memory_items` para memória pública leve.
- A experiência agora inclui destaques, recortes por coleção, timeline e ponte com pautas atuais.
- Cada item de memória ganhou página própria em `/memoria/[slug]`.
- O compartilhamento social da memória passou a ter imagem própria por item.

## Como a memória entrou na experiência pública

A memória agora aparece em três níveis:

- na landing principal, como promessa e porta de entrada;
- na rota `/memoria`, como arquivo navegável;
- no detalhe de cada item, como leitura conectada ao presente.

A proposta não é museu e nem catálogo frio. É um arquivo editorial que ajuda a entender a cidade em disputa.

## Como funciona a timeline leve

A timeline foi implementada como uma sequência curta de marcos editoriais.

- ela usa poucos eventos, com leitura rápida;
- cada marco carrega um ano ou faixa temporal;
- alguns marcos podem abrir um recorte específico em `/memoria/[slug]`;
- o objetivo é orientar o leitor, não enciclopediar o território.

## Como presente e arquivo foram conectados

A ponte entre passado e presente funciona com três vínculos:

- uma memória pode apontar para uma pauta editorial relacionada;
- uma memória pode apontar para uma série;
- a página de memória mostra um bloco "do arquivo para o presente".

Isso faz o leitor sair do recorte histórico e entrar em pauta, série e investigação atual.

## Limitações atuais

- O arquivo ainda é leve e curado, não um acervo volumoso.
- Não existe ingestão em massa de memória.
- Não há taxonomia complexa de arquivo.
- Não existe editor arquivístico avançado.
- Os recortes ainda dependem de curadoria em código, não de um painel específico.

## Próximos passos recomendados

- criar um pequeno painel interno para cadastrar memória sem misturar com pauta;
- permitir filtros mais ricos por período e território;
- começar a usar mais imagens históricas reais;
- ampliar a timeline quando houver mais marcos confiáveis;
- avaliar um bloco de busca leve apenas para memória, se o arquivo crescer.

## Validação

- `npm run typecheck` passou
- `npm run lint` passou sem warnings
- `npm run build` passou

## Arquivos principais

- `supabase/migrations/0007_memory_items.sql`
- `lib/memory/types.ts`
- `lib/memory/mock.ts`
- `lib/memory/queries.ts`
- `lib/memory/catalog.ts`
- `lib/memory/navigation.ts`
- `lib/memory/share.ts`
- `components/memory-card.tsx`
- `components/memory-timeline-entry.tsx`
- `components/memory-collection-card.tsx`
- `components/memory-bridge.tsx`
- `app/memoria/page.tsx`
- `app/memoria/[slug]/page.tsx`
- `app/memoria/[slug]/opengraph-image.tsx`
- `app/globals.css`
