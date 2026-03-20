# Estado da Nação 018

## O que foi implementado

- Criei a camada pública `Agora` em [`/agora`](C:/Projetos/VR%20Abandonada/app/agora/page.tsx) como radar vivo do projeto.
- Conectei a home principal a um bloco curto de pulso editorial em [`app/page.tsx`](C:/Projetos/VR%20Abandonada/app/page.tsx).
- Centralizei a agregação editorial em [`lib/radar/queries.ts`](C:/Projetos/VR%20Abandonada/lib/radar/queries.ts).
- Adicionei o card compartilhado de radar em [`components/radar-item-card.tsx`](C:/Projetos/VR%20Abandonada/components/radar-item-card.tsx).
- Atualizei a navegação pública com `Agora` em [`lib/site.ts`](C:/Projetos/VR%20Abandonada/lib/site.ts).

## Como funciona o radar

O radar não cria uma nova tabela. Ele reaproveita o que já existe:

- updates publicados de dossiês
- pautas recentes ou em destaque
- dossiês em curso
- eixos temáticos com movimentação
- memória e acervo em evidência
- chamadas públicas para envio de material

A curadoria vem de:

- `featured`
- `sort_order`
- `published_at`
- `updated_at`
- status públicos já existentes

Isso mantém a operação leve e evita um CMS novo só para ritmo.

## Como a agregação foi resolvida

- Atualizações de dossiê aparecem em `O que mudou`.
- Chamadas públicas aparecem em uma seção própria.
- Dossiês em andamento aparecem em `Em curso agora`.
- Eixos aparecem em `Frentes quentes`.
- Memória e acervo entram em `Do arquivo ao presente`.
- Pautas recentes entram junto do bloco de mudanças, sem virar feed separado.

## Como a home passou a mostrar o agora

A home ganhou um bloco curto com 3 itens do radar:

- um sinal de atualização recente
- um caso em andamento
- uma frente temática quente

O objetivo é estimular retorno recorrente sem transformar a landing num painel lotado.

## Como o radar conversa com dossiês e eixos

- O radar puxa a última movimentação dos dossiês.
- Ele também lê os eixos ativos/monitorados.
- Chamadas públicas apontam para `/envie`.
- O bloco de continuidade encaminha o usuário para `/dossies`, `/eixos`, `/memoria` e `/acervo`.

## Limitações atuais

- Ainda não existe curadoria manual exclusiva do radar.
- Ainda não há pinagem independente por item de pulso.
- Ainda não há agenda, alerta ou notificação.
- Ainda não existe histórico específico do radar separado das camadas de origem.

## Próximos passos recomendados

1. Criar pinagem leve para 1 ou 2 itens do radar, se a operação pedir.
2. Tornar a faixa `Agora` ainda mais personalizada para retorno na PWA.
3. Adicionar uma visão interna simples de curadoria do pulso, só se os sinais começarem a competir entre si.
4. Avaliar uma notificação push futura apenas quando houver utilidade editorial real.
