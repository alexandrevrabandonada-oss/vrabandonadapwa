# Fábrica Aço Gráfico v0.35 — coreografia original no master Full HD

**03/11/2026 · estudo interno, não publicado · PR canônico #44 ainda em rascunho.**

## O que foi efetivamente entregue

- Dois MP4 de 14,5 s, composição **nativa 1080×1920 / 30 fps**, H.264/AAC, usando o **arquivo bruto original França 2011** de 1920×1080, não a recodificação de um Reel anterior. Filmagem francesa sempre rotulada como contexto internacional, não CSN.
- Fotografia original TIFF de 1941, JPEG de 1969 e fotografia de 2014 da CSN, todas conferidas com SHA-1 do catálogo anterior.
- A/B mantém a **paleta e as fontes idênticas**; varia apenas a cadência e a amplitude do movimento (`kinetic` versus `measured`).
- Oito gramáticas efetivamente diferentes: colisão, acordeão, persianas verticais, câmera oblíqua, revelação diagonal, contraponto, passagem de viga e repouso documental.
- Legendas por 32 tempos reais de fala Alexandre, mas a **voz profissional não está no MP4**. Música sintética de laboratório, sem afirmar que é áudio da CSN.

## QA local verificável

- 13/13 testes de regressão. Ambos os MP4s passaram `studio.qa_v35`.
- A: 14,5 s, 1080×1920, 30 fps, -16,1 LUFS, -2,0 dBTP, oito de oito cenas com movimento detectado; média espacial do teste de diferença temporal = 0,551.
- B: 14,5 s, 1080×1920, 30 fps, -16,1 LUFS, -2,0 dBTP, oito de oito cenas com movimento detectado; média temporal = 0,532.
- Comparação A/B em **16 amostras de tempos iguais** na área útil da imagem, pixel RGB com diferença >26: **0,230 da área em média**. Essa métrica indica diferença de movimento/enquadramento, **não é nota artística nem previsão de engajamento**.
- QA verifica integridade da mídia, resolução, duração, áudio, ausência de quadros negros e diferença visual interframes, mas não comprova qualidade cinematográfica, direitos de publicação ou retenção.

## Avaliação editorial interna (não independente)

Rubrica canônica, 0–10: identidade 20% = 8,80; composição 15% = 8,65; ação/montagem 15% = 8,85; relevância/diversidade do acervo 15% = 8,45; narrativa 10% = 6,55; legendas 10% = 8,35; áudio e voz 15% = 3,40.

**Reel A v0.35: 7,65/10**; Reel B v0.35: **7,55/10** (avaliação conservadora de cadência). A nota histórica do master v0.33, **7,71/10**, segue como melhor nota artística interna: o motor evoluiu, mas o Reel não está comprovadamente melhor como peça jornalística. **Capacidade técnica da fábrica: 8,91/10**, contra 8,86 na v0.34, pela geração A/B de fontes originais nativas + novo QA.

## Limitações e próximos gates

1. Gravação Alexandre 14,071 s já produzida no ElevenLabs, mas bloqueada para cópia ao renderizador. Não houve nova chamada paga nem voz sintética substituta.
2. A imagem local de 2014 ainda se repete em duas tomadas, embora com gramáticas distintas; na próxima pauta deve haver filmagem **local em movimento** de Volta Redonda.
3. Não há avaliação humana independente, teste de retenção ou aprovação para publicação.
4. O código-fonte, resultados e testes existem como pacote local; execução completa desta versão no GitHub só deve ser declarada após commit do motor e workflow, CI e leitura de artefato correspondente.

## Proveniência de fontes

- 1941: Arquivo Nacional, Construção da Companhia Siderúrgica Nacional (CSN), TIFF SHA-1 `91d061df6f5fb7962d17c86948e656c335f1b0ca`.
- 1969: Arquivo Nacional, Correio da Manhã AN 356, SHA-1 `1e16caba06722d121eaf3b88b39d89be910bb2a0`.
- 2014: HenriqueBarraMansa, CSN01, SHA-1 `6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4`.
- 2011: Damien Vicart, França, `Vicart - Aciérie.webm`, SHA-1 `c1129cac8654866856c7bec31196206f16eac6c7`.

Sem publicação, merge, manipulação de documento histórico ou criação de eventos falsos.