# Estado da Nação 037

## Objetivo da etapa

Esta etapa não adicionou nova macrocamada. O foco foi corrigir atritos reais de navegação global, leitura de bolso e consistência de CTA nas páginas profundas.

A auditoria anterior já tinha resolvido a base estrutural de acessibilidade. Aqui o trabalho foi mais cirúrgico:
- deixar claro onde a pessoa está
- tornar o retorno mais previsível
- padronizar os gestos de continuação
- reduzir dispersão em páginas densas

## Padrões consolidados

### 1. Retorno editorial no topo da página
Foi criado um padrão leve de wayfinding para páginas profundas:
- [`components/deep-page-wayfinding.tsx`](/C:/Projetos/VR%20Abandonada/components/deep-page-wayfinding.tsx)

Esse bloco serve para:
- mostrar a camada maior de origem
- oferecer um retorno claro
- expor 2 a 3 ações consistentes logo no início da leitura

O resultado é simples:
- a pessoa vê rapidamente em que camada está
- entende como voltar
- encontra o próximo gesto sem precisar rolar muito

### 2. Continuidade no fim da leitura
Foi criado um bloco leve de fechamento:
- [`components/deep-page-continuation.tsx`](/C:/Projetos/VR%20Abandonada/components/deep-page-continuation.tsx)

Ele organiza o fim da leitura com:
- título curto
- explicação curta
- ações diretas para continuar no ecossistema

### 3. Padrão verbal mais estável
A sequência de ações passou a ficar mais previsível nas páginas profundas:
- `Voltar para ...`
- `Buscar`
- `Acompanhar`
- `Compartilhar`
- `Participar`
- `Ver radar`
- `Ver territórios`
- `Ver atores`
- `Ver eixos`
- `Abrir acervo`
- `Abrir memória`

O objetivo não foi inventar novos comandos, e sim repetir os mesmos comandos com intenção editorial clara.

## Páginas priorizadas

As correções de continuidade foram aplicadas primeiro nas rotas mais densas:
- [`/dossies/[slug]`](/C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx)
- [`/campanhas/[slug]`](/C:/Projetos/VR%20Abandonada/app/campanhas/%5Bslug%5D/page.tsx)
- [`/impacto/[slug]`](/C:/Projetos/VR%20Abandonada/app/impacto/%5Bslug%5D/page.tsx)
- [`/territorios/[slug]`](/C:/Projetos/VR%20Abandonada/app/territorios/%5Bslug%5D/page.tsx)
- [`/atores/[slug]`](/C:/Projetos/VR%20Abandonada/app/atores/%5Bslug%5D/page.tsx)
- [`/padroes/[slug]`](/C:/Projetos/VR%20Abandonada/app/padroes/%5Bslug%5D/page.tsx)
- [`/edicoes/[slug]`](/C:/Projetos/VR%20Abandonada/app/edicoes/%5Bslug%5D/page.tsx)
- [`/linha-do-tempo/[contentType]/[contentKey]`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/%5BcontentType%5D/%5BcontentKey%5D/page.tsx)
- [`/linha-do-tempo/marcos/[slug]`](/C:/Projetos/VR%20Abandonada/app/linha-do-tempo/marcos/%5Bslug%5D/page.tsx)
- [`/memoria/[slug]`](/C:/Projetos/VR%20Abandonada/app/memoria/%5Bslug%5D/page.tsx)
- [`/acervo/[id]`](/C:/Projetos/VR%20Abandonada/app/acervo/%5Bid%5D/page.tsx)

### O que mudou nessas páginas
- o topo agora começa com um retorno explícito para a camada maior
- as ações iniciais ficaram mais curtas e mais previsíveis
- os gestos de `buscar`, `acompanhar`, `compartilhar` e `participar` passaram a aparecer com mais regularidade
- memória e acervo ganharam fechamento editorial mais legível para dispositivo móvel

## Diagnóstico de navegação após a correção

### O que melhorou
- a pessoa entende mais rápido onde está
- o retorno para a camada maior ficou mais óbvio
- o celular deixou de exigir tanto scroll cego para encontrar o próximo gesto
- a leitura profunda ficou menos solta entre uma página e outra

### O que ainda pode melhorar depois
- alguns blocos longos continuam densos por natureza editorial
- a repetição de CTAs ainda pode ser afinada em páginas muito extensas
- a camada de retorno pode ganhar ainda mais coesão visual em futuras revisões de design system

## Acessibilidade aplicada à continuidade

Além da base já corrigida na auditoria anterior, esta etapa reforçou:
- retorno acessível e visível no topo de cada página profunda
- nomeação mais clara das ações de navegação
- melhor previsibilidade de foco e de sequência de leitura
- maior aderência ao uso no celular

## Uso cotidiano

No uso real, o resultado esperado é este:
- a pessoa abre uma página profunda e entende imediatamente de onde ela veio
- o próximo passo aparece antes da dispersão
- o retorno para salvos, acompanhar, buscar ou radar fica mais óbvio
- o fluxo diário fica menos dependente de memória ou tentativa e erro

## Problemas corrigidos nesta etapa

- ausência de breadcrumb/retorno editorial nas páginas profundas
- excesso de variação nos pontos de entrada e saída entre camadas
- leitura de bolso pouco guiada no topo de algumas páginas longas
- continuidade editorial pouco padronizada em memória e acervo

## O que ficou para a próxima etapa

1. Revisar ainda mais a uniformidade dos blocos finais de `continue lendo` nas páginas mais extensas.
2. Reduzir os warnings antigos de lint em [`lib/timeline/highlight-resolve.ts`](/C:/Projetos/VR%20Abandonada/lib/timeline/highlight-resolve.ts).
3. Fazer uma revisão fina de contrastes e headings nas páginas longas, agora com foco em páginas específicas e não no sistema inteiro.
4. Se necessário, consolidar ainda mais as CTAs em um conjunto visual único para páginas profundas.

## Validação

- `npm run build` passou
- `npm run typecheck` passou
- `npm run lint` passou com warnings antigos conhecidos em módulos da timeline, sem erro de compilação

## Resultado prático

O VR Abandonada ficou mais previsível para uso cotidiano no celular.

A navegação agora tem:
- retorno mais claro
- continuidade mais legível
- CTA mais estável
- menos atrito nas páginas que mais concentram leitura

A mudança é pequena em aparência, mas importante em uso real: o ecossistema segue grande, porém está mais navegável e menos cansativo.
