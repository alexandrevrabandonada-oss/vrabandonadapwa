# Estado da Nação 025

## O que foi implementado

A etapa adicionou a camada pública de atores / instituições / responsáveis ao VR Abandonada. O projeto agora pode ser navegado também por quem atravessa os conflitos da cidade com recorrência: empresas, órgãos públicos, hospitais, secretarias, autarquias e equipamentos.

## Modelagem

Foram criadas duas tabelas novas:

- `public.actor_hubs`
- `public.actor_hub_links`

`actor_hubs` guarda o ator principal, com campos para título, slug, resumo, descrição, tipo de ator, território associado, destaque, visibilidade pública, status editorial e ordenação.

`actor_hub_links` guarda os vínculos editoriais com pauta, memória, acervo, coleção, dossiê, campanha, impacto, eixo, território, outro ator, página externa ou bloco auxiliar.

Os vínculos podem ser marcados com papel editorial simples:

- `lead`
- `evidence`
- `context`
- `followup`
- `archive`

## Como ficou `/atores`

A página pública de atores funciona como mapa editorial de responsabilidade e recorrência.

Ela apresenta:

- um hero com o ator em destaque
- blocos explicando o que são os atores
- contadores de status
- lista de atores ativos, em monitoramento e arquivo
- ligação clara para territórios, dossiês, memória, campanhas e impacto

## Como ficou `/atores/[slug]`

A página individual do ator mostra:

- abertura editorial forte
- status público e tipo de ator
- peça central para começar a leitura
- timeline leve dos vínculos
- blocos separados por tipo de peça
- caminho para seguir por território, campanha, impacto e participação

## Como a camada conversa com as outras partes do site

Atores se conectam com:

- pautas
- memória
- acervo
- coleções
- dossiês
- campanhas
- impacto
- eixos
- territórios

Isso ajuda a ler o caso por recorrência de responsabilidade, e não só por formato editorial.

## Área interna

Foram criadas rotas internas para listar, criar e editar atores:

- `/interno/atores`
- `/interno/atores/novo`
- `/interno/atores/[id]`

A área interna permite:

- editar metadados do ator
- controlar publicação e destaque
- organizar vínculos
- ajustar a peça principal
- ordenar a leitura pública

## Home e navegação

A home passou a destacar um bloco de atores com entrada para o mapa de responsabilidade.

A navegação pública também ganhou o item `Atores`, tornando a camada fácil de encontrar a partir do menu principal.

## Conteúdo inicial

A etapa foi seedada com exemplos de atores coerentes com o universo do projeto, incluindo:

- Companhia Siderúrgica Nacional
- Prefeitura Municipal de Volta Redonda
- Hospital São João Batista
- Secretaria Municipal de Saúde
- IFRJ - Campus Volta Redonda
- SAAE

## Limitações atuais

- Ainda não existe análise automática de rede entre atores.
- Ainda não existe visualização gráfica de conexões.
- A camada não tenta resolver toda a responsabilidade pública; ela organiza a leitura editorial do que aparece recorrente.

## Próximos passos recomendados

1. Ajustar a seleção de ator em destaque por contexto editorial.
2. Melhorar a reordenação dos vínculos na interface interna.
3. Criar uma visão leve de recorrência por território ou eixo quando fizer sentido.
4. Refinar o texto público dos atores conforme novos casos forem publicados.
