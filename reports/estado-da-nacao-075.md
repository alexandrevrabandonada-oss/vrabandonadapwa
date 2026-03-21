# Estado da Nação 075: Quadro Semanal e Ritmo Operacional

## Resumo
Esta etapa entregou o **Quadro Semanal** dentro do cockpit interno do operador, transformando a tela inicial `(/interno/semana)` num verdadeiro "quadro de guerra" para ditar o ritmo da redação e da operação de dados da semana.

## Como ficou o quadro semanal
A nova home do operador (`/interno/semana`) apresenta duas grandes faixas projetadas para leitura em poucos segundos, sem burocracia de painéis complexos:

1. **Decisões Rápidas (Topo)**
   - Frente Principal da semana
   - Edição do Momento
   - Campanha em Foco
   - Peça que Sobe Hoje
   - Share Pack

2. **O Ritmo da Operação (Quadro)**
   - **Radar**: o que está quente e merece ser acompanhado.
   - **Publicar Rápido**: peças e notas de intake que devem subir com urgência.
   - **Fica pra depois (Observação)**: materiais em standby.
   - **Enriquecimento Maior**: itens que pedem dossiê ou campanha estruturada.
   - **Editorial (Edição)**: materiais que devem ser puxados para a edição semanal.
   - **Distribuição (Circulação)**: peças prontas que focarão em share packs e grupos.

## Como as prioridades são definidas
Em vez de criar fluxos paralelos genéricos de Kanban, introduzimos as tabelas enxutas `weekly_board_items` e `weekly_focus`. 
Isso permite marcar qualquer `entity_id` (de intake, editorial, dossiê, etc.) com uma "coluna" do quadro (ex: `radar`, `publish_fast`) num registro lateral. Não inchamos o banco principal e garantimos que todo o conteúdo continua fluindo por seu funil natural. As faixas de decisão rápida (`weekly_focus`) ditam o macro, enquanto os itens do quadro ditam as pendências em bloco.

## Conexão com Entrada, Enriquecimento e Editorial
- O quadro **não substitui** a fila de Enriquecimento ou o Intake.
- O quadro atua como uma **lente de prioridade** ("o que eu faço agora?").
- O fluxo contínuo permanece: Intake -> Enriquecimento -> Editorial. O Quadro Semanal apenas aponta o que desse bolo precisa de atenção *nesta semana*.

## Limites atuais
- Atualmente as atualizações das prioridades precisam ser feitas diretamente via API/Banco ou requererão a implementação dos Server Actions de "Drag/Move" nas respectivas tabelas caso se queira mover os cards via UI no futuro. A visualização, porém, já está pronta e consumindo os dados.
- O design é puramente leitura por enquanto; as marcações pontuais de prioridade ainda exigem inserção na tabela `weekly_board_items`.

## Próximos Passos
- **Botões "Marcar para a semana"**: adicionar em `/interno/entrada` e `/interno/intake` pequenos botões para injetar rapidamente os itens em `weekly_board_items`.
- **Formulário de Fast-Decision**: criar um modal na área superior do `/interno/semana` para o operador alterar as faixas de decisão (Frente Principal, Edição, etc.) sem sair da tela.
- **Conectar o botão "Subir" na tela do Quadro**: para facilitar a publicação rápida direto do Radar.
