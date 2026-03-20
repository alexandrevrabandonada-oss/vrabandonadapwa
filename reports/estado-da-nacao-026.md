# Estado da Nação 026

## O que foi implementado

Esta etapa adicionou a camada pública de padrões / recorrências do VR Abandonada. O objetivo foi dar uma superfície própria para ler o que se repete na cidade: atores, territórios, impactos, disputas e continuidades.

## Modelagem

Foram criadas duas tabelas novas:

- `public.pattern_reads`
- `public.pattern_read_links`

`pattern_reads` guarda a hipótese estrutural pública. Ele reúne título, slug, resumo, descrição, tipo de recorrência, pergunta central, status editorial, destaque, visibilidade e ordenação.

`pattern_read_links` guarda os vínculos editoriais que sustentam a leitura estrutural. Os vínculos podem apontar para pauta, memória, acervo, coleção, dossiê, campanha, impacto, eixo, território, ator, página ou link externo.

Os papéis editoriais disponíveis são:

- `lead`
- `evidence`
- `context`
- `followup`
- `archive`

## Como ficou `/padroes`

A página pública virou um mapa de leitura estrutural:

- hero com a ideia de recorrência
- bloco explicando o que são os padrões
- contadores por status
- padrão em destaque
- lista de padrões ativos, em monitoramento e em arquivo
- CTA para continuar lendo em atores, territórios, dossiês, campanhas e impacto

## Como ficou `/padroes/[slug]`

A página individual do padrão organiza a hipótese e o percurso:

- abertura forte
- pergunta central
- status e tipo do padrão
- peça central para começar a leitura
- timeline leve
- blocos separados por tipo de vínculo
- leitura de o que o padrão revela e o que continua em aberto
- navegação para continuar em atores, territórios, impacto e dossiês

## Como a camada conversa com as outras partes do site

Os padrões atravessam:

- atores
- territórios
- campanhas
- impactos
- dossiês
- pautas
- memória
- acervo e coleções
- eixos

A função desta camada é sair da soma de peças e mostrar recorrência, repetição e estrutura.

## Área interna

Foram criadas rotas internas para operar os padrões:

- `/interno/padroes`
- `/interno/padroes/novo`
- `/interno/padroes/[id]`

A área interna permite:

- criar e editar padrões
- controlar publicação e destaque
- definir hipótese central
- ordenar a leitura
- vincular peças relacionadas
- remover vínculos

## Home e navegação

A home ganhou um bloco de leitura estrutural que destaca um padrão em curso.

A navegação pública também ganhou `Padrões`, tornando a camada fácil de encontrar a partir do menu principal.

## Conteúdo inicial

A etapa entrou com padrões seedados para demonstrar a proposta:

- recorrência da poeira industrial
- centro, espera e abandono
- saúde, espera e desgaste
- o arquivo que retorna

## Limitações atuais

- Não existe grafo complexo nem análise automática de rede.
- Não existe leitura estatística pesada.
- A camada depende de curadoria editorial para manter a hipótese coerente.

## Próximos passos recomendados

1. Refinar os padrões com material real conforme a operação avançar.
2. Ajustar a curadoria do padrão em destaque na home.
3. Criar uma leitura cruzada de padrões por território ou ator quando fizer sentido.
4. Considerar uma navegação lateral entre padrões vizinhos, se a densidade editorial crescer.
