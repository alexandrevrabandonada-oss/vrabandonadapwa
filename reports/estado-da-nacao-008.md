# Estado da Nação 008

## O que mudou na home

A home deixou de funcionar como uma entrada genérica para conteúdo e passou a operar como landing editorial do VR Abandonada.

- O hero agora abre com manifesto, sinais editoriais e CTAs de entrada.
- A página ganhou uma sequência clara de blocos: apresentação, destaque, séries, memória, denúncia, apoio e manifesto curto.
- A home usa dados editoriais reais para puxar pautas e séries, com fallback seguro quando necessário.
- O visual ficou mais próximo de uma capa de revista digital do que de uma lista de posts.

## Como a jornada do usuário ficou organizada

A lógica da nova home é conduzir o visitante por etapas simples:

1. entender rapidamente o que é o projeto;
2. entrar numa pauta em destaque;
3. navegar por séries e eixos;
4. enviar denúncia;
5. apoiar o projeto;
6. ler o manifesto.

Isso reduz fricção para quem chega do Instagram ou de um link compartilhado e não conhece o contexto completo.

## Blocos criados ou reforçados

- Hero principal com headline, lead, CTAs e sinais editoriais.
- Bloco "O que é o VR Abandonada" com explicação curta e direta.
- Destaque principal puxado da camada editorial pública.
- Bloco de pautas em sequência.
- Bloco de eixos editoriais.
- Bloco de séries em evidência.
- Bloco de memória e arquivo vivo.
- Bloco de envio de denúncia com cuidado editorial.
- Bloco de apoio com explicação de impacto.
- Fecho com manifesto curto e CTAs finais.

## Como a home conversa com pautas, séries, denúncia e apoio

- As pautas entram como destaque e continuidade editorial.
- As séries aparecem como linhas de investigação, não como categorias soltas.
- O envio de denúncia fica mais visível e mais responsável.
- O apoio deixa de ser texto lateral e passa a ser parte da jornada pública.
- O manifesto fecha a página como identidade e não como rodapé institucional.

## Arquitetura aplicada

- `app/page.tsx` passou a ser uma landing server-side com dados reais.
- `lib/site.ts` concentrou a voz pública, os eixos e as mensagens centrais.
- Os componentes editoriais já existentes foram reutilizados para manter consistência.
- A home continua separada da área interna e não mistura backoffice com vitrine.

## Limitações atuais

- A home ainda não tem variação dinâmica avançada por campanha ou contexto.
- Não há animação editorial pesada.
- Não há acervo histórico completo na landing.
- O bloco de séries ainda é enxuto e depende do catálogo atual.

## Próximos passos recomendados

- criar uma seção editorial de chamada rotativa, se houver necessidade de campanha;
- refinar a hierarquia do hero com imagens reais em momentos específicos;
- fazer a home destacar automaticamente uma série em curso;
- revisar microcopy conforme o arquivo real for crescendo;
- preparar um bloco de apelo financeiro mais concreto quando o fluxo de apoio estiver pronto.

## Validação

- `npm run typecheck` passou
- `npm run lint` passou sem warnings
- `npm run build` passou

## Arquivos principais

- `app/page.tsx`
- `lib/site.ts`
- `app/globals.css`
- `reports/estado-da-nacao-008.md`
