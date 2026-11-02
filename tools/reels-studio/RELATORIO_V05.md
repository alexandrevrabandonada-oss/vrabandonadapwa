# Fábrica de Reels v0.5 — validação de voz, legendas e portfólio (01/11/2026)

**Estado:** protótipo interno, sem autorização de publicação ou merge.

## Implementado
- `studio/alignment.py` importa marcações externas por palavra, confirma equivalência literal ao roteiro aprovado, rejeita sobreposições, desalinhamentos e tempos inválidos e exporta legendas JSON/SRT. Os arquivos mantêm status **DRAFT_TIME_CODES_NOT_HUMAN_REVIEWED**; não são alinhamento aprovado automaticamente.
- `studio/audioqa.py` mede LUFS integrado e true-peak pelo FFmpeg (EBU R128).
- `studio/provenance.py` gera manifesto de SHA-256, origem, data informada e situação de direitos sem alegar que o hash é comprovação de titularidade.
- `studio/factory.py` normaliza a faixa de voz isolada com compressor moderado mais `loudnorm`, preservando duração e sem cortar a fala.
- Testes locais: **41 aprovados** no pacote completo. No CI do GitHub, estão 40 testes autocontidos (um teste local adicional depende dos três MP4s gerados).
- Três vídeos curtos com assuntos distintos (trabalho, cidade/obras, saúde), usando **imagens e voz sintéticas de laboratório, NÃO cenas jornalísticas reais nem a voz Alexandre**. Saídas com H.264/AAC, 540×960 e 18 fps, ~3,78s, som e legendas; autoria original procedural.
- Um master de laboratório renderizado **nativamente em 1080×1920, 30 fps, 3,8s, H.264/AAC**, sem frames pretos detectados; áudio medido em **−17,5 LUFS / −1,5 dBTP**. Som sintético previamente ficou em torno de −21 LUFS antes do compressor. A evolução comprova normalização no material ensaiado, **não** acabamento final de narrações reais.
- Auditoria do master: QA técnico adequado, **publicação BLOQUEADA** por legendas ainda sem revisão auditiva e sem aprovação editorial.

## Estado da voz profissional do usuário
A segunda tomada da voz `Alexandre` no ElevenLabs está gerada, duração 20,712 segundos, fluxo `qx80P2HVVBmCEJKyOi8V`. O MP3 ainda não foi transferido ao renderizador, portanto **não está incorporado ou sincronizado ao Reel**. Não houve nova geração nem cobrança nesta rodada.

## Autoavaliação da fábrica — pesos mantidos
| Dimensão | Peso | v0.4 | v0.5 |
|---|---:|---:|---:|
| Direção por cena | 25% | 6,2 | 6,2 |
| Acervo/proveniência | 20% | 5,0 | 5,3 |
| Voz e sincronização | 15% | 4,0 | 5,0 |
| Composição/renderização | 15% | 7,0 | 7,1 |
| Auditoria audiovisual | 10% | 7,9 | 8,5 |
| Integridade editorial | 10% | 7,3 | 7,5 |
| Testes e reutilização | 5% | 8,9 | 9,2 |
| **Maturidade ponderada** | **100%** | **6,17** | **6,49** |

Notas internas e qualitativas, não testes independentes. A nota artística do Reel V7 **permanece 6,63/10**.

## Próximos gargalos
1. Obter o MP3 original da tomada Alexandre e rever transcrição/segmentação com áudio verdadeiro, sem gerar voz redundante.
2. Banco de filmagens/documentos licenciados com movimentos reais, direitos e contexto verificados.
3. Criar três Reels investigativos verdadeiros com linguagem de montagem cinematográfica, 1080×1920/30 fps, revisão móvel e externa.
4. Não declarar 10/10 com base nos testes sintéticos, nem habilitar publicação automatizada antes de autorização explícita.
