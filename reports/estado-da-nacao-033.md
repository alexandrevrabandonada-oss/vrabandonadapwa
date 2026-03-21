# Estado da Nação 033

## O que foi implementado

- Criei a camada pública de cronologia transversal em [`/linha-do-tempo`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/page.tsx).
- Criei a rota individual de marco temporal em [`/linha-do-tempo/[contentType]/[contentKey]`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/%5BcontentType%5D/%5BcontentKey%5D/page.tsx).
- Criei a área interna de diagnóstico em [`/interno/cronologia`](/C:/Projetos/VR%20Abandonada/app/interno/cronologia/page.tsx).
- Integrei a cronologia ao header/nav, à home, à busca e ao fluxo de acompanhamento.

## Como funciona a modelagem

- A cronologia não criou tabela nova.
- Ela é um índice derivado das camadas públicas já existentes.
- O arquivo central é [`lib/timeline/queries.ts`](/C:/Projetos/VR%20Abandonada/lib/timeline/queries.ts).
- Os itens da linha do tempo são montados a partir de:
  - pautas
  - memória
  - acervo e coleções
  - dossiês e updates
  - campanhas
  - impactos
  - eixos
  - territórios
  - atores
  - padrões
  - edições
  - séries
  - rotas de entrada
  - participação

## Como a cronologia foi curada

- Cada entrada ganha uma data de leitura, um período editorial e um grau de lastro temporal.
- A cronologia diferencia:
  - `historical`
  - `approximate`
  - `editorial`
  - `operational`
  - `unknown`
- A ordenação editorial pode ser cronológica ou por recência.
- Dossiês usam o rastro das atualizações públicas para mostrar que o caso continua em movimento.

## Como ficou `/linha-do-tempo`

- A página pública abre com hero forte e foco em leitura temporal.
- Há filtros por:
  - termo livre
  - tipo de peça
  - território
  - ator
  - período
  - ordem
- Há marcos em destaque.
- Há agrupamento por período.
- Há atalhos para salvar, acompanhar, buscar e voltar ao radar.
- A cronologia não virou arquivo morto nem timeline infinita.

## Como ficou `/linha-do-tempo/[contentType]/[contentKey]`

- A página individual mostra o marco temporal com mais contexto.
- Ela reforça:
  - tipo de conteúdo
  - período
  - lastro temporal
  - relevância editorial
- Quando o marco é um dossiê, a página também expõe as atualizações públicas ligadas a ele.
- A leitura individual termina com conexões próximas e saídas claras para continuar navegando.

## Como a cronologia conversa com outras camadas

- A busca em [`/buscar`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx) ganhou atalho para a linha do tempo.
- Os cards de resultado também podem abrir o percurso temporal do item encontrado.
- O header público ganhou a entrada direta para a cronologia.
- A home ganhou o atalho de instalação/retorno com link para a cronologia via navegação principal.
- O painel de acompanhamento continua sendo a ponte para voltar às frentes vivas.

## Como ficaram filtros e recortes

- Os filtros principais são leves e editoriais.
- O recorte temporal foi dividido em períodos históricos simples para ajudar leitura rápida:
  - origens
  - formação
  - reconfiguração
  - presente
  - agora
  - sem data forte
- O painel interno de cronologia ajuda a localizar itens com lastro fraco e itens prontos para leitura recorrente.

## Como a home aponta essa camada

- A navegação global passou a incluir `Linha do tempo`.
- O hero da home também aponta para a cronologia.
- Isso transforma o tempo em uma porta de entrada real do site, não em um detalhe escondido.

## Limitações atuais

- A cronologia ainda não tem uma tabela curada própria para marcos editoriais especiais.
- Não existe uma timeline visual com eixo vertical sofisticado.
- Não existe recorte temporal geográfico avançado.
- A camada ainda depende da qualidade dos dados já publicados em cada área.

## Próximos passos recomendados

- Criar uma seleção editorial de marcos temporais realmente centrais, acima do índice derivado.
- Adicionar uma visualização visual mais explícita por época, ruptura e consequência.
- Ligar a cronologia a uma versão compartilhável da edição do momento.
- Refinar o diagnóstico interno de lastro temporal com mais critérios de revisão.
