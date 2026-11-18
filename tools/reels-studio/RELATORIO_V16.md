# Fábrica de Reels v0.16 — ingestão segura de vídeo + prova de ação (02/11/2026)

**Estado: protótipo interno. NÃO PUBLICAR.** Identidade Aço Gráfico (brutalismo expressivo documental) preservada: colorido cinético nas cenas ilustrativas, fontes históricas íntegras.

## Entregas técnicas verificadas

- `studio/moving_source_v16.py` (GitHub): contrato reutilizável de vídeo com fonte, local, autor, data, licença, revisão de direitos, SHA-256 e aviso de contexto. Impede caracterizar simulação ou filmagem sem proveniência como evidência ou publicar automaticamente.
- `tests/test_v16.py` (GitHub): cinco testes independentes do novo contrato, da inspeção de vídeo e da origem.
- Renderizador visual e módulo procedural de movimento **ainda LOCAIS**, no pacote interno de trabalho: `studio/footage_stage_v16.py`, `industrial_lab_v16.py`, `render_v16.py`. A publicação não está habilitada e os arquivos privados não foram para GitHub.
- Filme experimental concluído: **9,5 s / 228 quadros / 432×768 / 24fps / H.264+AAC**. Três mundos distintos: foto de usina (contexto, data desconhecida), **SIMULAÇÃO GRÁFICA de movimento industrial**, fac-símile da página de *A Noite* (29/01/1962) inalterada.
- Som original de laboratório, **sem voz Alexandre**, normalizado após auditoria de **−29,8 → −16,1 LUFS**; pico verdadeiro ~−3,6 dBTP. Não é áudio captado na indústria.
- Cena ilustrativa renderizada **nativamente em 1080×1920/30fps por 1,5s**, convertida para H.264; não é master completo.
- Auditoria Farneback de movimento local na animação sintética: p95 mediano ~5,0 px (downsampled), fração mediana ~0,758. Heurística **não comprova filmagem real**.
- **110 testes locais passaram e 1 foi ignorado** com fixtures da v0.5 restabelecidas. O CI do GitHub é uma execução diferente e deve ser conferido separadamente.

## Material real candidato, mas NÃO incorporado
- <https://commons.wikimedia.org/wiki/File:Armature_en_acier_de_pliage.webm> — 4MAPS/Demba Welle, **Senegal 05/03/2024**, CC BY-SA 4.0 declarada. A página de fonte foi verificada; o download de vídeo não foi permitido no ambiente de renderização. Mesmo licenciado, **não é Volta Redonda nem registro do acidente**; uma adaptação distribuída exige atribuição e cuidados ShareAlike. Não confundir candidato mapeado com acervo baixado.
- As fotos industriais recebidas do usuário permanecem sem autoria/data/licença de distribuição confirmadas.

## Nota da capacidade da fábrica — autoavaliação NÃO certificada
| Dimensão | Peso | v0.15 | v0.16 |
|---|---:|---:|---:|
| Direção artística por cena | 25% | 8,10 | 8,10 |
| Acervo / procedência | 20% | 5,80 | 5,90 |
| Voz / sincronização | 15% | 5,35 | 5,35 |
| Composição e render | 15% | 9,10 | 9,20 |
| QA audiovisual | 10% | 9,75 | 9,85 |
| Integridade editorial | 10% | 8,20 | 8,25 |
| Reutilização / testes | 5% | 9,90 | 9,90 |
| **Total ponderado** | **100%** | **7,64** | **7,69** |

**Reel V7 histórico mantém nota artística 6,63/10.** Esta prévia nova ainda é geometricamente simples e não recebeu avaliação humana independente; não atribuir incremento estético.

## Portões ainda bloqueados
1. Obter e revisar material audiovisual **real e relevante para a pauta**, sem troca de local/época no rótulo.
2. Transferir a gravação Alexandre existente no ElevenLabs, sem gerar outra; alinhar palavras/legendas e revisar áudio.
3. Montagem integral em 1080×1920/30fps, QA em celular, três pautas distintas e avaliação artística independente.
4. Autorizar direitos das imagens e revisão editorial humana. **Nenhum Reel publicado, nenhuma aprovação automática.**
