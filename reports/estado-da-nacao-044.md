# Estado da Nação 044

## O que foi polido
O rodapé foi enxugado para deixar de competir com a navegação principal e passar a funcionar só como atalho curto.

## O que mudou
- a lista longa de grupos no rodapé foi substituída por atalhos curtos
- o foco do rodapé passou a ser retorno rápido, não mapa completo do site
- a leitura do fim da página ficou menos pesada no mobile

## Arquivos alterados
- `components/site-footer.tsx`
- `lib/site.ts`
- `app/globals.css`

## Ganho prático
- menos repetição entre header, menu e footer
- menos esforço de varredura visual
- mais clareza sobre o que é navegação primária e o que é atalho secundário

## Limitação atual
O rodapé ainda pode ganhar uma passada de refinamento se o uso real mostrar que algum atalho está sobrando.

## Próximo passo recomendado
Observar uso real do celular e cortar qualquer atalho que não esteja servindo ao retorno diário.
