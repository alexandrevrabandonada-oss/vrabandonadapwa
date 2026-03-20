# Estado da Nação 016

## O que foi implementado
- Criei a camada `investigation_dossier_updates` para registrar andamento, evidência, monitoramento, nota, convocação e correção.
- Adicionei tipos, labels e mocks de updates em `lib/dossiers/types.ts`, `lib/dossiers/updates.ts` e `lib/dossiers/mock.ts`.
- Estruturei a área interna de updates em:
  - `/interno/dossies/[id]/updates`
  - `/interno/dossies/[id]/updates/[updateId]`
- Atualizei a leitura pública e a home para mostrar a última movimentação de cada dossiê.
- Reforcei a página pública do dossiê com:
  - update em destaque
  - bloco “o que mudou”
  - bloco “próximos passos”
  - convocação pública para envio de pista, documento ou relato

## Como funcionam os updates
- Cada update pertence a um dossiê.
- O update tem tipo editorial leve:
  - `development`
  - `evidence`
  - `monitoring`
  - `note`
  - `call`
  - `correction`
- O update pode ser publicado ou mantido em rascunho.
- A área pública só lê updates explicitamente publicados.
- O `published_at` é preservado quando o update volta para rascunho, para não perder a trilha editorial.

## Como o dossiê ficou mais vivo
- A página pública deixou de ser só uma reunião de peças.
- Agora ela mostra:
  - a peça central
  - a timeline leve do caso
  - a última atualização
  - o que mudou recentemente
  - o que ainda está em aberto
  - uma chamada pública responsável para novas pistas
- A home e a listagem de dossiês também passaram a mostrar a última movimentação da investigação.

## Como ficou a operação interna
- A página do dossiê interno ganhou atalho para gerir updates.
- A área de updates permite criar e editar entradas com:
  - título
  - slug opcional
  - resumo
  - corpo
  - tipo
  - publicação
  - destaque
  - ordenação
- A edição continua simples e editorial, sem workflow pesado.

## Como a convocação pública funciona
- O dossiê agora tem um bloco de chamada pública com três saídas claras:
  - enviar pista ou documento
  - abrir o acervo
  - acompanhar as pautas
- A chamada mantém o tom responsável do projeto e não vira CTA agressivo.

## Limitações atuais
- Não existe ainda rota pública individual para cada update.
- Não existe workflow de revisão com múltiplas etapas.
- Não existe notificação, comentários nem automação.
- Updates ainda dependem da curadoria interna para ganhar forma editorial.

## Próximos passos recomendados
- Decidir se vale criar rota pública individual para updates, caso o volume cresça.
- Adicionar trilha de auditoria específica para updates, se o ritmo editorial aumentar.
- Permitir vínculo de update com uma peça de pauta, memória ou acervo quando fizer sentido.
- Criar uma pequena ordenação manual do bloco de updates em destaque por dossiê.
