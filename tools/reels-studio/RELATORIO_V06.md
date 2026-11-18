# Fábrica de Reels — rodada v0.6 (01/11/2026)

**Protótipo interno: sem publicação nem merge.** Evolução do mesmo projeto da PR #44.

## Implementado
- `studio/visual_grammar.py`: `print_registration`, `slag_reveal`, `press_gate` e `hard_cut`. Cada efeito tem duração limitada a 0,45s. Montagem não modifica o original nem reconstitui eventos reais.
- `studio/voice_delivery.py`: importação de áudio **já gerado** por arquivo local. Valida codec/duração, preserva bytes e SHA-256, não sobrescreve tomadas anteriores, não solicita créditos de TTS, e deixa `timings_verified=false`.
- `studio/variants_v06.py`: duas variantes A/B mantendo imutáveis imagens/fontes/direitos, redação e referências.
- Motor `factory.py` aplica transições declaradas no manifesto e mantém os bloqueios editoriais.
- **45 testes locais aprovados, 1 skip**. O conjunto autocontido é testado também no GitHub Actions.
- MP4 local interno de **12,625s, 540×960, 24fps, sem narração**. Uma variante sóbria a 24fps e uma expressiva de comparação a 8fps foram produzidas; o render expressivo inteiro a 24fps excedeu o limite de execução disponível. Isso é um problema de desempenho a resolver.

## Fatos e direitos
As fotografias e a página do jornal `A Noite` foram enviadas pelo usuário, mas seus direitos e metadados autorais permanecem pendentes. Nenhuma fotografia de data desconhecida é apresentada como registro do acidente em 1962. A manchete com 12 mortos e 11 feridos é registrada como balanço publicado naquela edição, **não total final**.

A segunda tomada de Alexandre foi gerada no ElevenLabs (20,7122s, flow `qx80P2HVVBmCEJKyOi8V`), mas o MP3 não foi transferido ao renderizador. Importação de voz só foi testada com áudio sintético, não com voz real. Não afirmar sincronização de áudio, legendas ou publicação.

## Autoavaliação ponderada da capacidade — não é nota artística
| Dimensão | Peso | v0.5 | v0.6 |
|---|---:|---:|---:|
| Direção por cena | 25% | 6,2 | 6,5 |
| Acervo e direitos | 20% | 5,3 | 5,3 |
| Voz / sincronização | 15% | 5,0 | 5,2 |
| Composição / render | 15% | 7,1 | 7,5 |
| Auditoria audiovisual | 10% | 8,5 | 8,5 |
| Integridade editorial | 10% | 7,5 | 7,6 |
| Reutilização / testes | 5% | 9,2 | 9,4 |
| **Total** | **100%** | **6,49** | **6,67** |

A nota criativa do Reel V7 **não mudou: 6,63**. Sem mídia com ação real, voz integrada e revisão humana, a qualidade do Reel não está aprovada.

## Próximos gates
1. Exportar o MP3 *existente* do ElevenLabs, ingerir na fábrica e alinhar palavras após revisão auditiva.
2. Banco de clipes com direitos de publicação e cenas reais em movimento.
3. Cache por cena / renders A/B previsíveis, master 1080×1920 30fps e avaliação cega em celular.
4. Teste editorial em três pautas com validação factual, legal, técnica, sonora e humana. **Sem publicação automática**.
