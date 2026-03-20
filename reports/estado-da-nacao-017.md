# Estado da Nação 017

## O que foi implementado
- Criei a camada `theme_hubs` para representar eixos temáticos públicos do projeto.
- Criei `theme_hub_links` para conectar cada eixo a pautas, memória, acervo, coleções, dossiês e séries.
- Adicionei a área pública:
  - `/eixos`
  - `/eixos/[slug]`
- Adicionei a área interna:
  - `/interno/eixos`
  - `/interno/eixos/novo`
  - `/interno/eixos/[id]`
- Integrando a home, inseri um bloco de “Grandes frentes” para levar o usuário ao mapa temático do projeto.

## Como funciona a modelagem dos eixos
- Cada eixo tem:
  - título
  - slug
  - resumo
  - descrição
  - pergunta central
  - capa
  - destaque
  - visibilidade pública
  - ordem editorial
  - status
- Os status atuais são:
  - `active`
  - `monitoring`
  - `archive`
  - `draft`
- Os vínculos usam uma tabela separada para manter o eixo simples e operável.
- O vínculo aceita tipo de peça e papel editorial, sem virar knowledge graph.

## Como os vínculos foram feitos
- Cada eixo pode conectar:
  - pauta
  - memória
  - acervo
  - coleção
  - dossiê
  - série
- A estrutura do vínculo guarda:
  - tipo
  - chave da peça
  - papel editorial
  - ano ou rótulo temporal
  - nota curta
  - destaque
  - ordenação
- A página resolve essas chaves para as camadas públicas já existentes e exibe só o que está publicado.

## Como ficou `/eixos`
- A página pública abre como um mapa temático do projeto.
- Ela mostra:
  - eixo em destaque
  - explicação do que são os eixos
  - leitura por status
  - cards com os principais hubs
- A linguagem evita cara de catálogo frio e reforça o tom de “grandes frentes”.

## Como ficou `/eixos/[slug]`
- A página de eixo funciona como porta de entrada temática.
- Ela reúne:
  - abertura editorial forte
  - pergunta central
  - peça de entrada
  - timeline leve dos vínculos
  - dossiês relacionados
  - pautas relacionadas
  - memória relacionada
  - materiais de acervo
  - coleções relacionadas
  - séries relacionadas
  - últimas movimentações vindas dos dossiês ligados ao eixo
- Isso faz o eixo ficar acima do formato, não ao lado dele.

## Como o eixo reúne dossiê, pauta, memória e acervo
- O eixo cruza as camadas já existentes por meio de vínculos públicos sanitizados.
- A leitura pública pode entrar por uma frente temática e descer para:
  - o caso narrativo do dossiê
  - a pauta editorial
  - a memória da cidade
  - o documento do acervo
- O eixo também usa a última movimentação dos dossiês ligados para mostrar que a frente continua viva.

## Como ficou a área interna de eixos
- O backoffice permite:
  - listar eixos
  - filtrar por status
  - criar novo eixo
  - editar dados do eixo
  - controlar visibilidade e destaque
  - vincular peças relacionadas
  - remover vínculos
- A área interna segue o mesmo padrão editorial-sóbrio do resto do painel.

## Limitações atuais
- Não existe automação para sugerir vínculos temáticos.
- Não existe histórico de auditoria próprio para eixos.
- Não existe status de workflow complexo além do básico de publicação e arquivo.
- O eixo ainda depende de curadoria manual para manter coerência.

## Próximos passos recomendados
- Adicionar auditoria mínima para alterações de eixo.
- Permitir ordenação manual mais fina da peça de entrada e dos vínculos principais.
- Criar uma faixa de eixos em destaque na home que possa ser atualizada com mais frequência.
- Se houver volume editorial, pensar em uma página de comparação ou visão lateral entre eixos, sem virar wiki.
