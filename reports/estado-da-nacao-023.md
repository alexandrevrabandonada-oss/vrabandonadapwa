# Estado da Nação 023

## O que foi implementado

A camada pública de impacto foi criada para registrar consequências observadas do trabalho do VR Abandonada. Ela fecha melhor o ciclo entre investigação, participação, campanha e efeito público sem virar dashboard frio.

Entraram:
- rota pública `/impacto`
- rota pública `/impacto/[slug]`
- área interna `/interno/impacto`
- criação e edição interna de impactos
- vínculos entre impacto e pauta, dossiê, eixo, memória, acervo, coleção, campanha e participação
- bloco de impacto na home
- impacto como seção do radar em `/agora`
- metadados sociais para a página individual
- relatório editorial desta etapa

## Modelagem

A camada de dados usa a tabela `public_impacts` e a tabela relacional `public_impact_links`.

Campos principais do impacto:
- `title`
- `slug`
- `excerpt`
- `description`
- `impact_type`
- `status`
- `date_label`
- `happened_at`
- `territory_label`
- `cover_image_url`
- `featured`
- `public_visibility`
- `sort_order`

Estados públicos:
- `observed`
- `partial`
- `ongoing`
- `consolidated`
- `disputed`
- `archived`

Tipos de impacto:
- `correction`
- `response`
- `mobilization`
- `document`
- `archive_growth`
- `public_pressure`
- `media_echo`
- `institutional_move`
- `continuity`

Papéis dos vínculos:
- `lead`
- `evidence`
- `context`
- `followup`
- `archive`

## Como ficou `/impacto`

A listagem pública virou uma página editorial de prestação pública viva.

Ela mostra:
- impacto em destaque
- resultados em andamento
- impactos observados ou parciais
- impactos consolidados, disputados ou arquivados
- blocos que explicam o que mudou e o que ainda está em aberto

A página usa curadoria leve baseada em status, destaque e data. Ela não apresenta cronologia bruta nem métrica vazia.

## Como ficou `/impacto/[slug]`

A página individual funciona como leitura de consequência pública.

Ela mostra:
- abertura forte
- status narrativo do impacto
- peça de entrada principal
- bloco do que mudou
- bloco de respostas e reações
- bloco do que ainda está em aberto
- bloco de arquivo e memória
- impactos relacionados
- CTA para continuar no radar, nas campanhas, nos dossiês e na participação

A página também ganhou imagem social programática e metadados próprios.

## Como a camada conversa com campanha, dossiê, radar e participação

O impacto não nasce isolado.

Ele aponta para:
- campanhas que puxaram foco público
- dossiês que organizam o caso
- eixos que estruturam o tema maior
- memória e acervo que sustentam a leitura do presente
- participação e método para quem quer continuar a colaborar

No radar, o impacto entrou como seção própria de consequência já observada.
Na home, entrou como bloco curto de "o que já mudou".

## Como ficou a área interna

A área interna permite:
- listar impactos
- criar impacto
- editar dados centrais
- controlar visibilidade e destaque
- vincular peças relacionadas
- ordenar a leitura editorial

O fluxo interno foi mantido sóbrio e operacional, sem virar CMS pesado.

## Limitações atuais

- Não existe auditoria específica de impacto ainda.
- Não existe trilha pública individual de atualização por impacto.
- A consequência pública ainda depende de curadoria manual.
- Não existe automação de confirmação causal.
- O painel interno ainda é leve e não cobre workflows complexos.

## Próximos passos recomendados

1. Criar updates leves de impacto, se o projeto precisar mostrar evolução contínua de uma consequência.
2. Adicionar auditoria mínima para saber quem alterou cada item de impacto.
3. Permitir destacar um impacto principal automaticamente quando houver campanha ativa.
4. Refinar a leitura pública com mais material vinculado por tipo de consequência.
5. Revisar a estratégia de curadoria para evitar duplicidade entre campanha, impacto e dossiê.
