# Estado da Nação 012

## O que foi implementado

Esta etapa criou a primeira experiência pública de acervo do VR Abandonada.

Entraram:
- rota pública `/acervo`
- rota pública `/acervo/[id]`
- filtros simples por tipo, período, lugar e vínculo com memória
- cards editoriais para navegar pelos materiais do arquivo vivo
- blocos de destaque de acervo na listagem pública
- conexões explícitas entre acervo, memória e pauta
- fallback visual forte quando o material não é imagem
- dados de demonstração coerentes para a navegação inicial

## Como funciona `/acervo`

A página ` /acervo ` atua como porta de entrada do arquivo vivo.

Ela organiza a navegação em camadas:
- hero editorial com chamada de entrada
- destaque principal do acervo
- coleções leves por tipo de material
- filtros simples por tipo, ano, lugar e memória vinculada
- grid de resultados com cards do acervo
- bloco final ligando documento, memória e pauta

A listagem só exibe itens com `public_visibility = true`.

## Como funciona a página individual do asset

A rota `/acervo/[id]` mostra um item por vez, com foco documental.

A página exibe:
- título
- tipo de asset
- prévia visual ou fallback editorial
- descrição
- fonte/origem
- data aproximada
- lugar
- vínculos com memória, pauta e série quando existirem
- materiais próximos por tipo, lugar ou conexão de contexto

Se o asset for visual, a imagem aparece diretamente. Se não for, o layout mantém um fallback gráfico coerente com o projeto.

## Como os filtros simples funcionam

Os filtros são leves e não dependem de busca avançada.

É possível filtrar por:
- `asset_type`
- `approximate_year`
- `place_label`
- `memory_item_id`

Os filtros foram pensados para reduzir ruído e puxar o documento certo para a frente, sem transformar o acervo em catálogo pesado.

## Como o acervo se conecta a memória e pauta

A conexão é feita por referência direta nos registros:
- `memory_item_id`
- `editorial_item_id`

Na prática:
- o detalhe da memória mostra anexos do acervo ligados ao item
- o detalhe do acervo mostra a memória relacionada, quando existir
- a pauta relacionada aparece quando o asset aponta para um item editorial

Isso reforça a ideia de percurso entre documento, contexto e narrativa.

## Como os assets aparecem no público

No público, só aparecem assets marcados como públicos.

Regras seguidas:
- `public_visibility = true` é obrigatório
- campos operacionais internos não aparecem
- o bloco público mantém foco em leitura, contexto e lastro documental

Quando não há imagem real, o sistema usa o fallback editorial já existente no projeto.

## Limitações atuais

Ainda não existe:
- busca avançada no acervo
- OCR
- catálogo arquivístico completo
- ingestão em massa inteligente
- taxonomia documental profunda
- DAM complexo

O desenho segue propositalmente leve.

## Mudanças de schema e dados

Não houve nova migration nesta etapa.

A base continua usando:
- `public.archive_assets`
- bucket `archive-assets`
- RLS e policies já criadas no tijolo anterior

O que mudou agora foi a camada pública e os helpers de consulta/navegação.

## Arquivos principais

- `app/acervo/page.tsx`
- `app/acervo/[id]/page.tsx`
- `components/archive-asset-card.tsx`
- `lib/archive/navigation.ts`
- `lib/archive/queries.ts`
- `lib/archive/mock.ts`
- `lib/site.ts`
- `app/globals.css`
- `app/memoria/[slug]/page.tsx`

## Próximos passos recomendados

1. Alimentar o acervo com material real e revisar os metadados mais usados.
2. Criar uma curadoria leve por tipo de documento e período.
3. Quando houver volume, separar recortes mais finos por coleção temática.
4. Se a circulação crescer, adicionar imagem social própria para `/acervo/[id]`.
