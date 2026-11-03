# Fábrica Aço Gráfico v0.31 — construção histórica e interior da CSN na montagem Aranhaverso-brutalista

**03/11/2026 · PR #44 draft · estudo interno, não publicado.**

## Resultado efetivamente renderizado e verificado

Workflow [v31 run 41659371817](https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/actions/runs/41659371817) **SUCCESS**: 20 testes de regressão aprovados; aquisição das quatro fotos locais reais e da filmagem industrial com SHA-1 verificados; composição nativa 1080 × 1920 a 30 fps; edição de 14,5 segundos; oito tomadas, quatro janelas de filme; MP4 H.264/AAC, legenda SRT, contatos e relatório de QA em artefato **13241092871**.

**Novidade editorial**: a abertura da CSN usa fotografia da **construção em 1941**, do **interior da usina em 1969** (bobinas de aço), e duas fotografias independentes da CSN em **2014**. O TIFF original de 1941 está preservado; o JPG derivado para o render tem hash próprio. A ação siderúrgica em movimento continua de uma **usina na França em 2011** (Damien Vicart) e é identificada explicitamente, sem fingir que é CSN.

**Verificações objetivas**: zero erros de QA; **−16,1 LUFS / −1,4 dBTP**; 32 palavras temporizadas de fala real produzida anteriormente, em nove grupos SRT; seis pares de fotos com distâncias de dHash **36, 33, 27, 35, 33, 36**. A máxima permanência de uma única foto é **2,18s**, contra **6,16s** na v29 (**−64,6%** na repetição da fonte, não em engajamento). Fontes de 1941, 1969 e 2014 verificadas com metadados do Wikimedia Commons e SHA-1. HTTP 429 da Wikimedia foi tratado com espera progressiva e verificação estrita dos bytes; não foram usadas fontes alternativas silenciosamente.

**A gravação profissional Alexandre NÃO está no MP4**: o áudio presente é música sintética original de laboratório; legendas usam apenas seus timestamps reais. Nenhuma nova geração de voz. Direitos de publicação e aprovação editorial permanecem gates separados; PR sem merge e sem postagem.

## Duas notas padronizadas — estimativas editoriais internas

| Eixo | Peso | v30 | v31 |
|---|---:|---:|---:|
| Identidade brutalista autoral | 20% | 8,75 | 8,75 |
| Composição e tipografia | 15% | 8,55 | 8,65 |
| Ação e montagem | 15% | 8,10 | 8,10 |
| Relevância/diversidade de arquivo | 15% | 7,40 | 8,55 |
| Narrativa jornalística | 10% | 6,45 | 6,55 |
| Legendas | 10% | 8,50 | 8,50 |
| Áudio e voz | 15% | 3,40 | 3,40 |

**Qualidade artística Reel v31: 7,56/10** (**+0,20** vs v30 7,36). **Capacidade técnica da fábrica v31: 8,76/10** (**+0,08** vs v30 8,68). O cálculo ponderado e parâmetros verificáveis constam em `examples/scorecard_v31.json`. Notas internas não são pesquisa com público nem certificação de ferramenta automática. Avaliação de contatos não substitui inspeção humana em celular, que continua pendente.

## Próxima barreira 10/10

Importar bytes originais da voz profissional Alexandre (já criada no ElevenLabs), validar mixagem, entonação e retenção; filmagens **locais em ação** (CSN/Volta Redonda); narrativas investigativas completas; gramáticas visuais que se adaptem a pautas e fontes diferentes; revisão independente e testes com público. Não gerar nova voz idêntica desnecessariamente.

## Arquitetura reproduzível

`studio/verified_media_v31.py` (aquisição e hashes), `studio/visual_director_v31.py` (oito tomadas com datas/contexto), `studio/visual_qa_v31.py` (relatório), `tests/test_visual_v31.py` (10 cenários adicionais), `.github/workflows/reels-studio-v31-archives.yml` (master CI) no **mesmo** PR #44, branch `codex/reels-studio-v01`. Nenhuma publicação ou merge.
