# Estado da Nação 038

## Objetivo da etapa

Esta etapa fez hardening fino de acessibilidade nas páginas longas e mais densas do VR Abandonada, sem abrir nova camada de produto e sem redesenho amplo.

O trabalho foi focado no uso real:
- leitura de bolso
- teclado
- screen reader
- contraste em blocos densos
- continuidade editorial
- nomes acessíveis mais claros em ações repetidas

## Páginas priorizadas

As revisões foram aplicadas primeiro nas rotas mais extensas e críticas:
- [`/dossies/[slug]`](/C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx)
- [`/campanhas/[slug]`](/C:/Projetos/VR%20Abandonada/app/campanhas/%5Bslug%5D/page.tsx)
- [`/impacto/[slug]`](/C:/Projetos/VR%20Abandonada/app/impacto/%5Bslug%5D/page.tsx)
- [`/territorios/[slug]`](/C:/Projetos/VR%20Abandonada/app/territorios/%5Bslug%5D/page.tsx)
- [`/atores/[slug]`](/C:/Projetos/VR%20Abandonada/app/atores/%5Bslug%5D/page.tsx)
- [`/padroes/[slug]`](/C:/Projetos/VR%20Abandonada/app/padroes/%5Bslug%5D/page.tsx)
- [`/edicoes/[slug]`](/C:/Projetos/VR%20Abandonada/app/edicoes/%5Bslug%5D/page.tsx)
- [`/memoria/[slug]`](/C:/Projetos/VR%20Abandonada/app/memoria/%5Bslug%5D/page.tsx)
- [`/acervo/[id]`](/C:/Projetos/VR%20Abandonada/app/acervo/%5Bid%5D/page.tsx)
- rotas de linha do tempo em [`/linha-do-tempo/[contentType]/[contentKey]`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/%5BcontentType%5D/%5BcontentKey%5D/page.tsx) e [`/linha-do-tempo/marcos/[slug]`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/marcos/%5Bslug%5D/page.tsx)
- [`/buscar`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- [`/envie`](/C:/Projetos/VR%20Abandonada/app/envie/page.tsx)

## O que foi encontrado

### 1. Headings em páginas longas
As páginas longas já tinham boa estrutura geral, mas ainda precisavam de mais hierarquia explícita no começo e mais continuidade no fim.

### 2. Contraste em chips e metadados
Chips, tags, sinais editoriais e metadados ficavam legíveis, mas podiam perder força em telas pequenas e fundos escuros.

### 3. Foco e teclado
O foco global existia, mas as páginas profundas ainda pediam mais consistência de retorno e de ação principal.

### 4. Nomes acessíveis ambíguos
Alguns botões e links usavam rótulos curtos demais em contexto denso, especialmente em busca e em blocos de destaque.

### 5. Formulários e feedback
A base de envio e busca já era funcional, mas a consistência de labels, descrições e caminhos de continuidade ainda podia melhorar.

### 6. Leitura de bolso
Em páginas longas, o problema principal não era ausência de conteúdo, e sim excesso de scroll sem uma trilha editorial suficiente.

## O que foi corrigido

### Wayfinding e continuidade
Foram criados dois blocos reutilizáveis:
- [`components/deep-page-wayfinding.tsx`](/C:/Projetos/VR%20Abandonada/components/deep-page-wayfinding.tsx)
- [`components/deep-page-continuation.tsx`](/C:/Projetos/VR%20Abandonada/components/deep-page-continuation.tsx)

Eles resolvem dois pontos:
- o topo da página mostra a camada maior e o retorno editorial
- o fim da leitura volta a oferecer próximos passos claros

### Ações repetidas com nomes acessíveis mais claros
Na busca, os CTAs do destaque ganharam nomes acessíveis mais explícitos:
- abrir o resultado
- salvar o resultado
- ver a linha do tempo relacionada
- acompanhar a peça

Também ajustei o wayfinding para que o retorno ao contexto maior tenha nome acessível mais claro.

### Headings e leitura de bolso
As páginas mais densas passaram a começar com um bloco de retorno mais explícito e terminar com uma continuidade mais legível.

### Contraste e densidade
O CSS global recebeu reforço em:
- chips
- sinais editoriais
- tags
- metadados
- botões e alvos de toque

### Reduced motion
O projeto passou a respeitar `prefers-reduced-motion` no CSS global, reduzindo movimento e transições quando o usuário pede isso.

### Envio e busca
A página de envio foi normalizada para manter o mesmo padrão de hierarquia visual e texto de apoio.
A página de busca recebeu ajuste de CTA no destaque e nomes acessíveis mais claros.

## Arquivos alterados

- [`app/acervo/[id]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/acervo/%5Bid%5D/page.tsx)
- [`app/atores/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/atores/%5Bslug%5D/page.tsx)
- [`app/buscar/page.tsx`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- [`app/campanhas/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/campanhas/%5Bslug%5D/page.tsx)
- [`app/dossies/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx)
- [`app/edicoes/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/edicoes/%5Bslug%5D/page.tsx)
- [`app/envie/page.tsx`](/C:/Projetos/VR%20Abandonada/app/envie/page.tsx)
- [`app/globals.css`](/C:/Projetos/VR%20Abandonada/app/globals.css)
- [`app/impacto/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/impacto/%5Bslug%5D/page.tsx)
- [`app/layout.tsx`](/C:/Projetos/VR%20Abandonada/app/layout.tsx)
- [`app/linha-do-tempo/[contentType]/[contentKey]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/%5BcontentType%5D/%5BcontentKey%5D/page.tsx)
- [`app/linha-do-tempo/marcos/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/marcos/%5Bslug%5D/page.tsx)
- [`app/memoria/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/memoria/%5Bslug%5D/page.tsx)
- [`app/padroes/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/padroes/%5Bslug%5D/page.tsx)
- [`app/territorios/[slug]/page.tsx`](/C:/Projetos/VR%20Abandonada/app/territorios/%5Bslug%5D/page.tsx)
- [`components/deep-page-continuation.tsx`](/C:/Projetos/VR%20Abandonada/components/deep-page-continuation.tsx)
- [`components/deep-page-wayfinding.tsx`](/C:/Projetos/VR%20Abandonada/components/deep-page-wayfinding.tsx)
- [`components/search-result-card.tsx`](/C:/Projetos/VR%20Abandonada/components/search-result-card.tsx)
- [`components/site-footer.tsx`](/C:/Projetos/VR%20Abandonada/components/site-footer.tsx)
- [`components/site-header.tsx`](/C:/Projetos/VR%20Abandonada/components/site-header.tsx)

## Checklist de acessibilidade

- [x] retorno editorial explícito nas páginas profundas
- [x] fechamento com próximos passos mais legível
- [x] foco global consistente
- [x] navegação principal com estado ativo
- [x] rodapé com semântica clara
- [x] nomes acessíveis mais claros em ações repetidas
- [x] contraste reforçado em chips, tags e metadados
- [x] reduced motion respeitado
- [x] leitura funcional no celular
- [ ] revisão completa de contraste por página longa, item a item
- [ ] revisão fina de headings em todas as páginas de detalhe
- [ ] limpeza dos warnings antigos em [`lib/timeline/highlight-resolve.ts`](/C:/Projetos/VR%20Abandonada/lib/timeline/highlight-resolve.ts)

## Checklist de uso real no celular

- [x] encontrar a camada maior rapidamente
- [x] entender o que fazer em seguida
- [x] voltar para radar, buscar, acompanhar ou participar
- [x] navegar por teclado sem perder o fio
- [x] ler blocos densos com mais respiro visual
- [x] reduzir movimento quando o usuário prefere menos animação
- [ ] reduzir ainda mais densidade em algumas páginas de acervo muito longas
- [ ] padronizar mais completamente os blocos finais de continuidade em toda a base

## O que ainda ficou pendente

1. A timeline compartilhada ainda tem warnings antigos de lint em módulos de resolução.
2. Algumas páginas de acervo e memória ainda podem ganhar mais decomposição visual em telas pequenas.
3. O contraste foi reforçado de forma global, mas uma revisão visual fina por página ainda seria útil.
4. A consistência entre blocos finais de continuidade pode ser mais uniforme na próxima rodada.

## Validação

- `npm run build` passou
- `npm run typecheck` passou
- `npm run lint` passou com warnings antigos conhecidos em módulos da timeline, sem erro de compilação

## Resultado prático

O VR Abandonada ficou mais usável por mais gente sem perder a densidade editorial.

A mudança mais importante aqui não é estética. É de esforço:
- menos ambiguidade
- menos atrito
- mais previsibilidade
- mais legibilidade em páginas longas
- mais respeito ao celular e às preferências do usuário
