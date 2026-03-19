# Estado da Nação 002

Data de corte: 19 de março de 2026

## O que avançou

- O projeto já está com base Next.js/App Router estável e publicado em `main`.
- O `Supabase browser client` foi ligado ao app e exibido como status na home.
- O canal `/envie` foi transformado em fluxo real de submissão com Server Action.
- O formulário grava em `public.intake_submissions`.
- Foi criada a migration SQL inicial para a tabela de entrada.
- A home ganhou um bloco explícito sobre o estado da integração com Supabase.
- O relatório anterior foi mantido como marco da fundação inicial.

## O que foi decidido nesta etapa

- O primeiro fluxo de dado real será simples: submissão direta para uma fila editorial básica.
- A captura inicial prioriza clareza e contexto, não complexidade de backend.
- A tabela de entrada guarda metadados mínimos para triagem posterior.
- A interface segue sem cara de SaaS e sem excesso de interação.

## O que falta fazer agora

- Aplicar a migration no Supabase e validar a tabela em produção.
- Criar uma tela interna de triagem e listagem das submissões.
- Definir regras para visibilidade, moderação e proteção de fontes.
- Evoluir o formulário para feedback mais robusto de envio e erro.
- Preparar o próximo conjunto de páginas editoriais com conteúdo real.

## Riscos observados

- A ausência de RLS e política de acesso pode expor dados sensíveis se a tabela for usada sem disciplina.
- A estrutura atual ainda depende de configuração correta do Supabase no ambiente de deploy.
- O fluxo de denúncia exige cuidado extra com anonimato e armazenamento.

## Próximos passos recomendados

1. Aplicar a migration e testar um envio real de ponta a ponta.
2. Montar um painel interno simples de triagem.
3. Ativar RLS e políticas de acesso adequadas antes de ampliar o uso.
4. Refinar a experiência do formulário com estados de sucesso e erro mais claros.
