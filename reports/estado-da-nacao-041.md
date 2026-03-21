# Estado da Nação 041

## Resumo executivo

O VR Abandonada ganhou uma camada prioritária de acessibilidade para leitura por voz e baixa visão. A implementação foi feita como parte do shell público, sem login, sem nuvem e sem transformar o produto em aplicativo técnico.

A decisão de produto é manter isso como acessibilidade central, não como extra opcional.

## O que foi implementado

- Assistente de leitura por voz no shell público.
- Modo baixa visão com reforço visual local.
- Persistência local da última seção lida por página.
- Controle de velocidade de leitura.
- Ações claras para ouvir, pausar, parar, avançar e voltar seção.
- Destaque visual da seção em foco durante a leitura.
- Fallback respeitoso quando o navegador não oferece TTS nativo.

## Páginas priorizadas

A camada entrou para leitura assistida nas páginas públicas principais:

- `home`
- `/agora`
- `/edicoes/[slug]`
- `/dossies/[slug]`
- `/campanhas/[slug]`
- `/impacto/[slug]`
- `/memoria/[slug]`
- `/territorios/[slug]`
- `/atores/[slug]`
- `/padroes/[slug]`
- `/metodo`
- `/participe`
- e demais páginas públicas que seguem a mesma estrutura de conteúdo

A camada não foi exposta em áreas internas.

## Como a leitura por blocos foi resolvida

A leitura não percorre o DOM cru inteiro. Ela coleta blocos editoriais públicos do conteúdo principal e lê por seções.

A lógica atual:

- identifica seções e artigos relevantes no conteúdo público
- extrai título e texto limpo de cada bloco
- remove ruído de navegação, formulários e controles internos
- lê uma seção por vez
- avança para a próxima seção ao terminar
- permite voltar, pausar, parar e retomar a partir da seção atual

Isso preserva a estrutura editorial da página e evita uma leitura desorganizada.

## Destaque visual do que está sendo lido

Durante a leitura:

- a seção atual recebe destaque visual
- o bloco atual é centralizado na tela
- a rolagem acompanha o foco de leitura com suavidade
- o destaque respeita `prefers-reduced-motion`

Esse apoio visual foi pensado para baixa visão e para quem usa a leitura por voz enquanto acompanha o texto com os olhos.

## Modo baixa visão

Foi adicionado um modo local de reforço visual com:

- contraste mais forte
- base tipográfica mais confortável
- espaçamento mais generoso
- controles maiores
- mais respiro entre blocos
- bordas e contornos mais claros
- redução de ruído visual no shell

O modo fica salvo no dispositivo e reaparece no próximo uso.

## Persistência local

A experiência guarda localmente:

- a última seção lida da página
- o estado do modo baixa visão
- o estado do assistente de leitura
- a velocidade escolhida

Isso funciona sem login e sem sincronização em nuvem.

## Controles criados

Os controles principais ficaram assim:

- `Ouvir`
- `Retomar`
- `Pausar`
- `Parar`
- `Seção anterior`
- `Próxima seção`
- `Baixa visão`
- velocidade `0,9x`, `1x`, `1,15x`, `1,3x`

## Fallback e compatibilidade

Quando o navegador não oferece leitura por voz nativa:

- o painel continua visível
- a página não quebra
- o usuário recebe uma mensagem clara
- o modo baixa visão continua funcionando

## Limitações atuais

- A voz depende da implementação nativa de cada navegador/dispositivo.
- Não há seleção de vozes nem exportação de áudio.
- A leitura por blocos é editorial, mas ainda depende da estrutura do HTML da página.
- A seção detectada pode variar de acordo com a composição da página.
- A persistência é local, não sincronizada.

## Próximos passos recomendados

- Ajustar o mapeamento de seções em páginas muito longas quando o uso real pedir mais precisão.
- Refinar a ordem de leitura em alguns layouts específicos.
- Revisar pequenas diferenças de contraste após uso em aparelhos reais.
- Se houver demanda, adicionar seleção de voz como ajuste opcional, sem transformar isso em um player complexo.

## Checklist final

- [x] TTS nas páginas públicas principais
- [x] Controles grandes e claros
- [x] Leitura por blocos
- [x] Destaque visual da seção lida
- [x] Retomada local da leitura
- [x] Modo baixa visão
- [x] Compatibilidade com PWA/mobile
- [x] Fallback respeitoso
- [x] Acessibilidade dos controles
- [x] Sem login, sem nuvem, sem camada nova de produto

## Decisão

**Implementado com sucesso.**

A camada de leitura por voz e baixa visão ficou pronta para uso real no V1, com foco em utilidade cotidiana e apoio prático à leitura do VR Abandonada.
