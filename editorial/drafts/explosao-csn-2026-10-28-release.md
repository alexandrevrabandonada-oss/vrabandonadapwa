# Liberação de notícia CSN — processo editorial

**Ainda não publicada**. O arquivo final continua dentro de editorial/drafts, com revisão falsa, sem data de publicação e sem fotografia não verificada.

## Informação nova da noite de 28/10/2026
A Polícia Civil investiga a explosão e informou que faria perícia após o trabalho de rescaldo, conforme reportagem da Agência CNN Brasil republicada no Sim Notícias às 18h45. Não há laudo ou responsabilização documentados nesta checagem. Fonte: https://simnoticias.com.br/cnn-brasil/policia-investiga-explosao-apos-reacao-quimica-na-csn-em-volta-redonda-rj/

## Como liberar após revisão e autorização editorial
1. Revisar e atualizar as 10 fontes, 16 blocos, data e eventual imagem original.
2. Para simular sem criar arquivo: executar node scripts/promote-editorial-draft.mjs --draft editorial/drafts/explosao-csn-2026-10-28.json --published-at DATA_ISO_COM_FUSO_REAL. A data deve ser substituída pelo momento efetivo, não por uma data hipotética.
3. Somente após decisão explícita: repetir o comando com --approve. Será criado um único arquivo em content/materias com slug canônico. A operação recusa sobrescrever uma publicação anterior.
4. Revisar o diff da PR, executar os testes, conferir a prévia do portal e então autorizar merge. Gravar um arquivo não equivale a publicar no site de produção.

## Imagens
Busca de imagem retornou incêndios na CSN de 2023 e 2024; nenhuma delas é adequada como registro do episódio de 28/10/2026. Crédito da Folha ao VR Abandonada não equivale à recuperação do arquivo original. Se não houver original comprovado, deixar sem cover e usar a imagem OpenGraph editorial automática.

## Limiar de afirmações
O incêndio inicial e a ausência de vítimas decorrem de comunicado dos Bombeiros. A umidade foi informada pela CSN, não validada como causa-raiz por perícia independente. Polícia Civil anunciou investigação e perícia, não há comprovação de conclusão. INEA foi acionado, não se confirmou laudo ou autuação. Não atribuir toxicidade, danos ou culpados sem laudos.
