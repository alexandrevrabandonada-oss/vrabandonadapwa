# Estado da Nação 034

## O que foi implementado

Esta etapa criou uma camada curada de marcos centrais acima da cronologia derivada já existente.

O VR Abandonada agora tem:
- a cronologia transversal derivada em `/linha-do-tempo`
- a nova camada editorial de marcos em `/linha-do-tempo/marcos/[slug]`
- o painel interno de curadoria em `/interno/cronologia/marcos`
- a operação de criação, edição, vínculo e ordenação desses marcos sem abandonar a cronologia ampla

A mudança principal não foi aumentar o volume de dados, mas separar duas leituras:
- a cronologia ampla continua sendo o índice transversal da cidade
- os marcos curados passam a destacar rupturas, origens, reaparições e consequências que realmente estruturam a leitura histórica

## Como funciona a modelagem dos marcos curados

Foi criada a migration [`supabase/migrations/0025_timeline_highlights.sql`](C:/Projetos/VR%20Abandonada/supabase/migrations/0025_timeline_highlights.sql) com duas tabelas:
- `timeline_highlights`
- `timeline_highlight_links`

Campos principais do marco:
- `title`
- `slug`
- `excerpt`
- `description`
- `highlight_type`
- `date_label`
- `year_start`
- `year_end`
- `period_label`
- `lead_question`
- `cover_image_url`
- `featured`
- `public_visibility`
- `status`
- `sort_order`

Tipos editoriais usados:
- `origin`
- `rupture`
- `recurrence`
- `consequence`
- `turning_point`
- `archive_marker`
- `investigation_marker`

Os vínculos permitem conectar o marco a:
- pauta
- memória
- dossiê
- atualização de dossiê
- campanha
- impacto
- território
- ator
- padrão
- acervo e coleção
- edição

A modelagem é leve: o marco não vira banco histórico novo, nem grafo, nem camada técnica pesada. Ele só destaca uma virada temporal e reúne as peças que a sustentam.

## Como a nova camada convive com a cronologia derivada

A cronologia derivada continua em [`app/linha-do-tempo/page.tsx`](C:/Projetos/VR%20Abandonada/app/linha-do-tempo/page.tsx) e em [`lib/timeline/queries.ts`](C:/Projetos/VR%20Abandonada/lib/timeline/queries.ts).

Agora essa cronologia também recebe os marcos curados como uma família própria de entradas públicas, com tipo `marco`, sem substituir o índice amplo.

Na prática, o usuário passa a ver:
- a linha do tempo ampla, que cruza tudo o que já existe no projeto
- os marcos centrais, que apontam as viradas mais fortes

Isso evita que a cronologia vire só uma listagem de datas. Ela continua ampla, mas ganha hierarquia editorial.

## Como ficou `/linha-do-tempo`

A página pública [`app/linha-do-tempo/page.tsx`](C:/Projetos/VR%20Abandonada/app/linha-do-tempo/page.tsx) agora tem um bloco próprio de marcos centrais.

Ela passou a mostrar:
- hero de cronologia transversal
- filtros leves por termo, tipo, território, ator, período e ordem
- atalhos editoriais de busca
- bloco de marcos centrais curados
- cronologia ampla abaixo disso

A entrada para os marcos centrais está ancorada no trecho `marcos-centrais`, com destaque para rupturas, reaparições e consequências.

## Como ficou a página individual do marco

A rota pública [`app/linha-do-tempo/marcos/[slug]/page.tsx`](C:/Projetos/VR%20Abandonada/app/linha-do-tempo/marcos/%5Bslug%5D/page.tsx) reúne:
- abertura forte do marco
- tipo editorial do marco
- pergunta central ou tese
- peça de apoio e vínculos sustentando a leitura
- relação com dossiê, campanha, impacto, território, ator, padrão, memória e acervo
- caminho de volta para a cronologia ampla, busca, radar e acompanhamento

Essa página também ganhou ações locais de:
- salvar a leitura
- seguir o marco no PWA local

Quando o usuário abre a cronologia derivada e chega num item do tipo `marco`, a navegação converte para a rota canônica do marco curado.

## Como a camada conversa com territórios, atores, impacto, campanhas e busca

A nova camada se integra às outras frentes já existentes:
- `territórios` e `atores` ajudam a ler onde e por quem a cidade se reorganiza
- `impacto` e `campanhas` ajudam a ler consequência e pressão pública
- `dossiês` e `updates` sustentam o encadeamento temporal do caso
- `buscar` passa a apontar para marcos centrais quando isso faz sentido

Também foram feitas as pontes para que o tipo `marco` passe a existir no ecossistema local de busca, salvos, acompanhar e navegação.

## Como ficou a área interna

A operação interna dos marcos ficou em:
- [`app/interno/cronologia/marcos/page.tsx`](C:/Projetos/VR%20Abandonada/app/interno/cronologia/marcos/page.tsx)
- [`app/interno/cronologia/marcos/novo/page.tsx`](C:/Projetos/VR%20Abandonada/app/interno/cronologia/marcos/novo/page.tsx)
- [`app/interno/cronologia/marcos/[id]/page.tsx`](C:/Projetos/VR%20Abandonada/app/interno/cronologia/marcos/%5Bid%5D/page.tsx)
- [`app/interno/cronologia/marcos/actions.ts`](C:/Projetos/VR%20Abandonada/app/interno/cronologia/marcos/actions.ts)

Essa área permite:
- criar marco curado
- editar texto, data, tipo e status
- marcar destaque
- ordenar a leitura
- vincular peças relacionadas
- remover vínculos

A área interna continua separada da camada pública. Só o que estiver publicado e visível entra na página pública.

## Como a home aponta essa camada

A home em [`app/page.tsx`](C:/Projetos/VR%20Abandonada/app/page.tsx) ganhou um bloco curto de marcos da cidade.

Ela agora mostra:
- uma edição do momento
- a cronologia ampla
- os marcos curados que estruturam a leitura histórica

Isso faz a home apontar não só o presente e a síntese, mas também os marcos que moldam a memória pública do projeto.

## Limitações atuais

- A cronologia derivada continua sendo a base principal; os marcos curados são uma camada editorial acima dela, não uma reconstrução total do modelo temporal.
- Ainda não existe uma visualização temporal sofisticada por ruptura, origem e consequência.
- A área interna de marcos está operacional, mas a curadoria ainda depende da equipe editar manualmente cada item.
- O diagnóstico interno da cronologia ampla continua focado em lastro temporal; os marcos curados são outra leitura, separada.
- Há alguns avisos de lint em módulos compartilhados da cronologia, sem impacto na compilação.

## Próximos passos recomendados

1. Criar uma visualização temporal mais explícita por virada, origem e consequência.
2. Destacar automaticamente marcos curados na cronologia ampla quando houver peso editorial suficiente.
3. Aprofundar a ligação entre marcos e campanhas ativas.
4. Reforçar o painel interno de cronologia com um bloco resumido dos marcos centrais.
5. Explorar uma versão visual mais forte da linha do tempo para mobile.
