# Estado da Nação 055

## Jornadas testadas
Esta etapa simulou jornadas curtas de celular para medir se o VR Abandonada cabe na rotina de quem abre o app com pouco tempo.

### Jornada A - 30 segundos
Fluxo observado:
- abrir o app
- entender o que mudou
- abrir uma peça principal ou fazer uma microação

Caminho que funcionou melhor:
- [`/`](/C:/Projetos/VR%20Abandonada/app/page.tsx)
- [`/agora`](/C:/Projetos/VR%20Abandonada/app/agora/page.tsx)
- abrir uma peça do radar
- salvar, seguir ou mandar pista

### Jornada B - 2 minutos
Fluxo observado:
- abrir o app
- ver o que mudou
- voltar ao que acompanha
- abrir uma edição, campanha ou dossiê
- guardar ou compartilhar algo

Caminho que funcionou melhor:
- [`/`](/C:/Projetos/VR%20Abandonada/app/page.tsx)
- [`/agora`](/C:/Projetos/VR%20Abandonada/app/agora/page.tsx)
- [`/acompanhar`](/C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx)
- [`/edicoes`](/C:/Projetos/VR%20Abandonada/app/edicoes/page.tsx)
- microações de salvar e seguir

### Jornada C - 10 minutos
Fluxo observado:
- abrir o app
- entender uma pauta ou caso
- aprofundar em dossiê ou impacto
- decidir se acompanha, salva, participa ou envia algo

Caminho que funcionou melhor:
- [`/`](/C:/Projetos/VR%20Abandonada/app/page.tsx)
- [`/buscar`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- [`/dossies/[slug]`](/C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx)
- [`/impacto/[slug]`](/C:/Projetos/VR%20Abandonada/app/impacto/%5Bslug%5D/page.tsx)

### Jornada D - denúncia rápida
Fluxo observado:
- abrir o app
- entrar em [`/envie`](/C:/Projetos/VR%20Abandonada/app/envie/page.tsx)
- mandar uma pista ou relato curto
- concluir sem fricção excessiva

### Jornada E - descoberta
Fluxo observado:
- abrir [`/buscar`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- encontrar tema, lugar, ator ou caso
- salvar ou acompanhar algo encontrado

## Atritos encontrados
Os principais pontos de fricção que ainda apareciam no teste curto eram:
- hero muito alto em algumas telas
- texto demais antes da primeira decisão
- competição entre CTAs em páginas de rotina
- resultado de busca com ações demais para o modo de bolso
- envio rápido ainda mais longo do que precisava para uso de rua

## Correções feitas
A partir dessas jornadas, o ajuste mais importante foi concentrar a primeira ação e cortar ruído em telas de rotina.

### Home
- o bloco de retorno ficou mais curto em [`components/home-return-panel.tsx`](/C:/Projetos/VR%20Abandonada/components/home-return-panel.tsx)
- a home passou a apontar com mais força para o que já está em curso

### Agora
- o texto de abertura ficou mais direto em [`app/agora/page.tsx`](/C:/Projetos/VR%20Abandonada/app/agora/page.tsx)
- a área de bolso ficou com 3 ações centrais: ver o que mudou, mandar pista, seguir uma frente
- resultados em cards foram mantidos compactos

### Acompanhar
- o painel local ficou mais curto em [`components/followed-watchlist-client.tsx`](/C:/Projetos/VR%20Abandonada/components/followed-watchlist-client.tsx)
- a primeira dobra ficou menos explicativa e mais operacional em [`app/acompanhar/page.tsx`](/C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx)

### Buscar
- a entrada ficou mais curta em [`app/buscar/page.tsx`](/C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- resultados compactos perderam a ação secundária mais pesada na versão de bolso em [`components/search-result-card.tsx`](/C:/Projetos/VR%20Abandonada/components/search-result-card.tsx)

### Envie
- o fluxo rápido ficou mais curto em [`app/envie/page.tsx`](/C:/Projetos/VR%20Abandonada/app/envie/page.tsx)
- o formulário ficou mais direto em [`components/intake-form.tsx`](/C:/Projetos/VR%20Abandonada/components/intake-form.tsx)

### Participe
- o hero e a área de ação rápida ficaram mais curtos em [`app/participe/page.tsx`](/C:/Projetos/VR%20Abandonada/app/participe/page.tsx)
- os cards de colaboração ficaram mais compactos

## O que funciona em 30s / 2min / 10min
### 30 segundos
Funciona melhor para:
- abrir o app
- ver o que mudou
- abrir uma peça principal
- salvar ou seguir sem explorar demais

### 2 minutos
Funciona melhor para:
- voltar ao radar
- abrir a frente seguida
- entrar em uma edição do momento
- guardar ou compartilhar uma leitura

### 10 minutos
Funciona melhor para:
- buscar um caso específico
- aprofundar em dossiê ou impacto
- decidir se participa ou envia material

## O que ainda ficou
- algumas páginas profundas continuam longas por necessidade editorial
- o home editorial ainda é forte e segue pedindo atenção no uso muito rápido
- a busca ainda tem muitos filtros por natureza, mesmo com a apresentação mais curta
- o teste real de celular com pessoa usuária ainda é o próximo passo ideal para confirmar o corte final

## Veredito
Para uso curto, a experiência está mais próxima de caber na rotina real.
O produto já responde bem para ações rápidas e retorno recorrente, mas ainda pode ganhar um último corte fino depois de uso real observado no celular.

## Checklist da etapa
- jornadas de 30s, 2min, 10min e denúncia rápida simuladas: ok
- atritos de bolso mapeados: ok
- home de retorno reduzida: ok
- agora mais direto: ok
- acompanhar mais operacional: ok
- envie mais curto: ok
- buscar mais rápido: ok
- microações mais claras: ok
- lint: ok
- typecheck: ok
- build: ok
