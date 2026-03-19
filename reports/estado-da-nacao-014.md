# Estado da Nação 014

## O que foi implementado
- Criei a primeira camada pública de dossiês vivos em `/dossies` e `/dossies/[slug]`.
- Criei a operação interna mínima em `/interno/dossies`, `/interno/dossies/novo` e `/interno/dossies/[id]`.
- Adicionei a modelagem `investigation_dossiers` e `investigation_dossier_links` em Supabase.
- Integrei o dossiê à home como bloco de investigação em curso.
- Mantive o dossiê alimentado apenas por camadas já publicáveis: pauta, memória, acervo, coleção e série.

## Como a modelagem funciona
A base ficou enxuta:
- `investigation_dossiers` guarda o recorte editorial principal.
- `investigation_dossier_links` liga o dossiê a peças já existentes.

Campos principais do dossiê:
- título, slug, resumo e descrição
- status editorial
- imagem de capa
- destaque público
- visibilidade pública
- pergunta central
- período e território
- ordem de exibição

Os vínculos usam `link_type` e `link_key` para apontar para:
- pauta
- memória
- acervo
- coleção
- série

## Como os vínculos foram feitos
A camada de vínculo usa referências simples e explícitas:
- `editorial:slug-da-pauta`
- `memory:slug-da-memoria`
- `archive:id-do-asset`
- `collection:slug-da-colecao`
- `series:slug-da-serie`

Na área interna, o painel monta as opções a partir das peças publicáveis já existentes. Na área pública, os vínculos são resolvidos para o conteúdo certo, sem expor nada interno.

## Como ficou a área pública
A área pública agora tem duas entradas:
- `/dossies` para navegar pelas linhas de investigação
- `/dossies/[slug]` para abrir cada dossiê

A página pública do dossiê mostra:
- abertura forte com hero editorial
- pergunta central
- período e território
- percurso de leitura por tipo de vínculo
- blocos de pautas, memórias, acervo, coleções e séries relacionadas
- navegação para continuar lendo

A home também ganhou um bloco de “investigação em curso” para puxar o usuário para essa camada.

## Como ficou a área interna
A operação interna cobre:
- lista de dossiês em `/interno/dossies`
- criação em `/interno/dossies/novo`
- edição em `/interno/dossies/[id]`

A tela interna permite:
- editar título, pergunta, território, período, destaque e visibilidade
- vincular e remover peças relacionadas
- reabrir o dossiê público diretamente

## Como os vínculos entre camadas aparecem no público
O dossiê funciona como unidade de leitura:
- uma pauta publica o caso
- a memória traz o contexto histórico e territorial
- o acervo mostra documentos e fontes
- a coleção organiza o recorte documental
- a série sustenta continuidade de investigação

A página do dossiê costura tudo isso numa trilha única.

## Limitações atuais
- O vínculo com série ainda é simples e não tem uma taxonomia específica de dossiê por eixo próprio.
- Não há ordenação cronológica complexa entre peças do dossiê.
- Não existe busca avançada nem navegação por facetas dentro do dossiê.
- O modelo ainda não tem histórico de auditoria específico para alterações de dossiês.

## Próximos passos recomendados
1. Adicionar trilha de auditoria para dossiês e vínculos.
2. Criar uma linha do tempo leve do dossiê para ordenar a leitura.
3. Permitir destaque de uma peça principal por dossiê.
4. Evoluir a navegação pública com uma aba de “em curso” e outra de “fechados”.
5. Amarrar melhor dossiê e série por eixo editorial, em vez de inferência simples.
