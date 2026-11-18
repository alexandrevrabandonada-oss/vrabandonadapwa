# Fábrica Aço Gráfico v0.24 — edição guiada por palavras reais da voz Alexandre

**02/11/2026 · PR #44 rascunho · sem publicação**

## Entrega

A tomada de 14,071 segundos da voz profissional Alexandre já criada no ElevenLabs foi transcrita pelo ElevenLabs Scribe v1 no mesmo fluxo (flow kyxg6hlu1YvywVBXNdFQ, generation tTaWVNJWncvWAk4CoyUd). Obteve-se, sem criar uma segunda fala, o início/fim de **32 palavras**, entre 0,000 e 14,071 s. O registro de tempos está em examples/voice_alexandre_words_v24.json.

Reel de laboratório renderizado localmente: **14,500 s, 540×960, 24 fps, H.264/AAC**. São sete planos com cortes alinhados ao que se fala; a foto da CSN de 2014 aparece primeiro e a filmagem industrial da França de 2011 entra em 6,0 s, quando o texto começa a anunciá-la. O vídeo distingue claramente as duas origens. Nenhuma imagem francesa é identificada como CSN.

## Linha editorial da montagem

| Início–fim | Plano | Fonte |
|---|---|---|
| 0–1,5 s | Gancho A cidade tem memória | CSN, 2014 |
| 1,5–3,5 s | Fotografia documental e data | CSN, 2014 |
| 3,5–6,0 s | Tríptico e contexto da usina | CSN, 2014 |
| 6,0–8,5 s | Filmagem real de siderurgia | França, 2011 |
| 8,5–10,0 s | Segundo tratamento do filme de ação | França, 2011 |
| 10,0–12,0 s | Duas fontes lado a lado | CSN 2014 e França 2011 |
| 12,0–14,5 s | Resolução A origem importa | Ambas as fontes |

## Código e proteção contra falso sucesso

- studio/voice_timed_v24.py: valida texto e timestamps, exporta SRT em blocos legíveis; também oferece mistura de MP3 original com música com verificação de hash e duração, sem novo TTS.
- studio/cinema_director_v24.py: gera sete gramáticas visuais diferentes, reserva de verdade a área inferior para a legenda, destaca a palavra ativa e escreve créditos no próprio vídeo. Não inventa frames de época e não usa mídia local sem SHA compatível.
- tests/test_v24.py: testa 32 palavras, transcript, timestamps, corte semântico, faixa de legenda e defesa contra voz inexistente.
- .github/workflows/reels-studio-v24-voice-led.yml: baixa originais do Commons, verifica SHA-1, roda testes, cria MP4/SRT e executa QA técnico com métricas EBU R128.
- examples/voice_alexandre_words_v24.json: é dado de temporização, não é MP3.

## O que foi medido localmente

- 7/7 testes locais passaram; sete cenas amostradas apresentam contraste e legibilidade técnica, sem black placeholders.
- Compressor e limiter corrigiram a mix instrumental: aproximadamente **−18,8 LUFS / −2,1 dBTP** conforme EBU R128.
- A primeira versão tinha legendas sobrepostas aos títulos. Foi refeita a cena com área exclusiva de legenda em y=741–881. Foi produzida nova folha de contato com oito quadros.
- SRT separado tem oito cues e incorpora os timestamps reais de 32 palavras. Alinhamento cronométrico de dados não significa que já houve conferência humana de voz com MP4.

## Bloqueio factual

A gravação profissional Alexandre foi gerada no ElevenLabs, mas **seus bytes de áudio ainda não foram transferidos** pelo conector para o renderizador. A tentativa de recuperar URL assinada não funcionou. Este MP4 v0.24 contém trilha original de laboratório e texto cronometrado pela voz; **NÃO contém voz Alexandre audível**. Isso é declarado no rodapé do vídeo e no manifesto. Nenhuma segunda geração de voz foi feita nesta rodada. O conector Scribe foi usado para obter as marcas de palavras sem nova síntese.

## Qualidade

Uma montagem mais ritmada e legível não basta para declarar 10/10. Continuam pendentes a voz no MP4, filmagens realmente locais de ação, master nativo HD, validação em telefone e avaliação humana externa. A pontuação interna anterior 8,14/10 é uma avaliação de capacidade histórica, não nota criativa do novo vídeo. Nenhuma publicação, merge ou nova pontuação artística nesta rodada.
