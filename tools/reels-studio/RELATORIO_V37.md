# Aço Gráfico v0.37 — a animação precisa contar a história

**03/11/2026; PR #44 em rascunho.**

A v0.36 tinha títulos que nomeavam efeitos ("camadas em colisão", "perspectivas") em lugar de fatos editoriais. A v0.37 corrige isso por oito títulos factuais ligados a imagens reais: construção CSN de 1941, interior da CSN em 1969, panoramas de 2014 e filme siderúrgico da **França em 2011** (não CSN). O motor implementa oito trajetórias tipográficas distintas além das oito gramáticas visuais: colisão, arquivo desdobrado, venezianas, perspectiva, wipe de metal, contraponto, viga e repouso documental.

**Prova local:** dois MP4s nativos 1080×1920/30 fps/14,5s H.264/AAC, nove originais não modificados, 15 testes locais aprovados; loudness A/B −16,1 LUFS, pico −2,0 dBTP; menor fração alterada entre amostras de um plano 30,6%, diferença média entre versões nas regiões de título 24,1%. Estas são métricas técnicas, não notas de engajamento nem avaliação estética.

**Voz:** 32 marcas de palavras reais da gravação profissional Alexandre de 14,071s; os MP4s **não têm a narração**. O ElevenLabs mantém o áudio gerado, mas o conector não disponibiliza bytes para renderização. Foi acrescentado caminho de ingestão de arquivo local com duração/hash/codec validados, sem nova síntese; identidade de quem fala não é inferida do arquivo. Não publicar, nem fundir PR sem revisão.

**Notas:** até que arte e reprodução no CI sejam reavaliadas, não declarar 10/10 nem melhoria certificada. O resultado é uma prévia editorial da fábrica, não uma matéria pronta.
