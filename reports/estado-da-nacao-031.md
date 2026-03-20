# Estado da Nação 031

## O que entrou

Esta etapa criou a camada local de **seguir / acompanhar** para o PWA do VR Abandonada. O objetivo foi transformar retorno recorrente em algo mais útil do que salvar uma leitura solta: agora o usuário pode marcar frentes, casos, territórios, atores, eixos e campanhas para voltar a elas com continuidade.

## Como funciona

A implementação ficou totalmente local, sem login público, sem nuvem e sem push notification.

- `Salvar` continua guardando peças individuais para leitura posterior em [`/salvos`](C:/Projetos/VR%20Abandonada/app/salvos/page.tsx).
- `Seguir` passa a marcar frentes editoriais que continuam vivas no aparelho.
- O estado de seguir usa armazenamento local em [`lib/pwa/follows.ts`](C:/Projetos/VR%20Abandonada/lib/pwa/follows.ts).
- O botão de seguir foi incorporado às páginas de [`/eixos/[slug]`](C:/Projetos/VR%20Abandonada/app/eixos/%5Bslug%5D/page.tsx), [`/territorios/[slug]`](C:/Projetos/VR%20Abandonada/app/territorios/%5Bslug%5D/page.tsx), [`/atores/[slug]`](C:/Projetos/VR%20Abandonada/app/atores/%5Bslug%5D/page.tsx), [`/dossies/[slug]`](C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx), [`/campanhas/[slug]`](C:/Projetos/VR%20Abandonada/app/campanhas/%5Bslug%5D/page.tsx) e [`/edicoes/[slug]`](C:/Projetos/VR%20Abandonada/app/edicoes/%5Bslug%5D/page.tsx).

## A nova área

A nova superfície pública/local é [`/acompanhar`](C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx).

Ela funciona como painel de retorno recorrente do PWA e junta:

- frentes seguidas no aparelho
- resumo do que cada frente representa
- sinal público mais recente disponível
- atalhos para abrir a peça original ou voltar ao radar
- blocos de sugestão para começar a seguir

## Diferença entre seguir e salvar

A diferença agora ficou explícita na UX:

- `Salvar` = guardar uma leitura específica para voltar depois.
- `Seguir` = acompanhar uma frente editorial ao longo do tempo.

A página de salvos reforça essa distinção em [`/salvos`](C:/Projetos/VR%20Abandonada/app/salvos/page.tsx) e aponta para [`/acompanhar`](C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx).

## Relação com home e radar

A home ganhou uma ponte curta para retorno recorrente em [`app/page.tsx`](C:/Projetos/VR%20Abandonada/app/page.tsx).

O radar em [`/agora`](C:/Projetos/VR%20Abandonada/app/agora/page.tsx) também passou a apontar para a camada de acompanhamento, para que o usuário não precise decidir entre ler o presente e organizar o que quer acompanhar.

A navegação pública foi atualizada em [`lib/site.ts`](C:/Projetos/VR%20Abandonada/lib/site.ts).

## UX mobile

A experiência foi desenhada para o celular:

- um toque para seguir
- um painel local para acompanhar
- um CTA claro para salvos
- um CTA claro para radar
- sem onboarding pesado
- sem aparência de rede social

## Limitações atuais

- Não existe sincronização entre aparelhos.
- Não existe login público.
- Não existe push notification.
- O acompanhamento ainda depende de conteúdos públicos já publicados, sem recomendação automática complexa.
- O painel mostra a frente seguida e o último sinal público disponível, mas não cria um feed personalizado pesado.

## Próximos passos recomendados

1. Amarrar melhor a camada de acompanhar ao primeiro uso da PWA, sugerindo frentes iniciais.
2. Tornar alguns sinais de acompanhamento ainda mais explícitos no radar quando houver mobilização ativa.
3. Se fizer sentido editorial, preparar uma pequena curadoria de frentes recomendadas por território, eixo e dossiê.
