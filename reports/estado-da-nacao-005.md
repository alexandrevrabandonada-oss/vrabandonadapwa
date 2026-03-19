# Estado da Nação 005

## O que foi implementado

Esta etapa adicionou governança editorial mínima ao pipeline do VR Abandonada.

Entregas principais:
- tabela `public.editorial_audit_log` para registrar eventos editoriais
- novos campos de governança em `public.editorial_items`
- estados editoriais mais claros, incluindo `in_review`
- checklist de publicação obrigatório antes de publicar
- histórico visível na área interna do item editorial
- separação reforçada entre leitura pública e trilha interna

## Como a trilha de auditoria funciona

Cada ação relevante agora pode gerar um evento no histórico editorial:
- `draft_created`
- `content_updated`
- `sent_to_review`
- `returned_to_draft`
- `published`
- `unpublished`
- `archived`

O log guarda:
- quem executou a ação
- o status anterior
- o status novo
- uma nota curta
- a data do evento

Esse histórico aparece em `/interno/editorial/[id]` para consulta rápida da equipe.

## Campos de governança adicionados

A camada editorial passou a guardar:
- `review_status`
- `publication_reason`
- `sensitivity_check_passed`
- `fact_check_note`
- `last_reviewed_at`
- `last_reviewed_by`
- `published_by`
- `archived_reason`

Esses campos não aparecem no público e servem só para operação interna.

## Checklist de publicação

Antes de publicar, a interface interna exige:
- remover dados pessoais ou sensíveis
- confirmar que o texto está sanitizado
- confirmar que não há contato privado exposto
- confirmar que a publicação faz sentido editorial
- registrar um motivo curto de publicação

Além disso, o salvamento bloqueia a publicação se faltarem:
- motivo de publicação
- nota de checagem
- confirmação de sensibilidade
- status de revisão marcado como revisado

## Como ficou o histórico no item editorial

Na tela ` /interno/editorial/[id] ` agora aparecem:
- estado editorial atual
- status de revisão
- última revisão
- quem revisou por último
- quem publicou por último
- motivo de publicação
- razão de arquivamento, quando houver
- histórico recente de eventos editoriais

Isso deixa a responsabilidade editorial visível sem transformar a interface em um dashboard pesado.

## Segurança e separação de camadas

A publicação pública continua restrita aos itens explicitamente publicados.

A camada pública:
- não lê log interno
- não lê notas internas de revisão
- não lê justificativas editoriais
- não exibe checklist interno

A camada interna:
- mantém a trilha de auditoria
- mantém os metadados de governança
- mantém os rascunhos e os estados de revisão

## Limitações atuais

- não há múltiplos papéis editoriais além do controle administrativo atual
- não existe versionamento de conteúdo por revisão
- a trilha é mínima e intencionalmente manual
- o checklist é obrigatório na publicação, mas ainda simples

## Riscos que permanecem

- a qualidade da publicação ainda depende da disciplina da equipe
- notas curtas demais podem empobrecer a rastreabilidade
- a auditoria registra o evento, mas não faz comparação automática de mudanças de texto
- se a equipe pular o rito editorial fora da interface, a governança perde força

## Como aplicar as migrations

Nova migration desta etapa:
- `supabase/migrations/0004_editorial_governance.sql`

Ela:
- altera `editorial_items`
- adiciona os campos de governança
- amplia os estados editoriais
- cria `editorial_audit_log`
- habilita RLS e políticas internas para o log

## Próximos passos recomendados

1. Criar comparação simples entre versões para apontar o que mudou no texto.
2. Adicionar um painel de itens prontos para publicação.
3. Evoluir a checagem de segurança com campos mais explícitos, se a operação pedir.
4. Criar uma rotina editorial de revisão periódica para itens já publicados.
