# Estado da Nação 030

## O que foi implementado
O VR Abandonada ganhou uma camada PWA mais útil de verdade no celular.

Nesta etapa entrou:
- registro do service worker no shell global
- CTA de instalação no cabeçalho, quando o navegador permite
- estado offline claro, com página própria
- cache leve do shell principal e de páginas-chave
- leitura salva no aparelho, sem login e sem nuvem
- hub local de salvos em `/salvos`
- botão de salvar em home, radar, edição, campanha, dossiê e pacotes de share

## Como ficou a instalação do PWA
A instalação passou a ter presença permanente no cabeçalho por meio de um CTA contextual.

Quando o navegador dispara `beforeinstallprompt`, o botão aparece como:
- `Instalar app`

Quando o app já foi instalado, o shell reconhece o modo standalone e mostra estado de instalação concluída.

Arquivos principais:
- [`components/pwa-install-button.tsx`](C:/Projetos/VR%20Abandonada/components/pwa-install-button.tsx)
- [`components/site-header.tsx`](C:/Projetos/VR%20Abandonada/components/site-header.tsx)
- [`app/layout.tsx`](C:/Projetos/VR%20Abandonada/app/layout.tsx)

## Como funciona a camada offline
O app agora registra um service worker próprio em [`public/sw.js`](C:/Projetos/VR%20Abandonada/public/sw.js).

Estratégia usada:
- precache do shell principal
- cache de navegação recente
- cache-first para assets estáticos
- network-first para páginas de navegação
- fallback para [`/offline`](C:/Projetos/VR%20Abandonada/app/offline/page.tsx) quando a rede cai

O offline não promete o site inteiro. Ele garante:
- acesso ao que já foi carregado
- retorno para salvos
- continuidade da leitura com copy útil

Arquivos principais:
- [`public/sw.js`](C:/Projetos/VR%20Abandonada/public/sw.js)
- [`components/pwa-register.tsx`](C:/Projetos/VR%20Abandonada/components/pwa-register.tsx)
- [`components/network-status-banner.tsx`](C:/Projetos/VR%20Abandonada/components/network-status-banner.tsx)
- [`app/offline/page.tsx`](C:/Projetos/VR%20Abandonada/app/offline/page.tsx)

## Como funciona a leitura salva
Foi criada uma camada local de salvos usando `localStorage`.

O usuário pode salvar:
- edição
- radar
- campanha
- dossiê
- impacto
- pauta
- memória
- território
- ator
- padrão
- e também páginas/pacotes recebidos por link

O armazenamento é local, sem login e sem sincronização em nuvem.

Arquivos principais:
- [`lib/pwa/saved-reads.ts`](C:/Projetos/VR%20Abandonada/lib/pwa/saved-reads.ts)
- [`components/save-read-button.tsx`](C:/Projetos/VR%20Abandonada/components/save-read-button.tsx)
- [`components/saved-reads-client.tsx`](C:/Projetos/VR%20Abandonada/components/saved-reads-client.tsx)

## Como ficou `/salvos`
A rota [`/salvos`](C:/Projetos/VR%20Abandonada/app/salvos/page.tsx) funciona como a prateleira local do aparelho.

Ela mostra:
- o que foi salvo
- quando foi salvo
- links para abrir de novo
- botão para remover item por item
- limpeza total da lista local

A ideia é virar retorno recorrente, não simples marcador de navegador.

## Como a experiência mobile foi fortalecida
A experiência mobile agora tem três gestos mais claros:
- instalar
- salvar
- voltar

Isso aparece em:
- cabeçalho global com instalação contextual
- home, radar, edições, campanhas, dossiês e share com botão de salvar
- estado offline com orientação útil
- hub de salvos para retomar leitura depois

## Onde a camada entrou no site
Pontos principais de uso:
- home em [`app/page.tsx`](C:/Projetos/VR%20Abandonada/app/page.tsx)
- radar em [`app/agora/page.tsx`](C:/Projetos/VR%20Abandonada/app/agora/page.tsx)
- edição em [`app/edicoes/[slug]/page.tsx`](C:/Projetos/VR%20Abandonada/app/edicoes/%5Bslug%5D/page.tsx)
- campanha em [`app/campanhas/[slug]/page.tsx`](C:/Projetos/VR%20Abandonada/app/campanhas/%5Bslug%5D/page.tsx)
- dossiê em [`app/dossies/[slug]/page.tsx`](C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx)
- pacote compartilhado em [`app/compartilhar/[contentType]/[contentKey]/page.tsx`](C:/Projetos/VR%20Abandonada/app/compartilhar/%5BcontentType%5D/%5BcontentKey%5D/page.tsx)

## Mudanças de schema/modelagem
Não houve migration nova nesta etapa.

A camada é local e de shell:
- service worker
- cache do navegador
- localStorage para salvos

## Limitações atuais
- não existe sync em nuvem dos salvos
- não existe push notification
- não existe offline total do site inteiro
- páginas não visitadas ainda não ficam disponíveis offline
- não há analytics de retenção
- a instalação depende de suporte do navegador ao evento nativo

## Próximos passos recomendados
1. dar destaque maior ao CTA de instalação dentro da home e do radar quando o navegador permitir.
2. ampliar o cache leve para algumas páginas editoriais importantes que o usuário visitar com frequência.
3. permitir salvar também edições de share pack como leitura própria, se isso ajudar o retorno.
4. criar uma pequena faixa editorial de “volte depois” para quem instalar o app pela primeira vez.
