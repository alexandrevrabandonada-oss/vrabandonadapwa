# Estado da Nação 061

A etapa 061 fecha o segundo passo da Central de Entrada Simplificada: transformar o que foi guardado em algo útil com menos retrabalho, menos digitação repetida e menos fricção mental.

## O que entrou

A central de entrada já existia em `/interno/entrada`. Nesta etapa, a operação ganhou uma fila de enriquecimento em `/interno/enriquecer`, com o papel de pegar entradas guardadas e empurrá-las para destinos mais profundos do ecossistema.

## Como a fila foi organizada

A fila mostra o conteúdo por estado e por tipo, com leitura curta e ações diretas.

Estados agora usados na entrada:
- `draft`
- `stored`
- `ready_for_enrichment`
- `enriched`
- `linked`
- `published`
- `archived`

Na prática, isso permite três movimentos:
- guardar agora sem decidir tudo
- marcar como pronto para enriquecer
- transformar em destino editorial sem repetir trabalho

## Ações rápidas disponíveis

Cada item da fila pode seguir por atalhos curtos para:
- transformar em memória
- transformar em acervo
- transformar em peça editorial
- vincular a dossiê
- vincular a campanha
- vincular a impacto
- vincular a edição
- guardar sem mudar

Também há acesso rápido para abrir a entrada original e revisar o conteúdo bruto antes do destino final.

## Como o pré-preenchimento funciona

A etapa 2 usa os campos já capturados na Central de Entrada para reduzir cópia e colagem.

Os destinos de memória, acervo, dossiê, campanha, impacto e edição recebem, quando possível:
- título
- slug
- resumo
- descrição
- fonte
- ano
- território
- lugar
- ator
- eixo
- imagem ou arquivo

O ganho real está em não exigir que a classificação final seja decidida no momento da entrada. O material entra leve e depois já aparece parcialmente moldado para o destino certo.

## Como a central conversa com a etapa 2

A rota `/interno/entrada` continua sendo a porta única para subir conteúdo rápido.

A partir dela, o conteúdo pode:
- ficar guardado
- ser enviado para a fila de enriquecimento
- abrir a fila de revisão
- abrir um destino editorial específico com pré-preenchimento

Isso deixa claro que a entrada e o enriquecimento são duas fases separadas:
- fase 1: guardar o mínimo
- fase 2: transformar com menos esforço

## Fluxos por tipo

### Post do dia
Tende a virar Agora, editorial, campanha, impacto ou dossiê.

### Documento / artigo / PDF
Tende a virar acervo, depois memória, padrão, território, ator ou dossiê.

### Foto histórica / imagem de acervo
Tende a virar acervo, memória, território ou linha do tempo.

## Limitações atuais

- A fila ainda depende de revisão humana para escolher o melhor destino final.
- O enriquecimento acelera muito, mas não automatiza a curadoria.
- A criação de peça editorial derivada ainda é um rascunho inicial, não um fluxo totalmente finalizado.
- Alguns destinos ainda exigem revisão manual depois do pré-preenchimento.

## O que ficou bom para operar

- entrada rápida sem travar a cabeça
- fila curta e legível para destravar conteúdo parado
- pré-preenchimento suficiente para economizar tempo real
- dois passos claros: entrar e depois enriquecer
- menos risco de acumular entrada sem transformação

## Próximos passos recomendados

- usar a fila por alguns dias reais para ver quais destinos aparecem mais
- simplificar ainda mais a criação editorial derivada, se a equipe sentir necessidade
- observar se memória e acervo são de fato os destinos-base mais usados
- avaliar se vale um bloco de revisão ainda mais curto para entradas muito antigas
- manter a fila pequena o suficiente para não virar depósito

## Veredito

A etapa 2 ficou leve o bastante para ser usada. A central agora não só recebe conteúdo: ela também mostra um caminho curto para transformar o que entrou em algo útil do ecossistema.
