# Estado da Nação 022

## O que foi implementado
- Nova camada pública de campanhas/chamados em `/campanhas`.
- Página individual de campanha em `/campanhas/[slug]`.
- Painel interno para criar, editar e organizar campanhas em `/interno/campanhas`.
- Integração das campanhas na home e no radar `/agora`.
- Estrutura editorial para condensar investigação, participação, método e apoio em focos temporários.

## Modelagem
- Tabela `public.public_campaigns`.
- Tabela `public.public_campaign_links`.
- Estados públicos: `upcoming`, `active`, `monitoring`, `closed`, `archived`.
- Tipos de campanha: `call`, `collection`, `pressure`, `memory`, `support`, `investigation`.
- Tipos de vínculo: `editorial`, `memory`, `archive`, `collection`, `dossier`, `series`, `hub`, `page`, `external`.
- Papéis editoriais dos vínculos: `lead`, `evidence`, `context`, `followup`, `archive`.

## Como ficou `/campanhas`
- Abre com hero editorial e explicação do que é um chamado temporário.
- Mostra campanha em destaque.
- Separa campanhas ativas, em monitoramento e arquivadas.
- Mantém leitura curta e forte, sem cara de calendário ou marketing.

## Como ficou `/campanhas/[slug]`
- Mostra abertura forte com status e tipo.
- Explica o que está em jogo.
- Destaca a peça central do chamado.
- Agrupa vínculos por papel editorial.
- Leva para participação, método, radar e apoio.

## Como conversa com radar, participação e método
- O radar puxa campanhas ativas e em monitoramento como parte do pulso do momento.
- A home mostra um bloco curto de chamado em curso.
- A campanha aponta para `/participe`, `/envie` e `/metodo` para converter leitura em ação responsável.

## Área interna
- `/interno/campanhas` lista e filtra campanhas por status.
- `/interno/campanhas/novo` cria o foco temporário.
- `/interno/campanhas/[id]` edita dados e vínculos.
- O painel permite ordenar, destacar e manter a campanha publicável sem criar um CMS pesado.

## Conteúdo inicial
- Duas campanhas seeds foram adicionadas para demonstrar a proposta:
  - uma ativa
  - uma em monitoramento
- Os vínculos cruzam pautas, dossiês, eixos, memória, acervo e caminhos de participação.

## Limitações atuais
- Ainda não há trilha de auditoria específica para campanhas.
- Não há sistema de atualização automática de campanhas.
- A curadoria ainda depende de edição manual.
- Não existe histórico público de mudanças da campanha.

## Próximos passos recomendados
- Adicionar auditoria leve para criação/edição de campanhas.
- Permitir destaque editorial mais fino de uma campanha principal no radar.
- Criar uma atualização curta para campanhas em curso, se houver necessidade real.
- Reforçar campanhas sazonais sem perder a clareza do foco temporário.
