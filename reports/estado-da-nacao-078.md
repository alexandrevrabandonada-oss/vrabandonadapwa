# Estado da Nação 078: Destinos Finais da Captura Universal

## Resumo
A Inbox de captura deixou de ser apenas uma área intermediária de "intenção" e passou a ser o **Ponto de Distribuição Real** do sistema.
Agora, as ações rápidas "Publicar (Agora)", "Guardar (Acervo)" e "Revisar Depois" mapeiam perfeitamente os uploads enxutos para os esquemas finais de publicação, memória e enriquecimento, fechando o ciclo da Ingestão Universal.

## Como os destinos finais foram conectados
O botão clicado na tela da Inbox executa Server Actions (`lib/captura/actions.ts`) que leem os dados primários (título, arquivo subido, sugestão de tipo) e inserem nas tabelas maduras do projeto:

1. **Publicar (Agora)**
   - O item entra rasgando na tabela `editorial_items` com a categoria `post` e status `published`.
   - Já possui o `cover_image_url` proveniente do upload e o campo `body` preenchido.
   - Ideal para furos ou notas rápidas. Foco: Velocidade.

2. **Guardar (Acervo)**
   - O item não é diluído na pressa: vai para `memory_items`.
   - Ganha automaticamente o status seguro (`archived`), assumindo `period_label` = 'Sem data' e cai na coleção mestre do Acervo Bruto.
   - Ideal para documentos e imagens soltas que não demandam pauta diária. Foco: Preservação.

3. **Revisar Depois (- Enriquecimento)**
   - O item é injetado diretamente na tabela raiz `editorial_entries` com status de `ready_for_enrichment`.
   - Essa ação conecta brutalmente a captura com a tela `/interno/enriquecer`, populando aquela fila imediatamente para tratamento em lote posterior com o Editor/Coordenador. Foco: Refinamento.

## O Pré-preenchimento
Tudo que o operador digitou no composer (texto livre) ou subiu (imagem, pdf), bem como a adivinhação do sistema (`suggested_type`), são descarregados nestas tabelas afins: o `file_url` vira o `cover_image_url`, o texto base preenche os `excerpt`/`details`. Isso garante o fim do retrabalho.

## Confirmação ao Operador
A tela enxuta substituiu loaders mortos por um _feedback message inline_ robusto: em caso de sucesso, o grupo de botões do cartão pisca uma mensagem assertiva (verde): "O material está seguro e guardado no Acervo." (e trava os demais cliques para evitar duplicidades), esperando a página recarregar a visualização limpa.

## Limitações Atuais
- Entregamos a criação técnica perfeita dos itens legados, por ora as integrações nos esquemas mais antigos não enviam Push Notification para celulares automáticos (ex: PWA Broadcast).

## Próximos Passos
- Expandir o modal de _"Revisar Depois"_ (se for uma escolha proativa em vez de um clique só) para que a pessoa já consiga preencher "Bairro" ou "Ator" antes de dropar no Enriquecimento, poupando 10 segundos da equipe de redação no final da linha.
- Excluir tecnicamente os arquivos (`.tsx`) antigos da `entrada`, despoluindo a `/app`.
