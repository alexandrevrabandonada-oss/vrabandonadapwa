# Estado da Nação 003

Data de corte: 19 de março de 2026

## O que foi implementado

- O fluxo `/envie` continua gravando submissões reais, agora alinhado a RLS.
- A tabela `public.intake_submissions` recebeu campos de triagem editorial.
- Foi criada a migration de segurança com RLS para leitura e atualização apenas por usuários autenticados e autorizados.
- Foi criada a tabela `public.admin_email_allowlist` para controle mínimo do acesso interno.
- A área interna ficou disponível em `/interno/entrar`, `/interno/intake` e `/interno/intake/[id]`.
- O acesso interno usa magic link do Supabase Auth com allowlist de e-mails.
- O painel interno lista submissões, filtra por status, abre detalhe e salva status/notas/flags editoriais.
- O fluxo público ganhou regras de envio e aviso de privacidade/cuidado com dados.
- O cliente SSR do Supabase foi reorganizado para servir tanto o fluxo público quanto o interno.
- O callback de autenticação foi adicionado em `/auth/callback`.

## Decisões de segurança

- Inserção pública continua isolada no fluxo esperado do formulário, mas leitura e escrita de triagem ficam sob RLS.
- A allowlist de acesso não depende de interface pública; ela é controlada na base do Supabase.
- O painel interno não expõe a fila em rota pública.
- O login interno não envia link para e-mail fora da allowlist.
- O conteúdo interno trabalha com uma versão segura do material, notas privadas e flags de risco.

## Limitações atuais

- A allowlist precisa ser populada manualmente com pelo menos um e-mail administrativo.
- O painel ainda é simples: lista, detalhe e atualização. Não há busca avançada, comentários ou histórico de revisão.
- Não existe trilha de auditoria granular além de `reviewed_at` e `reviewed_by`.
- O processo de publicação pública ainda não foi construído.

## Riscos que permanecem

- Se a migration de RLS não for aplicada, a disciplina de acesso fica comprometida.
- Se a allowlist estiver vazia, ninguém entra no painel interno.
- O fluxo de relatos sensíveis ainda depende de processo editorial humano, não de automação.
- A exposição de dados pessoais deve ser revisada com cuidado antes de qualquer ampliação do painel.

## Como acessar a área interna

1. Inserir seu e-mail na tabela `public.admin_email_allowlist` no Supabase.
2. Abrir `/interno/entrar`.
3. Solicitar o magic link.
4. Clicar no link recebido e entrar em `/interno/intake`.

## Migrations a aplicar

1. `supabase/migrations/0001_create_intake_submissions.sql`
2. `supabase/migrations/0002_intake_security_and_triage.sql`
3. Inserir manualmente o e-mail administrativo na tabela `public.admin_email_allowlist`

## Próximos passos recomendados

1. Criar a primeira visão pública derivada do material triado.
2. Adicionar busca por texto e tags no painel interno.
3. Criar histórico mínimo de alterações por submissão.
4. Refinar a política de privacidade e o aviso de dados sensíveis.
5. Definir o primeiro fluxo de publicação editorial para itens aprovados.
