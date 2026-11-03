# VR Abandonada — Fábrica de Reels v0.4 (01/11/2026)
**Protótipo interno. Não publicável.** Mantém o mesmo ramo da PR #44, sem merge nem alteração no site.

## Execução
- Novo `beatcut.py`: cada cena pode registrar início, duração, motivo do corte e âncora textual ao roteiro; valida cortes fora da cena, marcas duplicadas e frases inexistentes no roteiro. **Isso é planejamento editorial, NÃO sincronização confirmada com áudio real.**
- Novo `motion.py`: câmera com 2 a 12 keyframes por cena; interpolation e limites de zoom, duração e posição.
- Novo `layout.py`: largura real do texto e quebra controlada de linha; corrigiu encerramento que cortava a expressão “O QUE AINDA NÃO SABEMOS?”.
- Novo `benchmark.py`: exige ao menos três temas distintos com score humano interno e externo ≥9,5, direitos, QA técnico, sincronização e revisão mobile antes de afirmar maturidade 10/10.
- Testes locais executados: **36 aprovados**. Os testes também exercitam um vídeo sintético em movimento com uma faixa sonora sintética.
- Render local de 22,94 segundos, 540×960, 18 fps, sem áudio, com sete cenas de imagens recebidas e recortes literais de jornal. O modo final 1080×1920 a 30 fps ainda não foi verificado nessa montagem.

## Autoavaliação da capacidade da fábrica
| Critério | Peso | v0.3 | v0.4 |
|---|---:|---:|---:|
| Direção por cena | 25% | 5,5 | 6,2 |
| Acervo e direitos | 20% | 5,0 | 5,0 |
| Voz e sincronização | 15% | 4,0 | 4,0 |
| Composição e renderização | 15% | 6,6 | 7,0 |
| Auditoria audiovisual | 10% | 7,5 | 7,9 |
| Integridade editorial | 10% | 7,3 | 7,3 |
| Testes e reutilização | 5% | 8,5 | 8,9 |
| **Total interno** | **100%** | **5,87** | **6,17** |

Notas internas aproximadas, não avaliação independente ou certificação profissional. Nota artística do Reel V7 **continua 6,63/10**.

## Limitações ainda críticas
A voz profissional Alexandre foi gerada no ElevenLabs (segunda tomada 20,71s), mas não pôde ser transferida ao ambiente de renderização. Não existe sincronização real de fala, cortes e legendas. Falta filmagem real com movimento e direitos comprovados; a demonstração continua sendo principalmente fotografia animada. A checagem do manifesto bloqueia publicação por direitos pendentes, voz ausente, legendas sem conferência e revisão editorial não realizada.

## Próximos gates v0.5
1. Integrar o MP3 já existente sem nova cobrança e alinhar a fala por palavras com revisão humana.
2. Produzir três demonstrações em temas independentes, com filmagens licenciadas e versões contrastantes de linguagem cinematográfica.
3. Medir qualidade em dispositivo móvel, revisão externa e 1080×1920, 30fps no master real.
4. Preservar arquivo e fact-check. **Não publicar nem fazer merge sem autorização.**
