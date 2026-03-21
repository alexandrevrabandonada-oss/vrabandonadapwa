# Estado da Nação 053

## Foco
Esta etapa refinou o VR Abandonada para uso cotidiano em rotina curta: bolso, deslocamento, intervalo de trabalho, leitura rápida e ação imediata.

## O que foi ajustado
- `Agora` ficou mais direta como tela de bolso, com ações de um minuto e acesso mais cedo ao que mudou.
- `Acompanhar` ficou mais operacional, priorizando frentes seguidas, últimas mudanças e atalhos de retorno.
- `Participe` ficou mais curto e mais orientado a gesto imediato.
- `Envie` ganhou um caminho de denúncia/pista rápida com modo leve via query string.
- `IntakeForm` passou a aceitar preenchimento rápido local e microcopy mais objetiva.

## Telas priorizadas
- `/agora`
- `/acompanhar`
- `/participe`
- `/envie`
- home, como ponto de retorno e ponte

## Como a rotina ficou mais útil
- O usuário vê mais cedo o que mudou.
- O usuário entra mais rápido na frente que acompanha.
- O usuário consegue mandar pista sem atravessar um formulário longo.
- O usuário encontra ações pequenas antes de chegar ao texto longo.
- O uso no celular fica mais voltado a decisão e menos a leitura preparatória.

## Fluxo de denúncia/pista rápida
O fluxo rápido foi concentrado em um caminho de baixo atrito:
- chamada curta do tipo `Vi algo agora`
- entrada em `modo=rapido`
- título e categoria pré-preenchidos
- foco em relato mínimo e envio direto

## Microações fortalecidas
- `Ver o que mudou`
- `Mandar pista`
- `Seguir esta frente`
- `Salvar para depois`
- `Retomar leitura`
- `Abrir edição do momento`
- `Abrir campanha ativa`
- `Ver em 1 minuto`

## O que foi reduzido
- texto antes da ação principal
- excesso de explicação nas telas de rotina
- atrito para denúncia rápida
- necessidade de varrer várias camadas antes de agir

## Limites desta etapa
- não há automação de envio
- não há login
- não há push
- não há fila de ações complexa
- o fluxo rápido continua dependente da estrutura pública já existente

## Build e estabilidade
- `npm run lint` passou
- `npm run typecheck` passou
- `npm run build` passou após estabilização do worker de build do Next no Windows

## Próximos passos recomendados
- revisar o texto curto de `Agora` e `Acompanhar` com uso real
- observar se o modo rápido de `Envie` cobre bem os casos cotidianos
- cortar ainda mais o que competir com a ação principal nas telas de rotina
- reavaliar se algum cartão pode ser reduzido sem perder utilidade
