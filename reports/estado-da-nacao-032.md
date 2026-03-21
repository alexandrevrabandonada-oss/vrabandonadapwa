# Estado da Nação 032

## O que foi implementado

Foi criada uma camada pública de busca transversal em `/buscar`, com índice editorial construído a partir das camadas públicas já existentes do VR Abandonada. A busca agora atravessa pautas, memória, acervo, coleções, dossiês, campanhas, impactos, eixos, territórios, atores, padrões, edições, séries, rotas de entrada e participação.

Também foi criada uma área interna mínima em `/interno/busca` para diagnosticar o índice público e verificar contagens por tipo e termos editoriais frequentes.

## Como funciona a modelagem de busca

A busca não ganhou uma tabela própria. A decisão foi manter a camada derivada do conteúdo público já publicado, evitando índice duplicado ou um motor separado sem necessidade.

A implementação ficou em:
- `lib/search/types.ts`
- `lib/search/navigation.ts`
- `lib/search/index.ts`

O índice público monta uma lista unificada de peças com:
- `contentType`
- `contentKey`
- `title`
- `excerpt`
- `href`
- `kindLabel`
- `labels`
- `territoryLabel`
- `actorLabel`
- `updatedAt`
- `featured`
- `searchableText`
- `saveKind`
- `followKind`

A relevância é simples e editorial:
- match exato em título pesa mais
- match em slug ou começo do título pesa forte
- labels e excerpt contam bem
- conteúdo destacado recebe bônus
- recência ajuda, sem dominar tudo

## Como ficou `/buscar`

A página pública em [`/buscar`](C:/Projetos/VR%20Abandonada/app/buscar/page.tsx) funciona como porta de entrada transversal do ecossistema.

Ela reúne:
- campo de busca principal
- filtros por tipo
- filtros por território
- filtros por ator
- ordenação por relevância ou recência
- buscas frequentes/editoriais
- resultados em cards
- estado vazio útil
- bloco de destaque com o melhor resultado encontrado
- ponte para salvar e acompanhar

A experiência foi desenhada para funcionar bem no celular e não parecer um motor de busca técnico.

## Como os filtros e estados vazios funcionam

Os filtros são leves e editoriais:
- tipo de conteúdo
- território
- ator
- ordenação

Quando não há resultado, a página não quebra a leitura. Ela oferece:
- volta para o radar
- ponte para acompanhar frentes
- retorno para os guias de entrada

Também há termos frequentes para quem ainda não sabe exatamente o que buscar.

## Como a busca conversa com `salvos` e `acompanhar`

A busca foi desenhada para não terminar em si mesma.

Ela conversa com:
- [`/salvos`](C:/Projetos/VR%20Abandonada/app/salvos/page.tsx), porque um resultado pode ser guardado para leitura posterior
- [`/acompanhar`](C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx), porque um resultado pode virar frente seguida no aparelho
- [`/agora`](C:/Projetos/VR%20Abandonada/app/agora/page.tsx), porque o radar continua sendo o pulso do momento

A diferença entre salvar e acompanhar continua preservada:
- salvar = guardar uma leitura específica
- acompanhar = manter uma frente viva no dispositivo

## Como ficou a integração com navegação e home

A busca foi exposta em pontos estratégicos:
- header principal em [`components/site-header.tsx`](C:/Projetos/VR%20Abandonada/components/site-header.tsx)
- navegação pública em [`lib/site.ts`](C:/Projetos/VR%20Abandonada/lib/site.ts)
- home, via CTA principal para buscar na cidade
- radar, com CTA para buscar
- acompanhar, com CTA para buscar

Isso faz a busca virar uma porta real do produto, não um link escondido.

## Como ficou a área interna de busca

A página interna em [`/interno/busca`](C:/Projetos/VR%20Abandonada/app/interno/busca/page.tsx) funciona como diagnóstico simples do índice público.

Ela mostra:
- total de itens indexados
- quantidade de tipos ativos
- termos editoriais frequentes
- distribuição por tipo

Não há reindexação manual, porque o índice é derivado automaticamente do conteúdo público já publicado.

## Limitações atuais

- Não há busca vetorial.
- Não há autocomplete avançado.
- Não há análise de intenção nem recomendação por IA.
- Não há indexação incremental separada.
- Não há busca por documentos internos ou conteúdo de intake.
- Os filtros ainda são simples e não substituem uma taxonomia formal.

## Próximos passos recomendados

1. destacar sugestões de busca na home e no radar com base em campanhas ou frentes ativas.
2. criar um autocomplete leve com termos editoriais e nomes próprios mais recorrentes.
3. permitir abrir a busca já pré-filtrada a partir de território, ator, dossiê ou campanha.
4. acompanhar quais termos o público usa mais e, só depois, pensar em refinamentos de relevância.
