# Fábrica de Reels v0.7 — renderização previsível (01/11/2026)

**Uso interno; não aprovado para publicação.** Continuidade da PR #44. Acervo privado não enviado ao GitHub.

## Entregue e verificado localmente
- `studio/fast_stills.py`: cache LRU limitado a 96 MiB para fotografias com câmera virtual; fallback seguro quando excede o limite e estatísticas de uso. Não estiliza documentos primários.
- `studio/visual_grammar.py`: máscaras de transições industrial/impresso memorizadas por estilo e resolução, evitando refazer malhas trigonométricas quadro a quadro. As transições mantêm correspondência visual com v0.6.
- Integração no `factory.py`; número de acertos/faltas e bytes residentes aparece no JSON de renderização.
- **52 testes locais passaram e um foi ignorado**; novos testes comparam fotografia à implementação anterior, limitam memória, e comparam as três transições com o algoritmo v0.6.
- **A/B concluído a 24 fps para ambas as versões** (12,625 s, 303 quadros, 540×960, H.264, sem voz). Os dois renders locais finalizaram em **18,25 s** e **18,31 s**. QA de quadros não apontou quadros pretos amostrados; publicação continua **bloqueada**.

## Medição local indicativa — não extrapolar para o filme inteiro

| Operador medido | v0.6 | v0.7 | Resultado |
|---|---:|---:|---|
| 42 quadros de `slag_reveal` | 1,031 s | 0,124 s | ~8,3× no operador |
| 42 quadros de `print_registration` | 1,132 s | 0,145 s | ~7,8× no operador |
| 70 quadros completos de uma cena fotográfica | 4,558 s | 4,469 s | ganho ~2% |

Medições únicas, no mesmo ambiente, não representativas de outras máquinas; a melhoria relevante foi reduzir custo de transições e completar o A/B em taxa uniforme.

## Notas internas da maturidade da FÁBRICA
| Dimensão | Peso | v0.6 | v0.7 |
|---|---:|---:|---:|
| Direção por cena | 25% | 6,5 | 6,5 |
| Acervo e direitos | 20% | 5,3 | 5,3 |
| Voz / sincronização | 15% | 5,2 | 5,2 |
| Composição / render | 15% | 7,5 | 8,2 |
| QA audiovisual | 10% | 8,5 | 8,7 |
| Integridade editorial | 10% | 7,6 | 7,6 |
| Reutilização / testes | 5% | 9,4 | 9,6 |
| **Total ponderado** | **100%** | **6,67** | **6,80** |

As notas são autoavaliações, não certificações. A nota artística do Reel V7 segue **6,63/10**: não houve Reel profissional novo aprovado.

## Portões que continuam fechados
- MP3 da voz profissional Alexandre já gerada no ElevenLabs ainda **não transferido**, logo não há narração/legendas reais sincronizadas no vídeo.
- Origem/licença/captura das fotos industriais e direitos de reprodução do jornal não foram concluídos; não tratar fotos como flagrantes de 1962.
- Faltam vídeos documentais com ação, edição conduzida pela fala, master vertical nativo 1080×1920/30fps desta montagem, QA mobile e avaliação estética independente.
- **Publicação automática bloqueada**. Melhorias de velocidade não equivalem a melhoria criativa.

## Direção v0.8
Priorizar importação da gravação já gerada, biblioteca licenciada de vídeo real, criação de planos com ação, direção de montagem e avaliação de três reportagens em temas distintos.