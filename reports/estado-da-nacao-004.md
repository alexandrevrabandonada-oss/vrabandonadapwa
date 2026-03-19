# Estado da Nação 004

## O que foi criado

Esta etapa introduziu a primeira camada editorial pública do VR Abandonada, separando o material bruto da triagem interna do conteúdo publicável.

Principais entregas:
- nova tabela `public.editorial_items` para a camada sanitizada e pública
- fluxo interno para criar rascunho editorial a partir de uma submissão triada
- área interna mínima em `/interno/editorial` e `/interno/editorial/[id]`
- página pública `/pautas` lendo a base editorial publicada
- página pública dinâmica `/pautas/[slug]`
- fallback de mocks editoriais quando ainda não há conteúdo real publicado
- regras de RLS para manter a camada pública restrita ao que foi explicitamente publicado
- separação entre queries públicas, queries internas e mutations editoriais

## Como o fluxo funciona

1. Um relato entra em `public.intake_submissions` pela rota `/envie`.
2. A equipe interna revisa esse material em `/interno/intake`.
3. A partir da submissão triada, o operador pode criar um rascunho editorial.
4. O rascunho é salvo em `public.editorial_items`, já sem campos privados da origem.
5. O editor ajusta título, resumo, corpo, categoria, destaque e status.
6. O item só aparece em `/pautas` e `/pautas/[slug]` quando está marcado como publicado.

## Separação entre bruto e público

A separação foi feita em duas camadas distintas:
- `intake_submissions`: recebe o material bruto, sensível e operacional
- `editorial_items`: guarda apenas a versão sanitizada e destinada à publicação

O item editorial possui referência opcional para a submissão original, mas não replica os campos privados da triagem. Dados como notas internas, flags de risco, contato e observações editoriais permanecem confinados na camada interna.

## Decisões de segurança

- A leitura pública de pautas usa client anônimo, sem depender de `cookies()` em build ou geração estática.
- A tabela `editorial_items` tem RLS habilitado.
- A política pública só libera registros com `published = true` e `editorial_status = 'published'`.
- A área interna continua dependendo de sessão autenticada e allowlist administrativa.
- O fluxo de criação de rascunho editorial só funciona dentro do contexto interno autenticado.
- A interface pública nunca recebe campos internos da submissão original.

## Limitações atuais

- Ainda não existe revisão multi-etapa real, apenas estados editoriais simples.
- Não há histórico de edição nem trilha de auditoria completa para cada mudança.
- A publicação ainda depende de ação manual do editor.
- Não há upload de mídia real nem gestão de imagens.
- Não há permissões por função além da allowlist administrativa já existente.

## Riscos que permanecem

- O uso de `body` e `excerpt` exige disciplina editorial para evitar vazamento de detalhes sensíveis.
- A operação depende de quem mantém a allowlist administrativa.
- A curadoria manual é segura, mas pode virar gargalo se o volume crescer.
- O fallback de mocks é útil para a fundação, mas precisa ser substituído por conteúdo real conforme o acervo crescer.

## Como acessar as rotas novas

- `/interno/entrar`: login administrativo por magic link
- `/interno/intake`: fila de triagem de submissões
- `/interno/intake/[id]`: detalhe da submissão e criação de rascunho editorial
- `/interno/editorial`: fila editorial pública/interna
- `/interno/editorial/[id]`: edição do item editorial sanitizado
- `/pautas`: vitrine pública das pautas publicadas
- `/pautas/[slug]`: leitura de uma pauta publicada

## Migrations

Nova migration aplicada nesta etapa:
- `supabase/migrations/0003_editorial_items.sql`

Ela cria a tabela `editorial_items`, adiciona índices, habilita RLS e define políticas de leitura pública restrita e gestão autenticada.

## Próximos passos recomendados

1. Criar política de revisão mais formal com estados e motivo de publicação.
2. Adicionar metadados editoriais melhores, como autor interno e data de revisão.
3. Implementar upload de imagem com cuidado de privacidade.
4. Criar página pública de acervo, com destaque para pautas fixadas e séries.
5. Evoluir a auditoria de mudanças para a camada interna.
