# Estado da Nação 027

## O que foi implementado

Esta etapa adicionou a camada pública de edições / boletins / cadernos de circulação do VR Abandonada. A ideia foi condensar o ecossistema do site em sínteses editoriais compartilháveis, recorrentes e fáceis de circular fora do site, sem cair em newsletter tradicional nem em blog cronológico genérico.

## Modelagem

Foram criadas duas tabelas novas:

- `public.editorial_editions`
- `public.editorial_edition_links`

`editorial_editions` guarda a edição principal, com campos para título, slug, resumo, descrição, tipo de edição, período, data de publicação, capa, destaque, visibilidade pública, status editorial e ordenação.

`editorial_edition_links` guarda os vínculos editoriais que sustentam a edição. Os vínculos podem apontar para:

- radar
- campanhas
- impactos
- dossiês
- pautas
- padrões
- atores
- territórios
- memória
- acervo
- participação
- páginas e links externos

Os vínculos são organizados por papel editorial simples:

- `lead`
- `evidence`
- `context`
- `followup`
- `archive`

## Como ficou `/edicoes`

A página pública virou um caderno de circulação do momento.

Ela apresenta:

- hero editorial com síntese do projeto
- edição em destaque
- blocos de edições por tipo
- leitura curta para pulso do momento, temas, campanhas e arquivo
- CTA para continuar em radar, campanhas, impacto, padrões e dossiês

A página foi pensada para funcionar como porta de entrada compartilhável e recorrente, não como arquivo frio de publicações.

## Como ficou `/edicoes/[slug]`

A página individual da edição organiza a síntese em uma leitura curta e forte:

- abertura editorial
- status público e tipo da edição
- peça central para começar a leitura
- blocos do que mudou
- blocos por tipo de vínculo
- próximos caminhos para radar, campanhas, impacto, padrões, dossiês e participação
- metadados sociais próprios para circulação externa

A edição funciona como um recorte curado do que importa agora, com caminho claro para aprofundar no restante do site.

## Como a camada conversa com as outras partes do site

As edições atravessam:

- radar
- campanhas
- impactos
- dossiês
- pautas
- padrões
- atores
- territórios
- memória
- acervo
- participação

A função desta camada é transformar o que está espalhado pelo ecossistema em um caderno público curto, compartilhável e editorialmente legível.

## Área interna

Foram criadas rotas internas para listar, criar e editar edições:

- `/interno/edicoes`
- `/interno/edicoes/novo`
- `/interno/edicoes/[id]`

A área interna permite:

- criar e editar edições
- controlar publicação e destaque
- definir tipo e período
- vincular peças relacionadas
- organizar a hierarquia da leitura pública
- remover vínculos diretamente da interface

## Home e navegação

A home passou a destacar uma edição do momento, funcionando como síntese editorial recorrente daquilo que está em circulação.

A navegação pública também ganhou `Edições`, tornando a camada fácil de encontrar a partir do menu principal.

## Share e circulação

A etapa entrou já pensando em circulação externa:

- capa social própria para a listagem e para a edição individual
- leitura mobile mais direta
- metadados Open Graph e Twitter para o link compartilhado
- fallback visual coerente quando não houver capa real

## Conteúdo inicial

A etapa foi seedada com edições suficientes para demonstrar a proposta, incluindo:

- uma edição do momento / pulso da cidade
- uma edição temática
- uma edição de arquivo

## Limitações atuais

- Ainda não existe cadência editorial automática; a síntese depende de curadoria.
- Ainda não existe pinagem automática entre radar e edição.
- Ainda não existe uma rotina de fechamento e abertura de edição baseada em calendário real.
- A camada não tenta substituir newsletter ou social feed; ela só organiza a leitura pública do que já existe.

## Próximos passos recomendados

1. Destacar automaticamente a edição mais pertinente a partir do radar ou da campanha ativa.
2. Criar uma edição fixa por campanha ou dossiê quando houver um foco forte em circulação.
3. Ajustar a seleção de links principais para reforçar a tese editorial da edição.
4. Refinar os textos e capas de circulação conforme novos casos forem publicados.
