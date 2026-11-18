# Fábrica de Reels — V18: duas fontes reais e montagem cinematográfica
**02/11/2026 · Prova técnica interna · não publicada**

## Entrega verificada
- Filme de **12 segundos (288 quadros), 540×960, 24 fps**, H.264/AAC; quatro gramáticas: ação humana, escala industrial, tela dividida, retorno ao trabalho manual.
- Fonte A: 4MAPS / Demba Welle, Senegal, 05/03/2024, CC BY-SA 4.0; https://commons.wikimedia.org/wiki/File:Armature_en_acier_de_pliage.webm ; SHA1 `cacc1db79fd88d7da28eb8783a57514159a5a3c1`.
- Fonte B: Damien Vicart, França, 23/09/2011, CC BY 3.0; https://commons.wikimedia.org/wiki/File:Vicart_-_Aci%C3%A9rie.webm ; SHA1 `c1129cac8654866856c7bec31196206f16eac6c7`.
- Ambas as fontes foram **efetivamente baixadas no GitHub Actions, verificadas pelo hash e incorporadas ao Reel**. Originais estão no artefato de execução, sem commit binário no repositório.
- Áudio do vídeo senegalês usado como ambiente de teste; **não** contém voz Alexandre. Filmagens internacionais de CONTEXTO; **não são CSN/Volta Redonda, nem o acidente de 1962**. Identificação de local, data e créditos sempre em tela.
- Primeira exportação reprovada por **pico +0,4 dBTP**, o que levou à implementação de duas etapas de tratamento. Execução final com **-18,5 LUFS, -2,3 dBTP**, QA de **6 quadros** sem tela preta, GitHub Actions **aprovado**.
- `studio/editorial_multisource_v18.py` + `studio/qa_v18.py` + testes `tests/test_v18.py` e workflow `reels-studio-v18-multisource.yml` concluídos na PR #44.
- O workflow `Reels Studio isolated CI` também foi aprovado na última versão do código.

## Avaliação não certificada da FÁBRICA
| Dimensão | Peso | V17 | V18 |
|---|---:|---:|---:|
| Direção | 25% | 8,40 | 8,55 |
| Acervo/proveniência | 20% | 6,50 | 7,00 |
| Voz/sincronia | 15% | 5,35 | 5,35 |
| Composição/render | 15% | 9,30 | 9,30 |
| QA audiovisual | 10% | 9,85 | 9,95 |
| Integridade editorial | 10% | 8,40 | 8,40 |
| Reutilização | 5% | 9,90 | 9,90 |
| **Ponderado** | **100%** | **7,92** | **8,07** |

Autoavaliação; visual V18 estimado provisoriamente ~7,5/10, sem revisão externa. Última nota artística histórica de Reel V7 = **6,63/10**, não alterada.

## Limites e próximos gates
- O projeto ainda carece de cenas locais **reais de Volta Redonda/CSN**, voz Alexandre importada e alinhada palavra por palavra, avaliação em aparelho móvel e três Reels completos independentes.
- Não confundir licenças CC BY-SA / CC BY com autorização ilimitada: atribuição, indicação de alterações e regras ShareAlike devem ser atendidas. Revisão adicional de direitos antes de publicar.
- **Não houve merge nem publicação.** A PR permanece draft e o pacote de mídia foi entregue apenas como artefato interno.
