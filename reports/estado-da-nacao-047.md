# Estado da Nação 047

## O que foi ajustado
O menu agrupado passou a destacar visualmente o primeiro grupo, que concentra o uso diário.

## Mudança principal
- o bloco inicial ganhou o estilo `site-menu__group--featured`
- o destaque ajuda a orientar o olhar para o caminho mais usado no celular

## Efeito prático
- leitura mais rápida do menu
- melhor hierarquia entre uso diário e camadas de exploração
- menos dispersão visual no drawer

## Arquivos alterados
- `components/site-menu.tsx`
- `app/globals.css`

## Limite atual
A hierarquia ainda depende de uso real para saber se o destaque do primeiro grupo é suficiente ou se algum outro grupo merece peso semelhante.
