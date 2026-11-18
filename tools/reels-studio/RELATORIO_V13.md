# Fábrica de Reels v0.13 — sound-first & acervo (01/11/2026)

**Estado: desenvolvimento interno; não publicável.** Mantém a identidade **Aço Gráfico / Brutalismo Expressivo Documental**, com referências gerais à energia do Aranhaverso, sem reproduzir personagens ou cenas.

## Trabalho verificado
- Novo módulo `studio/soundfirst.py` mede energia de gravação **existente**, identifica intervalos de silêncio e sugere cortes de roteiro com proveniência: `acoustic_pause` ou `duration_fallback_NOT_AUDIO_SYNC`.
- CLI do motor `factory.py soundplan --project arquivo.json --audio gravacao.wav --output proposta.json`. Não chama síntese, não transcreve, não oferece marcações de palavras nem sinaliza aprovação.
- Três gravações totalmente sintéticas e apenas de laboratório (trabalho/cidade/saúde): **8 dos 9 cortes internos** próximos a pausas reais, o nono marcado como fallback, sem esconder incerteza.
- **89 testes locais passaram; 1 ignorado e 1 teste legado excluído** porque dependia de MP4 da v0.5 não presente no pacote. Testes autocontidos novos adicionados ao CI.
- Material local de inspeção: `SOUNDFIRST_DIRECAO_V13.png`, `SOUNDFIRST_TRES_TEMAS.json`, relatório de decisão. O gráfico reproduz **tempos de gravações sintéticas**, não a voz Alexandre e não uma reportagem nova.

## Novos candidatos, sem falsificar contexto
- Filme **Armature en acier de pliage** (2024, Senegal, 4MAPS/Demba Welle), CC BY-SA 4.0 declarado: https://commons.wikimedia.org/wiki/File:Armature_en_acier_de_pliage.webm . Não foi baixado; não corresponde a Volta Redonda.
- **Casting a Guide Box - Westinghouse Works** (1904, Billy Bitzer): domínio público declarado **nos EUA**, fora dessa jurisdição ainda não validado: https://commons.wikimedia.org/wiki/File:Casting_a_Guide_Box_-_Westinghouse_Works.webm . Não foi baixado.
- Candidato já mapeado da Rodovia do Contorno (2017), Volta Redonda: licença ainda sob revisão. Não confundir com acidente de 1962 ou obra da Rua 33.
- Catálogo em `examples/acervo_candidatos_v13.json`, com atribuição, país, contexto, condições e status de download.

## Pontuação interna da capacidade, não Reel
| Dimensão | Peso | v0.12 | v0.13 |
|---|---:|---:|---:|
| Direção por áudio/cena | 25% | 7,40 | 7,65 |
| Acervo/proveniência | 20% | 5,80 | 5,80 |
| Voz real/sincronia | 15% | 5,20 | 5,20 |
| Render/composição | 15% | 9,10 | 9,10 |
| QA audiovisual | 10% | 9,40 | 9,50 |
| Integridade editorial | 10% | 8,20 | 8,20 |
| Testes/reutilização | 5% | 9,90 | 9,90 |
| **Total** | **100%** | **7,41** | **7,48** |

**Nota artística do Reel V7 segue 6,63/10.** Não foi produzido Reel superior. Pontuação é autoavaliação, não certificação independente.

## Portões v0.14
Importar o MP3 da gravação já gerada da voz profissional Alexandre (20,71s, fluxo ElevenLabs já existente), conferir transcrição e marcações por palavra e sincronizar edição. Trazer filmagens pertinentes com licença efetivamente revisada. Entregar e comparar masters reais 1080×1920/30 fps, inclusive no celular, em pelo menos três temas. Não publicar sem aprovação humana.
