# Estado da Nação 042

## Resumo executivo

A etapa seguinte da acessibilidade de leitura assistida foi aplicada nos blocos de memória e acervo, que são os trechos mais úteis para visão residual e TTS em uso cotidiano.

A intenção foi simples: tornar os cards e páginas desses dois núcleos mais fáceis de ler com os olhos, com voz e com apoio visual, sem criar uma nova camada de produto.

## O que foi ajustado

- Os cards de memória passaram a marcar título e resumo como blocos mais legíveis para a camada de leitura assistida.
- Os cards de acervo passaram a marcar título e resumo do mesmo jeito.
- Os cards de coleção de memória também foram marcados como blocos de leitura.
- O modo baixa visão ganhou reforço visual específico para os blocos de memória e acervo.
- O assistente de leitura por voz já instalado no shell passou a reconhecer melhor esses blocos editoriais.

## O que isso muda no uso real

- A pessoa com baixa visão encontra títulos mais claros e trechos mais concentrados.
- O leitor de voz passa a navegar melhor entre blocos de memória e acervo.
- Os cards ficam menos ruidosos e mais fortes visualmente quando o modo baixa visão está ligado.
- A leitura continua local, sem login e sem sincronização.

## Componentes priorizados

- `MemoryCard`
- `ArchiveAssetCard`
- `MemoryCollectionCard`
- shell global com `ReadingAssistant`

## Como ficou a leitura assistida nesses trechos

- Títulos e resumos dos cards entram com marcação explícita para a leitura.
- O destaque visual da seção atual continua funcionando.
- O assistente de voz segue lendo por blocos públicos, sem depender de navegação interna.
- O modo baixa visão deixa os cards de memória e acervo mais respiráveis.

## Limitações atuais

- Ainda não há leitura por voz específica por card isolado, apenas por bloco editorial da página.
- Não existe ajuste fino de voz ou exportação de áudio.
- A experiência depende do TTS nativo disponível no navegador/dispositivo.
- A leitura assistida continua sendo local no dispositivo.

## Próximos passos recomendados

- Refinar outros cards densos, se o uso real mostrar necessidade.
- Ajustar ordem de leitura em páginas de memória/acervo muito longas.
- Reforçar contraste de imagens/capas em cenários de baixa visão mais severa.
- Manter a leitura assistida como parte do shell, não como feature separada.

## Checklist desta etapa

- [x] Memória com marcação melhor para leitura assistida
- [x] Acervo com marcação melhor para leitura assistida
- [x] Coleções de memória marcadas como blocos de leitura
- [x] Modo baixa visão reforçado nesses blocos
- [x] Compatibilidade com TTS nativo mantida
- [x] Sem login, sem nuvem, sem nova macrocamada

## Decisão

**Implementado com sucesso.**

O VR Abandonada ficou um pouco melhor para leitura real com visão residual e voz, especialmente onde o arquivo vivo é mais denso e mais útil.
