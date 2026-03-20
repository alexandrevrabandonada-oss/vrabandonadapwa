# Estado da Nação 024

## O que foi criado
A camada pública de territórios / lugares vivos entrou como um atlas editorial da cidade. O projeto agora pode ser navegado também por bairro, equipamento, ponto crítico, marco urbano e lugar de memória, sem depender só de formato, tema ou recência.

## Modelagem
Foi criada a estrutura leve `place_hubs` e `place_hub_links`.

Campos principais de lugar:
- `title`
- `slug`
- `excerpt`
- `description`
- `lead_question`
- `place_type`
- `parent_place_slug`
- `territory_label`
- `address_label`
- `latitude`
- `longitude`
- `cover_image_url`
- `featured`
- `public_visibility`
- `status`
- `sort_order`

Campos principais de vínculo:
- `place_hub_id`
- `link_type`
- `link_key`
- `link_role`
- `timeline_year`
- `timeline_label`
- `timeline_note`
- `featured`
- `sort_order`

A modelagem ficou simples de operar e suficiente para cruzar território com pauta, memória, acervo, coleção, dossiê, campanha, impacto e eixo.

## Área pública
A rota [`/territorios`](/C:/Projetos/VR%20Abandonada/app/territorios/page.tsx) funciona como atlas vivo da cidade.
Ela mostra:
- lugares em destaque
- territórios ativos
- lugares em monitoramento
- arquivo territorial
- porta de entrada por endereço concreto

A rota [`/territorios/[slug]`](/C:/Projetos/VR%20Abandonada/app/territorios/%5Bslug%5D/page.tsx) reúne:
- hero editorial
- pergunta central do lugar
- peça principal
- timeline leve
- pautas ligadas
- dossiês conectados
- memória e acervo
- campanhas e impacto
- eixos maiores
- lugares próximos

## Área interna
A operação interna ficou em:
- [`/interno/territorios`](/C:/Projetos/VR%20Abandonada/app/interno/territorios/page.tsx)
- [`/interno/territorios/novo`](/C:/Projetos/VR%20Abandonada/app/interno/territorios/novo/page.tsx)
- [`/interno/territorios/[id]`](/C:/Projetos/VR%20Abandonada/app/interno/territorios/%5Bid%5D/page.tsx)

Ela permite:
- criar lugar
- editar metadados
- marcar destaque e publicação
- ordenar leitura
- vincular peças
- montar timeline editorial simples

## Como os vínculos foram montados
Os vínculos de território atravessam:
- pautas editoriais
- memórias
- acervo
- campanhas
- impactos
- dossiês
- eixos temáticos
- páginas de navegação pública

Isso permite que o lugar funcione como condensador territorial do arquivo vivo e não como ficha burocrática.

## Home
A home passou a apontar a camada territorial com um bloco curto de entrada por lugares. O fluxo agora deixa claro que a cidade também pode ser lida por endereço, bairro e ponto crítico, não só por eixo ou caso.

## Conteúdo inicial
Foram criados seis lugares iniciais para demonstrar a proposta, incluindo:
- um bairro
- uma usina/entorno industrial
- um hospital
- um ponto de circulação crítica
- uma praça/marco urbano
- um bairro operário

## Limitações atuais
- não há mapa GIS real
- não há geocodificação
- não há busca espacial
- latitude e longitude são apenas suporte leve
- a hierarquia territorial ainda é simples

## Próximos passos recomendados
1. alimentar os territórios com dados reais e revisar vínculos.
2. incluir uma visualização cartográfica leve se isso realmente ajudar a leitura.
3. criar uma curadoria editorial mais explícita para territórios em monitoramento.
4. aproximar ainda mais os territórios de campanhas e impactos recorrentes.
