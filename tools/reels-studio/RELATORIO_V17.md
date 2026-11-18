# Fábrica Aço Gráfico v0.17 — filmagem real confirmada (02/11/2026)

**Uso experimental interno, sem merge ou publicação.** Marco: a linha de produção superou o bloqueio de acesso a arquivos de vídeo e comprovou ingestão de uma fonte real.

## Fonte original obtida e verificada
- **Armature en acier de pliage.webm**: trabalho de reforço de aço filmado em **Tivaouane Peulh-Niaga, Senegal**, em **05/03/2024**, atribuição **4MAPS / Demba Welle**, licença **CC BY-SA 4.0**.
- Fonte: https://commons.wikimedia.org/wiki/File:Armature_en_acier_de_pliage.webm ; licença https://creativecommons.org/licenses/by-sa/4.0/
- Original baixado no GitHub Actions e autenticado pelo **SHA-1 `cacc1db79fd88d7da28eb8783a57514159a5a3c1`**, com **11.456.510 bytes**. O arquivo original NÃO foi commitado no repositório; disponível em artefato de execução com retenção limitada.
- **Não é CSN, Volta Redonda ou evento de 1962.** Os créditos e a legenda de contexto estão em tela. A distribuição da adaptação depende de atribuição, informação sobre modificações e condições ShareAlike; revisão editorial institucional ainda pendente.

## V17A — produção reprodutível no GitHub
- Código `studio/real_footage_v17.py` e testes `tests/test_v17.py` na mesma PR #44.
- Workflow `reels-studio-real-footage-v17.yml`: baixa, verifica hash, renderiza **10 segundos, 720×1280, 24fps, H.264/AAC**, gera quadros e sobe artefato interno.
- GitHub Actions **sucesso**, junto com CI isolado. Artefato nomeado **v17-real-footage-internal-proof**. Auditoria local do MP4: fonte visivelmente em movimento, nenhum frame praticamente preto nas amostras. Áudio V17A ~**−26 LUFS**, devendo melhorar.
- V17A é tecnicamente reprodutível, porém ainda utiliza faixas visuais rígidas: visualmente não é padrão 10/10.

## V17B — avanço artístico local, ainda NÃO commitado
- Nova composição **8 segundos, 540×960, 24fps, H.264/AAC** com planos fechados nas mãos do trabalhador, composição dupla e movimento cinético diferenciado por cena.
- O mesmo original foi verificado antes de gerar um proxy H264 para edição. **SHA-1 da fonte original permaneceu idêntico**; proxy e derivado separados.
- Áudio do clipe original com dinâmica controlada, versão final medida em cerca de **−22 LUFS e −1,5 dBTP**.
- Nenhuma tela praticamente preta nas amostras; movimento dos braços e mãos confirmado pela inspeção de quadros da fonte.
- O renderizador V17B, MP4 e contato de frames estão no **pacote local entregue na conversa**, não na PR. Ele ainda precisa ser portado e retestado em CI.

## Notas internas de maturidade da fábrica
| Eixo | Peso | v0.16 | v0.17 |
|---|---:|---:|---:|
| Direção por cena | 25% | 8,10 | 8,40 |
| Acervo/proveniência | 20% | 5,90 | 6,50 |
| Voz e sincronia | 15% | 5,35 | 5,35 |
| Composição/renderização | 15% | 9,20 | 9,30 |
| QA audiovisual | 10% | 9,85 | 9,85 |
| Integridade editorial | 10% | 8,25 | 8,40 |
| Reutilização/testes | 5% | 9,90 | 9,90 |
| **Total (ponderado)** | **100%** | **7,69** | **7,92** |

Autoavaliação qualitativa, não certificação. Estudo visual V17B ~**7,2/10** (provisório e sem avaliação independente); nota artística histórica do Reel V7 **6,63/10**, não automaticamente alterada.

## Próximos portões
1. Portar a composição V17B para a PR e automatizar A/B com vídeo real e teste 1080×1920.
2. Captar ou licenciar filmagens **realmente pertinentes a Volta Redonda/CSN**, sempre diferenciando registros históricos de contexto.
3. Importar o MP3 já gerado da voz Alexandre, alinhar palavras/legendas e montar à locução real.
4. Produzir três reportagens em temas diferentes, com revisão móvel e avaliação humana externa. **Publicação bloqueada**.
