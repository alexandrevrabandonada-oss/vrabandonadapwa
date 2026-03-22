# Estado da Nação 077: Ingestão Inteligente e Captura Universal

## Resumo
A operação de entrada do projeto foi simplificada com a implementação do **Fluxo de Captura Universal**.
Ele substitui a sobrecarga inicial das rotas antigas (`/interno/intake` e `/interno/entrada`) por uma única superfície que perdoa erros, não perde arquivos e funciona rapidamente no notebook ou celular.

## O novo fluxo de captura
A tela `/interno/capturar` agora é o centro do cockpit:
1. **Composer Híbrido**: Uma única caixa aceita texto livre, links e arquivos. O operador decide na hora sem preencher dezenas de metadados.
2. **Upload Seguro Primeiro**: Toda imagem, PDF ou mídia sobe imediatamente para o novo bucket genérico do Storage (`universal_captures`). O arquivo não quebra esperando o preenchimento da taxonomia.
3. **Inbox de Triagem**: O material capturado desce vivo e salvo para a Inbox na mesma página, esperando a segunda etapa.

## Sugestão de Tipo
O sistema lê a extensão/MIME do arquivo e propõe internamente o `suggested_type`:
- `audio`, `video`, `pdf`, `image`.
- Arquivos de imagem marcam `suggested=photo`, PDFs viram `suggested=doc`. Textos puros com links viram `suggested=link`.
Isso adianta a classificação na hora de enviar definitivamente para o Acervo ou Editorial, mas não é um bloqueio taxativo na entrada.

## A Inbox de Entradas
Uma área visual tipo Kanban-lite que segura tudo que tem o status `inbox`. Os cards têm:
- Prévia do que foi colado (com suporte a ver o arquivo num clique).
- Data e tipo sugerido.
- Ações rápidas de esvaziamento para a direção certa:
  1. **Publicar (Agora)** -> Vai rápido pra rua.
  2. **Guardar (Acervo)** -> Vai rápido pra memória do site sem textão.
  3. **Revisar Depois** -> Material complexo que entra na fila de editorial real.

## Isolamento de rotas frágeis
A complexidade das rotas velhas foi empurrada para o agrupamento "Triagem Legada (Avançada)" do menu. Elas não morrem, para não quebrar rascunhos em aberto, mas saem da frente do operador cansado.
Agora, quem entra no sistema, cai primeiro no `/interno/capturar`.

## Limitações atuais
- O campo "Revisar Depois" apenas muda o status na camada de dados por enquanto, mas logo ganhará integração total no roteador do Enriquecimento.
- Não existem gatilhos profundos de auto-tagging. Toda classificação fina ainda exigirá a interferência do humano na etapa 2 (via Acervo ou Dossiê).

## Próximos Passos recomendados
- Ligar os botões "Publicar / Guardar" aos `Server Actions` definitivos das tabelas finais do Supabase (`editorial_items` e `memory_items`).
- Desenhar a view de transição de **Inbox para Dossiê**.
- Adicionar drag-and-drop completo no frontend (por agora, o `input type="file"` resolve de modo simples e bullet-proof).
