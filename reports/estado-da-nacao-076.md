# Estado da Nação 076: Consolidação Geral do V1

## Escopo
Este relatório consolida o estado atual do VR Abandonada depois da fase de ajuste fino e da expansão da operação interna. O foco saiu de interface estrutural e entrou em produto vivo, entrada de conteúdo, enriquecimento posterior e operação cotidiana.

## Quadro geral
O V1 hoje combina três camadas que já se sustentam juntas:
- o ecossistema público, com home, Agora, Buscar, Acompanhar, Salvos, participação, dossiês, campanhas, impacto, memória, acervo, territórios, atores, padrões, linha do tempo e share packs;
- o PWA, com retomada local, leitura recente, TTS e apoio visual para baixa visão;
- o interno, agora organizado como modo operador, com central de entrada simplificada, fila de enriquecimento e superfícies internas que puxam o material recente da central para memória, acervo, dossiês, campanhas e impacto.

## O que ficou forte
### Público
- A navegação global foi reduzida ao essencial para uso diário.
- `Agora`, `Buscar`, `Acompanhar`, `Salvos` e `Menu` passaram a orientar o uso recorrente no celular.
- A home ficou mais útil para retorno sem perder a força editorial da primeira visita.
- As páginas profundas receberam wayfinding, retorno e continuidade editorial mais consistentes.
- A cronologia ganhou a camada derivada e depois a camada curada de marcos centrais.

### Acessibilidade e leitura
- O app tem skip link, landmarks claros, foco visível, melhor hierarquia de headings e contraste ajustado.
- A leitura assistida por voz funciona com painel recolhível e mini-player.
- O modo baixa visão reforça contraste, tamanho de texto e respiração visual.

### Rotina de bolso
- As telas `Agora`, `Acompanhar`, `Participe`, `Envie` e o retorno da home foram encurtadas para caber em uso curto.
- O produto já responde melhor em jornadas de 30 segundos, 2 minutos e 10 minutos.
- A microcopy ficou mais direta para ver o que mudou, salvar, seguir, continuar e mandar pista.

### Operação interna
- O interno deixou de parecer um espelho do site público e passou a operar como cockpit.
- A Central de Entrada Simplificada virou porta única de trabalho.
- A fila de Enriquecimento virou a etapa 2 natural do que foi guardado.
- Acervo, Memória, Dossiês, Campanhas e Impacto passaram a mostrar o que veio da central em bloco comum, reduzindo sensação de material “sumido”.

## Fluxo editorial-operacional
O fluxo mais estável hoje é este:
- entrada rápida na central;
- guardado ou publicado rápido;
- enriquecimento posterior na fila;
- desdobramento em memória, acervo, dossiê, campanha, impacto ou edição;
- circulação pública pela home, Agora, Buscar, Acompanhar e share packs.

## Estado do domínio e deploy
- O código foi ajustado para trabalhar com `www.vrabandonada.com.br` como host canônico.
- O apex também recebe redirecionamento para `www`.
- Houve conflito externo de DNS e de alias na Vercel durante a migração; isso é uma pendência de infraestrutura, não de lógica do app.
- A configuração do domínio ainda precisa ficar totalmente alinhada entre Registro.br, Vercel e Supabase para encerrar os rastros antigos.

## Pendências reais
- Ainda existe um erro client-side no fluxo de upload/salvamento de imagem para memória/acervo que precisa de consolidação final com o log da console do navegador.
- A superfície interna de entrada já foi endurecida, mas esse caminho ainda merece uma última confirmação de campo real antes de ser considerado fechado.
- A configuração de domínio canônico ainda depende da convergência completa do DNS externo com a Vercel.

## Limites atuais
- O quadro operacional interno é simples por desenho; ele não tenta virar CMS pesado.
- A fila de prioridade interna segue baseada em heurística de status e data, sem automação complexa.
- A curadoria editorial continua exigindo decisão humana, porque o projeto foi desenhado para reduzir fricção, não para automatizar julgamento.

## Próximos passos recomendados
- Fechar o fluxo de upload/salvamento com o erro cliente ainda pendente, usando o console do navegador como próxima pista.
- Concluir o alinhamento definitivo do domínio com o host canônico escolhido e limpar caches antigos de navegador/PWA após isso.
- Observar o cockpit interno em uso real por alguns dias e cortar apenas o que continuar competindo com a operação.
- Consolidar o quadro semanal e os sinais de prioridade caso a rotina editorial peça mais direção semanal.

## Verificação
- `npm run lint` passou.
- `npm run typecheck` passou.
- `npm run build` passou.

## Veredito
O VR Abandonada está em V1 real: público forte, leitura temporal consolidada, uso de bolso melhorado, operação interna estruturada e entrada de conteúdo já simplificada. O que sobra agora é acabamento operacional e fechamento de infraestrutura, não reconstrução de produto.
