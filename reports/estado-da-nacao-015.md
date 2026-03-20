# Estado da Nação 015

## O que foi implementado
- Evoluí os dossiês para um percurso público mais claro.
- Adicionei status narrativos úteis: `in_progress`, `monitoring`, `concluded` e `archived`, mantendo compatibilidade com o legado `published`.
- Marquei uma peça central por dossiê via vínculo com papel `lead`.
- Criei uma timeline leve para ordenar marcos, documentos e desdobramentos.
- Atualizei a área pública e a área interna para operar essa hierarquia.

## Como funcionam os novos status
Os dossiês agora aparecem como investigação em andamento, monitoramento, concluída ou arquivada.

Na prática:
- `/dossies` agrupa os casos por status.
- `/dossies/[slug]` mostra o status logo na abertura.
- O painel interno permite escolher o status ao editar o dossiê.

A implementação mantém tolerância a registros antigos com `published`, tratando esse valor como concluído na leitura.

## Como funciona a peça principal
Cada dossiê pode ter uma entrada central marcada pelo vínculo com papel `lead`.

Essa peça é usada para:
- mostrar por onde começar
- abrir o caso com uma entrada única
- separar a peça principal do restante do contexto documental

Se não houver vínculo `lead`, a página cai para a primeira peça vinculada.

## Como a timeline foi modelada
A timeline usa os vínculos do dossiê e campos leves:
- `link_role`
- `timeline_year`
- `timeline_label`
- `timeline_note`

A ordem pública é construída por ano, papel e ordenação manual. Isso permite mostrar marcos sem criar um workflow pesado ou uma cronologia rígida demais.

## Como os papéis dos vínculos foram usados
Os vínculos agora carregam uma função editorial:
- `lead` para a peça central
- `evidence` para prova documental
- `context` para memória e contexto
- `followup` para desdobramentos
- `archive` para material-base

Isso ajuda a leitura a entender o papel de cada peça dentro do caso.

## Como ficou `/dossies`
A listagem pública ficou mais orientada:
- herói editorial com destaque
- bloco de status narrativo
- grupos por estágio da investigação
- séries e contexto geral no fim da página

Agora a página não parece só uma vitrine de cards; ela separa o que está em curso, monitorando, concluído ou arquivado.

## Como ficou `/dossies/[slug]`
A página individual agora mostra:
- hero com status
- pergunta central
- peça central do caso
- timeline leve
- blocos por papel editorial dos vínculos
- continue lendo com memória, acervo e série

O percurso ficou mais claro: entrada principal, prova, contexto e desdobramento.

## Como ficou a área interna
A área interna passou a permitir:
- editar o status narrativo do dossiê
- marcar destaque e visibilidade
- definir a peça central
- editar papel, ano, rótulo temporal e nota de timeline dos vínculos
- ver a ordem editorial da investigação de forma explícita

## Limitações atuais
- A timeline ainda é leve e depende de preenchimento manual.
- O vínculo principal é definido por papel, não por um campo exclusivo de peça central.
- Não há histórico de auditoria específico de dossiês ainda.
- O suporte a `published` existe como compatibilidade, mas o novo fluxo já trabalha com os status atuais.

## Próximos passos recomendados
1. Criar auditoria mínima para dossiês e vínculos.
2. Permitir edição direta do papel de um vínculo existente.
3. Adicionar uma peça principal editorial fixa por dossiê, se o projeto quiser separar isso do papel `lead`.
4. Evoluir a timeline com poucos marcos curados por caso.
5. Criar uma visão pública de dossiês fechados versus em curso.
