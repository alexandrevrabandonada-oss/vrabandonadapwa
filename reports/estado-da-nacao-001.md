# Estado da Nação 001

Data de corte: 19 de março de 2026

## O que foi criado

- Estrutura base em Next.js com App Router e TypeScript.
- Layout global com header, footer, sistema de container e tokens visuais.
- Rotas iniciais:
  - `/`
  - `/sobre`
  - `/pautas`
  - `/memoria`
  - `/apoie`
  - `/envie`
  - `/manifesto`
- Home inicial com blocos editoriais e placeholders coerentes com o produto.
- Base de PWA com manifest e ícones gerados por rota.
- Base de integração com Supabase em `lib/supabase/`.
- Formulário de envio ligado ao Supabase via server action.
- Migration SQL inicial para `public.intake_submissions`.
- Arquivo `.env.example`.
- README objetivo.

## Decisões tomadas

- Estrutura visual industrial/editorial, com contraste alto e linguagem de revista digital.
- Sem Tailwind e sem sobrecamada de abstração para manter a base limpa.
- PWA preparado desde o início para facilitar instalação e distribuição.
- Ícones placeholder gerados via Next para manter a entrega leve.
- Conteúdo mock foi escrito em português e alinhado ao tom popular, investigativo e combativo do projeto.
- O primeiro fluxo real de dados foi desenhado como inserção simples em fila editorial, sem backend complexo.

## Pendências

- Aplicar a migration no projeto Supabase para criar a tabela `intake_submissions`.
- Conectar moderação, lista de leitura interna e estados de triagem.
- Definir política de privacidade e segurança para denúncias sensíveis.
- Inserir identidade visual final: logotipo, tipografia proprietária e imagens reais.
- Trocar os mocks por conteúdo editorial validado.

## Riscos

- A linguagem visual forte precisa ser validada com conteúdo real para não parecer apenas estética.
- Recebimento de denúncia sem fluxo de proteção de dados pode expor fontes.
- PWA e instalação dependem de checagens finais no navegador alvo e em Vercel.

## Próximos passos recomendados

1. Rodar a migration do Supabase e testar um envio real no ambiente local.
2. Criar a triagem interna das submissões com status e observação editorial.
3. Adicionar acervo real de memória da cidade.
4. Montar a primeira trilha de publicação: pauta, apuração, publicação e atualização.
