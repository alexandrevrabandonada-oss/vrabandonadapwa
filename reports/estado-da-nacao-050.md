# Estado da Nação 050

Ajuste pontual de navegação: `Agora` passou a receber destaque também dentro do drawer agrupado, fechando a consistência entre header, bottom nav e menu.

O que mudou:
- o item `Agora` no menu agrupado ganhou destaque visual próprio
- o padrão de prioridade diária ficou consistente entre desktop, mobile e menu
- o topo continua reduzido, mas agora a porta de entrada principal aparece de forma inequívoca em todo o shell

Arquivos alterados:
- `components/site-menu.tsx`
- `app/globals.css`

Validação:
- `npm run lint` passou
- `npm run build` passou
- `npm run typecheck` passou
