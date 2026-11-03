# Fábrica de Reels v0.15 — direção de cenas (02/11/2026)

**Uso interno; publicação e merge NÃO autorizados.** Mantida a linguagem autoral Aço Gráfico — brutalismo expressivo documental, com princípios gerais de animação em camadas e cor expressiva, sem copiar elementos proprietários de Spider-Verse.

## Entrega
- Módulo portátil integrado à branch: `studio/shot_gate_v15.py` exige focal point, três gramáticas distintas, indicação de procedência; bloqueia a estilização de documentos primários e uso de fotos sem data como prova de evento. Cinco testes independentes de CI em `tests/test_shot_gate_v15.py`.
- **Implementação local experimental**, ainda NÃO sincronizada à PR: `studio/shot_director_v15.py`, `studio/render_directed_v15.py`, `studio/audit_v15.py`, com três cenas: estrutura industrial (câmera arquitetônica), bobinas (oclusão de foto/máscara) e documento de 1962 (facsímile completo seguido de recorte original da manchete).
- Render experimental local **9,792 s / 235 quadros / 432×768 / 24fps / H.264+AAC**; trilha original de laboratório, não a voz Alexandre. Segunda cena renderizada em teste **1080×1920 / 30fps / 2s**.
- Auditoria local em nove quadros: nenhum quadro praticamente preto; diferenças visuais em pares dentro das cenas de 26,75 (arquitetura), 36,63 (bobinas) e 68,27 (jornal). Medidas técnicas, NÃO indicadores de excelência artística.
- **105 testes locais aprovados, 1 ignorado** na cópia de trabalho com fixtures históricas v0.5 restauradas; não atribuir esse número ao CI.
- Fonte original e hashes preservados. Direitos de publicação das fotografias não comprovados. Jornal de 1962 não constitui fotografia das circunstâncias do acidente.

## Avaliação da FÁBRICA
Capacidade interna **7,57 → ~7,64/10**, ganho sobretudo em diversidade de gramática e enquadramento. Autoavaliação qualitativa, não certificação. Nota artística histórica do Reel V7 permanece **6,63/10**. Ainda falta filmagem real de ação, MP3 de Alexandre no renderizador, legendas sincronizadas e QA humano em celular.

## Próximo gate
Integrar o renderizador local à PR com testes reprodutíveis que não exponham imagens privadas; incorporar MP3 existente (sem regeneração), filmagens licenciadas e três reportagens independentes com revisão editorial humana. Não liberar publicação automaticamente.

Pacote interno na conversa: `FABRICA_REELS_V15_CODIGO.zip` e `FABRICA_REELS_V15_DEMO_INTERNA.zip`, não hospedados no GitHub.
