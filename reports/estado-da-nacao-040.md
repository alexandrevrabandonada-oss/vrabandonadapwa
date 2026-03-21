# Estado da Nação 040

## Resumo executivo

O VR Abandonada chegou a um ponto de V1 lançável. Esta etapa não abriu novas camadas de produto: ela consolidou o uso cotidiano, reduziu ruído, limpou warnings antigos e fechou as arestas de navegação, leitura de bolso e continuidade.

A decisão final é: **pronto para lançar**.

## O que foi polido

- Ajuste fino de densidade nas páginas longas e nas áreas de retorno.
- Consolidação de wayfinding editorial nas páginas profundas.
- Trilha local de retorno recente no PWA para retomada rápida.
- Blocos de continuidade mais consistentes entre home, radar, acompanhar, salvos, busca, edições e campanhas.
- Limpeza de warnings antigos em `lib/timeline/highlight-resolve.ts`.

## O que foi limpo

- Remoção de imports mortos no resolver da cronologia.
- Remoção de helper morto que seguia disparando warning de lint.
- Revalidação do projeto após a limpeza, sem warnings de ESLint.

## Fluxos cotidianos priorizados

1. Abrir o app e ver o que está quente agora.
2. Voltar ao que a pessoa já vinha acompanhando.
3. Retomar leituras salvas.
4. Buscar algo específico.
5. Entrar numa edição, campanha ou dossiê e seguir de lá.
6. Compartilhar, seguir ou participar sem perder contexto.

## Ajustes que mais mudaram o uso real

- `Home`: ficou mais orientada ao retorno e ao próximo passo.
- `Agora`: ficou mais útil para leitura rápida do que mudou.
- `Acompanhar`: ficou mais claro como área de frente acompanhada, não só lista.
- `Salvos`: ficou mais nítido como memória local do dispositivo.
- `Buscar`: ficou mais transitável entre camadas, com saída mais clara para continuidade.
- `Edições` e `Campanhas`: passaram a servir melhor como pontos de retomada.

## Acessibilidade e consistência

Checklist final:

- [x] Skip link presente
- [x] Landmark principal presente
- [x] Navegação global com estado ativo
- [x] Footer semântico
- [x] Wayfinding editorial em páginas profundas
- [x] Foco visível e navegável
- [x] Contraste revisado nos blocos mais densos
- [x] Microcopy mais consistente
- [x] Continuidade entre salvar, seguir, compartilhar e participar
- [x] PWA com retorno recorrente útil

## PWA e uso móvel

Checklist final:

- [x] Instalação clara
- [x] Shell consistente
- [x] Offline leve funcional
- [x] Salvos locais funcionando
- [x] Seguir local funcionando
- [x] Trilha local de leitura recente
- [x] Volta rápida ao conteúdo útil
- [x] Boa leitura de bolso nas páginas principais

## Build e integridade

- `npm run build`: OK
- `npm run typecheck`: OK
- `npm run lint`: OK

## Dívida aceitável de V1

- A curadoria editorial ainda pode ser refinada com uso real.
- Algumas páginas muito longas ainda podem ganhar mais cortes textuais no futuro.
- A limpeza visual fina pode continuar com base em uso real de celular.
- A trilha de retorno pode ser expandida, mas não é bloqueio de lançamento.

## O que ficou para depois

- Polimento visual fino baseado em uso real pós-lançamento.
- Eventual revisão de densidade em páginas muito extensas.
- Novos cortes editoriais conforme a rotina do público mostrar necessidade.

## Decisão

**Pronto para lançar.**

O produto já tem:
- arquitetura pública coerente
- fluxo de leitura e participação
- busca transversal
- cronologia e marcos
- PWA útil no celular
- continuidade entre salvar, seguir e retomar
- acessibilidade estrutural e foco estável

O que sobra é dívida normal de produto em operação, não bloqueio de V1.
