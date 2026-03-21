# Estado da Nação 054

## O que foi polido
Esta etapa reduziu fricção residual nas superfícies de rotina do VR Abandonada, com foco em uso de bolso, retorno diário e ação principal mais clara.

As páginas e blocos mais afetados foram:
- [`/agora`](/C:/Projetos/VR%20Abandonada/app/agora/page.tsx)
- [`/acompanhar`](/C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx)
- [`/buscar`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- [`/participe`](/C:/Projetos/VR%20Abandonada/app/participe/page.tsx)
- [`/envie`](/C:/Projetos/VR%20Abandonada/app/envie/page.tsx)
- o painel de retorno da home em [`components/home-return-panel.tsx`](/C:/Projetos/VR%20Abandonada/components/home-return-panel.tsx)
- o fluxo de entrada rápida em [`components/intake-form.tsx`](/C:/Projetos/VR%20Abandonada/components/intake-form.tsx)
- cards compactos em [`components/radar-item-card.tsx`](/C:/Projetos/VR%20Abandonada/components/radar-item-card.tsx), [`components/participation-path-card.tsx`](/C:/Projetos/VR%20Abandonada/components/participation-path-card.tsx) e [`components/search-result-card.tsx`](/C:/Projetos/VR%20Abandonada/components/search-result-card.tsx)

## O que mudou nas telas de rotina
- A home de retorno ficou mais curta e direta.
- `Agora` perdeu ruído acima da dobra e passou a oferecer 3 ações mais imediatas.
- `Acompanhar` virou uma tela mais operacional, com menos texto e menos competição entre ações.
- `Participe` encurtou o hero e ganhou portas de ação mais diretas.
- `Envie` ficou mais compacto no modo rápido e o formulário passou a pedir menos antes da primeira ação.
- `Buscar` entrou em modo mais rápido: menos texto de abertura, resultado já em variante compacta e menos comparação entre CTAs.

## Cards mais compactos
- Foi criada/fortalecida a lógica de `compact` nos cards de radar, participação e busca.
- Os cards compactos agora priorizam:
  - título
  - selo/tipo
  - uma linha curta de contexto
  - ação principal
- A redução de densidade também baixou a altura dos cards nas telas de rotina.

## Microcopy revista
Os textos curtos ficaram mais imediatos em pontos como:
- `Ver o que mudou`
- `Mandar pista`
- `Acompanhar`
- `Salvos`
- `Continuar`
- `Tempo`
- `Edição do momento`
- `Preencha o mínimo`
- `Retome o que já começou`
- `Continue de onde parou`

## Ação principal mais clara
Nas superfícies de rotina, a ação principal passou a aparecer mais cedo e com menos concorrência visual.
Exemplos:
- `Agora`: ver o que mudou, mandar pista, seguir uma frente
- `Acompanhar`: frentes seguidas, radar, pista
- `Participe`: mandar pista, apoiar, ver agora
- `Envie`: formulário curto com chamada direta para o relato
- `Buscar`: resultado principal com menos dispersão de CTAs

## Limitações atuais
- A compactação é editorial e visual, não muda a lógica de conteúdo.
- Alguns blocos de apoio continuam longos por necessidade de contexto.
- O `Acompanhar` ainda pode ganhar uma versão ainda mais enxuta em um próximo passe, se o uso real pedir.
- A busca continua rica por natureza; o ganho aqui foi principalmente na apresentação e na entrada.

## Checklist final da etapa
- cards compactos nas telas de rotina: ok
- microcopy de bolso: ok
- prioridade da ação principal: ok
- modo rápido de `Envie`: ok
- home de retorno mais curta: ok
- `Agora` mais útil: ok
- `Acompanhar` mais operacional: ok
- `Participe` mais direto: ok
- `Buscar` com menos atrito: ok
- lint: ok
- typecheck: ok
- build: ok

## Decisão
A etapa cumpriu o objetivo de reduzir atrito residual no uso curto e cotidiano sem abrir nova camada de produto.

Próximo ajuste recomendado:
- observar uso real no celular e, se necessário, cortar mais uma camada de texto em `Acompanhar` e na home de retorno.
