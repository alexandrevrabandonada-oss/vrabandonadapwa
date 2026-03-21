# Estado da Nação 074

## Escopo
Este consolidado registra a etapa de transformação do interno em um verdadeiro modo operador, com foco em cockpit de trabalho, menos ruído e prioridade clara do que fazer agora.

## O que mudou
- O shell interno deixou de parecer uma extensão do site público e passou a operar como mesa de trabalho.
- A navegação interna foi reduzida ao núcleo útil do operador.
- A saída passou a ficar concentrada no shell, reduzindo redundância nas páginas internas.
- A central de entrada ganhou uma primeira dobra mais operacional.
- A fila de enriquecimento ficou mais nervosa, com priorização visual melhor.
- Os estados de conteúdo agora aparecem com contraste mais forte em entrada, fila e triagem.

## Nova navegação interna
O shell interno ficou com:
- `Entrada`
- `Enriquecer`
- `Intake`
- `Editorial`

E mantém núcleos organizados por:
- `Arquivo` - `Acervo`, `Memória`, `Edições`
- `Frentes` - `Dossiês`, `Campanhas`, `Impacto`
- `Contexto` - `Territórios`, `Atores`, `Eixos`, `Marcos`

A lógica de saída ficou concentrada no próprio shell, em vez de aparecer repetida em várias páginas.

## Primeira dobra da operação
### `/interno/entrada`
A central de entrada passou a abrir com:
- título mais curto e operador
- métricas rápidas de estado
- três portas de entrada logo cedo
- prioridade do momento em seguida
- formulário de entrada só quando o tipo é escolhido
- últimas entradas no fim da superfície principal

A porta rápida passou a mostrar o volume por tipo, reduzindo decisão na hora de subir conteúdo.

### `/interno/enriquecer`
A fila de enriquecimento passou a abrir com:
- resumo operacional curto
- snapshot de fila total, guardados e caminho aberto
- painel de prioridade com três colunas
- filtros logo abaixo
- lista viva da fila depois disso

Isso deixou a fila mais com cara de cockpit e menos com cara de página explicativa.

### `/interno/intake`
A triagem interna ficou mais curta na abertura e mais direta para revisão.

## Estados visuais
Os estados internos agora aparecem com diferenciação mais forte:
- `hot` para frio/urgente/guardado
- `watch` para pronto para enriquecer
- `calm` para resolvido/publicado/vinculado
- `muted` para arquivo

Essa lógica foi aplicada em:
- cartões de entrada
- cartões de enriquecimento
- itens do intake
- métricas e prioridades da central

## Fila prioritária
A fila passou a priorizar três blocos fixos:
- urgentes
- prontos para enriquecer
- publicados rápidos

Cada bloco mostra:
- status
- título
- resumo
- data
- território/ator
- ação seguinte

## Cards e microestrutura
- O cartão de entrada passou a mostrar o próximo gesto com mais clareza.
- O cartão de enriquecimento ganhou estado visual mais nítido.
- Os três tipos de entrada agora mostram quantidade por porta.
- O shell interno exibe um estado operacional explícito.

## Limites atuais
- Ainda há páginas internas profundas com CTAs contextuais próprios, porque elas também precisam continuar funcionais para o trabalho editorial.
- O shell já concentra a navegação principal, mas algumas superfícies detalhadas ainda podem ser podadas numa próxima rodada se o uso real pedir.
- A fila de prioridade é heurística simples por status e data, sem automação pesada.

## Próximos passos recomendados
- Fazer uma observação real de uso do shell interno por uma semana.
- Reduzir mais um pouco o peso de algumas páginas internas de detalhe, se elas ainda competirem com a operação.
- Refinar o painel de prioridade com mais sinais de tempo, se aparecerem gargalos reais.
- Consolidar os destinos editoriais mais usados no fluxo de enriquecimento.

## Verificação
- `npm run lint` passou sem warnings.
- `npm run typecheck` passou.
- `npm run build` passou.

## Veredito
O interno está mais perto de um cockpit do que de um site público. A operação ficou mais direta, os estados ficaram mais visíveis e a primeira dobra passou a comandar ação com mais clareza.
