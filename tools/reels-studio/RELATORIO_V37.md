# Fábrica Aço Gráfico v0.37 — movimento a serviço da narrativa, não do efeito

**Data:** 03/11/2026. **Projeto:** VR Abandonada, identidade Aranhaverso-brutalista original. **Destino:** PR #44 rascunho, sem merge nem publicação.

## Problema auditado

Na v0.36 o texto nomeava animações ("CAMADAS EM COLISÃO", "PERSPECTIVAS"), fazendo um filme sobre a linguagem visual, quando a intenção é contar uma história da cidade e da usina. Esse desvio foi corrigido. Os novos títulos seguem **1941 (construção da CSN) → 1969 (interior da usina) → 2014 (panorama CSN) → filmagem real de siderurgia na França em 2011**, explicitamente identificada como material de contexto e não da CSN.

## Prova renderizada

- **A / V37_NARRATIVA_CINETICA.mp4:** 1080×1920, 30 fps, 14,50 segundos, H.264/AAC.
- **B / V37_NARRATIVA_CONTIDA.mp4:** mesmas imagens, cores, roteiro e duração; apenas animação em cadência mais lenta.
- **Comparação com v0.36:** MP4 lado a lado para verificar a mudança editorial e de movimento.
- **Fotografia/filmagem:** os quatro elementos efetivamente usados no ensaio são uma foto da CSN em construção em 1941, uma foto do interior de 1969, uma panorâmica de 2014 e a filmagem do aço na França em 2011 (reutilizada em quatro janelas temporais). Os SHA-1 originais são checados antes da composição, e pixels de arquivo não são sintetizados.
- **Animação documental:** oito gramáticas visuais no enquadramento, mais oito trajetórias efetivamente diferentes para a tipografia: colisão, desdobramento, venezianas, perspectiva, revelação diagonal, contraponto, viga e pausa longa.
- **Transcrição:** 32 tempos reais do ElevenLabs Scribe, preservados em JSON. SRT exportado a partir desses tempos.

## Verificação objetiva

- **15/15 testes locais** para coerência histórica, origens distintas, diferentes animações, mudança real de pixels entre tempos do plano, validação de 14,071 s em áudio local e ausência de falsa atribuição de voz.
- **QA dos dois MP4s:** estrutura aprovada, vídeo nativo Full HD 30 fps 14,5s, áudio −16,1 LUFS / −2,0 dBTP, mínimo de 30,56% de mudança espacial entre dois instantes amostrados de cada plano; diferença média A/B de 24,1% na área dos títulos. São métricas técnicas, não certificados de arte ou engajamento.
- **Porta de voz:** `--voice caminho/do/audio.mp3` aceita bytes locais existentes, verifica duração/codec/hash e mistura voz com ducking; o caminho de FFmpeg passou em teste sintético. **Isso não significa que a voz Alexandre foi importada.**

## Limitação de áudio e integridade

A gravação profissional Alexandre já gerada no ElevenLabs existe (14,071 s), porém o conector fornece URL assinada sem exportar bytes para o renderizador. O ambiente não conseguiu transferir o arquivo. Nenhuma segunda geração, crédito de TTS ou conta foi utilizado. Ambos os MP4s da v0.37 **não contêm narração**, apenas a trilha sintética; o rodapé do filme declara essa condição. A eventual importação de um áudio com duração igual **não prova sua identidade vocal**, o que exige conferência adicional.

## Notas editoriais internas (0–10)

| Eixo | Peso | v0.37 cinética |
|---|---:|---:|
| Identidade e linguagem original | 20% | 8,80 |
| Composição/legibilidade | 15% | 8,70 |
| Animação e montagem | 15% | 9,00 |
| Acervo e correspondência com a pauta | 15% | 8,45 |
| Narrativa jornalística | 10% | 7,15 |
| Legendas | 10% | 8,35 |
| Som/locução | 15% | 3,40 |

**Nota Reel A estimada: 7,74/10; Reel B: 7,68/10.** São estimativas, não teste de público. O maior ganho vem da linguagem narrativa; não do aumento de cores. **Capacidade da fábrica: 8,91/10 mantida até CI completo verificado.** Melhor nota anterior do Reel: 7,71/10 v0.33. Não há publicação, nem avaliação independente em celular.

## Próximo gargalo

É necessário obter uma cópia original do MP3 já gerado ou uma exportação autorizada, sem sintetizar novamente. Depois, testar mixagem, legibilidade e retenção em três pautas realmente diferentes; incorporar ação real local com origem confiável. Não considerar apenas o desenho de movimento como produto jornalístico acabado.