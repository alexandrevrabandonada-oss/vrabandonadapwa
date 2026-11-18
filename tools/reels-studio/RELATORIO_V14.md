# VR Abandonada | Fábrica de Reels v0.14 — montagem sonora completa

**Status:** protótipo interno, sem voz real Alexandre e NÃO PUBLICÁVEL. A identidade Aço Gráfico — brutalismo expressivo documental — continua obrigatória.

## Entregas verificadas (01/11/2026)
- `studio/sound_edit_v14.py`: otimização global de cortes por pausas acústicas + quantização em frames (sem lacunas, sem truncar áudio).
- `studio/render_v14.py`: reutiliza os módulos de cena existentes e exporta um vídeo completo com áudio AAC.
- `studio/film_quality_v14.py`: indica planos superiores a 4s sem filmagem em ação e exige revisão humana em vez de atribuir 10/10 automaticamente.
- MP4 de laboratório `V14_ACO_GRAFICO_AUDIOFIRST_LAB_21s.mp4`: **503 quadros, 540×960, 24 fps, 20,96 segundos; H.264/AAC**. Diferença de duração entre fonte sonora e quadros: **2,1 ms**. O contêiner indica 21,0s pela granularidade de codificação AAC.
- A faixa sonora é **sintética de laboratório para ensaio de temporização, não a gravação Alexandre e não uma voz jornalística verificada**.
- **4/4 cortes internos** relacionados a pausas com tolerância de 1,75s. Na v0.13 eram 2/4 com tolerância menor; esses números não constituem A/B isolado de melhor direção.
- Medição de áudio: **−16,2 LUFS e −1,4 dBTP**. QA de quadros das cinco cenas sem flag de tela preta, porém sem prova de qualidade artística.
- Teste visual de dois segundos em **1080×1920 / 30 fps**, composição nativa sem narração.
- **95 testes locais passaram e 1 foi ignorado**, depois de recuperar fixtures do vídeo sintético v0.5 para executar o teste legado. CI independente tem ambiente diferente.

## Crítica visual
O teste de 21 segundos ainda contém fotografia animada e uma cena simulada. A auditoria identificou **três planos mais longos que quatro segundos sem ação filmada**, exigindo revisão de montagem. O reel não alcança o padrão de cinema de animação desejado e não pode ter sua nota estética elevada apenas por sincronização temporal.

## Gate não resolvido
A tomada da voz profissional Alexandre já existe no ElevenLabs, mas **seus bytes MP3 não estão disponíveis no renderizador**. Não foi regenerada. A edição não conhece os tempos de palavras e nenhum Reel foi publicado. Autoria, data e direitos de uso das fotos ainda estão pendentes.

## Maturidade interna da fábrica
| Critério | Peso | v0.13 | v0.14 |
|---|---:|---:|---:|
| Direção por áudio e cena | 25% | 7,65 | 7,85 |
| Acervo / procedência | 20% | 5,80 | 5,80 |
| Voz / sincronização | 15% | 5,20 | 5,35 |
| Composição / render | 15% | 9,10 | 9,10 |
| QA audiovisual | 10% | 9,50 | 9,65 |
| Integridade editorial | 10% | 8,20 | 8,20 |
| Reutilização / testes | 5% | 9,90 | 9,90 |
| **Resultado ponderado** | **100%** | **7,48** | **7,57** |

Notas de capacidade estimadas internamente, não certificação nem nota estética. A nota artística histórica da V7 do Reel permanece **6,63/10**.

## Próxima estação
Recuperar o MP3 já gerado, confirmar transcrição e legendas, obter clipes com direitos e contexto realmente verificados, substituir simulações por movimento filmado, produzir masters de três pautas distintas, revisar em celular e externamente. Não publicar sem aprovação expressa.
