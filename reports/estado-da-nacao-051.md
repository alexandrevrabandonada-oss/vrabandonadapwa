# Estado da Nação 051

A home foi refinada para servir melhor ao retorno recorrente sem perder força de primeira visita.

O que foi diagnosticado
- a home ainda era muito forte como manifesto, mas podia exigir leitura e scroll demais para quem já usa o app todo dia
- o retorno prático ao radar, frentes seguidas, salvos e edição do momento precisava aparecer mais cedo
- a primeira dobra no celular precisava responder mais rápido ao que está vivo agora

O que foi reorganizado
- criei um painel de retorno local na home em [`components/home-return-panel.tsx`](/C:/Projetos/VR%20Abandonada/components/home-return-panel.tsx)
- passei a mostrar uma leitura diferente quando existe trilha local, salvos ou frentes seguidas neste aparelho
- reforcei o bloco de retomada com ações diretas para `Agora`, `Acompanhar`, `Salvos`, `Buscar` e `Edições`
- reduzi o peso visual do herói no mobile para a primeira dobra ficar mais útil
- mantive o manifesto, mas com uma porta de retorno mais cedo para o uso diário

Como a home ficou melhor para retorno recorrente
- quem volta ao site vê primeiro um caminho para retomar leitura, abrir salvos e continuar frentes seguidas
- a home agora serve como ponte para o cotidiano, não só como apresentação institucional
- o bloco de retorno usa estado local do aparelho, sem login e sem personalização pesada

Como a home conversa melhor com `Agora`, `Acompanhar` e `Salvos`
- `Agora` continua sendo o ponto principal do que está quente
- `Acompanhar` aparece como lugar das frentes em curso
- `Salvos` aparece como retorno de peças específicas
- a home distribui esses três gestos logo no início, sem competir com o manifesto

Arquivos alterados
- [`app/page.tsx`](/C:/Projetos/VR%20Abandonada/app/page.tsx)
- [`app/globals.css`](/C:/Projetos/VR%20Abandonada/app/globals.css)
- [`lib/pwa/saved-reads.ts`](/C:/Projetos/VR%20Abandonada/lib/pwa/saved-reads.ts)
- [`components/home-return-panel.tsx`](/C:/Projetos/VR%20Abandonada/components/home-return-panel.tsx)

Validação
- `npm run lint` passou
- `npm run build` passou
- `npm run typecheck` passou

O que ainda ficou para os próximos passos
- observar o comportamento real do retorno na home com uso móvel
- decidir se o painel de retorno deve ficar acima do herói em todas as visitas ou aparecer só quando há sinais locais
- talvez simplificar mais alguns blocos da home se o uso real ainda exigir rolagem excessiva
