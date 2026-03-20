# Estado da Nação 019

## O que foi implementado
- Criação da camada pública de rotas de entrada em `/comecar`.
- Criação da página individual de rota em `/comecar/[slug]`.
- Modelagem leve com `entry_routes` e `entry_route_items`.
- Painel interno mínimo em `/interno/rotas`, `/interno/rotas/novo` e `/interno/rotas/[id]`.
- Integração da home principal com um bloco curto de rotas para primeira visita.
- Inclusão de `Começar` na navegação pública.

## Como a modelagem funciona
A camada usa duas tabelas simples:

- `entry_routes`: representa a rota editorial de entrada.
- `entry_route_items`: representa os passos da rota.

Campos principais da rota:
- `title`
- `slug`
- `excerpt`
- `description`
- `audience_label`
- `featured`
- `public_visibility`
- `sort_order`
- `status`

Campos principais dos passos:
- `item_type`
- `item_key`
- `role`
- `sort_order`
- `note`

Os papéis editoriais mantêm a lógica simples:
- `start`
- `context`
- `proof`
- `deepen`
- `follow`

## Como ficou `/comecar`
A página lista as rotas curatoriais como entradas curtas e guiadas.
Ela mostra:
- destaque principal
- outras entradas ativas
- contexto de uso para visitante novo
- ligação direta para `Agora`, `Eixos`, `Dossiês` e `Memória`

## Como ficou `/comecar/[slug]`
A página individual da rota mostra:
- abertura forte
- público-alvo da rota
- peça principal de entrada
- sequência de leitura guiada
- próximos passos fora da rota, para continuar navegando no site

A leitura foi desenhada para orientar, não para virar sitemap frio.

## Como a home passou a apontar esses percursos
A home agora inclui o bloco:
- `Por onde começar`

Esse bloco puxa três rotas de entrada e funciona como porta curta para quem chega pelo Instagram, WhatsApp ou compartilhamento direto.

## Como ficou a área interna de rotas
A área interna permite:
- criar rota
- editar rota
- controlar visibilidade pública
- marcar destaque
- listar rotas por status
- adicionar, editar e remover passos
- reordenar a leitura editorial por `sort_order`

## Como os vínculos foram montados
Os passos da rota podem apontar para:
- pauta
- dossiê
- memória
- acervo
- coleção
- eixo
- série

A resolução do conteúdo é feita por código e usa apenas peças já publicadas ou sanitizadas.

## Limitações atuais
- Ainda não há curadoria automática por perfil de visitante.
- Ainda não há recomendação personalizada.
- Ainda não há busca avançada dentro das rotas.
- A edição de passos ainda segue uma lógica manual e leve.
- Não existe destaque dinâmico por comportamento do usuário.

## Próximos passos recomendados
- Criar uma ou duas rotas adicionais para públicos específicos.
- Refinar o bloco de entrada na home com maior ênfase editorial.
- Adicionar uma indicação mais forte de rota em curso quando houver tema prioritário.
- Se necessário, criar uma ordem editorial mais rígida para as rotas mais importantes.