# Fábrica Aço Gráfico v0.19 — primeiras fontes locais de Volta Redonda
**02/11/2026 · demonstração interna não publicada · PR #44**

## O que foi efetivamente entregue
- Um pipeline reproduzível `studio/volta_redonda_v19.py` obtém arquivos pelo Wikimedia Commons, confere tamanho e SHA-1 com a API, conserva os originais e gera manifestos por ativo. Sem substituir silenciosamente material que não passa na verificação.
- `tests/test_v19.py` protege autoria declarada, cronologia, status de revisão da licença, integridade SHA-1 e enquadramento vertical.
- Workflow `reels-studio-v19-volta-redonda.yml` baixa as duas fontes, executa testes, produz MP4 e bloqueia artefatos caso áudio/vídeo falhem no `qa_v18.py`.
- **Quatro workflows da PR testados e aprovados no commit `45378ccd0f43af619b84a8836e9019236eba7087`** (incluindo isolated CI, V17, V18 e V19).
- Render V19 revisado: **14,005 s · 540×960 · 24 fps · H.264/AAC · -17,1 LUFS · -4,3 dBTP**, sem quadros quase pretos em seis amostras. Vídeo e fontes estão no artefato `v19-real-volta-redonda-context-internal`, execução **41531494483**.
- Arquivo local dos dois originais: ZIP `FABRICA_REELS_V19_VOLTA_REDONDA_REVISADO.zip`. Tamanho do vídeo original 56.137.149 bytes; foto original 122.912 bytes.

## Fontes realmente incorporadas
| Ativo | O que mostra | Data | Crédito | Licença/status | SHA-1 |
|---|---|---|---|---|---|
| `CSN01.jpg` | vista de usina da CSN em Volta Redonda | 06/05/2014 | HenriqueBarraMansa | CC BY-SA 3.0, carregada pelo criador | `6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4` |
| `Rodovia do Contorno é inaugurada após 22 anos de obra.webm` | reportagem sobre inauguração da Rodovia em Volta Redonda | 08/12/2017 | TV BrasilGov | CC BY 3.0 **declarada, revisão pendente no Commons** | `0974ee5e46efa3599f623e32c94fc0e0fd7da46a` |

Links de fonte:
- https://commons.wikimedia.org/wiki/File:CSN01.jpg
- https://commons.wikimedia.org/wiki/File:Rodovia_do_Contorno_%C3%A9_inaugurada_ap%C3%B3s_22_anos_de_obra.webm

**Integridade de bytes não demonstra titularidade de licença.** A obra derivada é apenas uma avaliação interna; não dar como liberada para publicação sem revisão dos termos e atribuição adequada.

## Duas versões e aprendizado de direção
1. **Primeira passagem** usava o trecho a partir de 15 s: imagem de tela de estúdio com a marca “Avançar”, fraca para a pauta local. Reprovada na revisão visual apesar de QA técnico aprovado.
2. **Revisão** usa o intervalo de reportagem no local da inauguração, começando perto de 41 s. A fonte é real, a imagem mostra uma entrevista com a rodovia ao fundo, mas a predominância de plano de entrevista limita o cinema. Correção foi registrada em workflow e passou novo CI.

**Conclusão estética:** não é um Reel 10/10 nem supera automaticamente a V18. São uma foto com movimento de câmera e um plano de entrevista de arquivo. O ganho principal foi estabelecer aquisição local, rastreabilidade e rejeição editorial de segmentos fracos. Nota visual exploratória da V19: **6,2/10**, interna e sem avaliação independente.

## Pontuação estimada da capacidade da fábrica
| Dimensão | Peso | v0.18 | v0.19 |
|---|---:|---:|---:|
| Direção por cena | 25% | 8,55 | 8,55 |
| Acervo e procedência | 20% | 7,00 | 7,30 |
| Voz e sincronização | 15% | 5,35 | 5,35 |
| Composição e renderização | 15% | 9,30 | 9,30 |
| QA técnico | 10% | 9,95 | 9,95 |
| Integridade editorial | 10% | 8,40 | 8,50 |
| Reutilização e testes | 5% | 9,90 | 9,90 |
| **Capacidade ponderada** | **100%** | **8,07** | **8,14** |

São notas internas de processo, **não certificação artística**. A nota histórica do Reel V7 permanece **6,63/10**.

## Pendências verdadeiras
- O MP3 de **Alexandre** (já gerado no ElevenLabs, ~20,71 s) não chegou ao renderizador e não há sincronização de fala real. **Nenhuma nova locução foi gerada.**
- A filmagem de 2017 é um boletim institucional, não um clipe de ação industrial. Não é registro do acidente de 1962 nem deve ser apresentada como filmagem interna da CSN.
- Encontrar filmagens locais com ação visual real (trabalhadores, ruas, fábricas ou manifestações) e condições de uso confirmadas; selecionar trechos por inspeção humana, não apenas por metadados.
- Master 1080×1920/30fps, revisão por mobile e portfólio de três reportagens continuam pendentes.
- **Sem merge, sem publicação, sem distribuição institucional.**

## Próxima estação
**v0.20**: banco audiovisual com busca e triagem por ação/contexto/licença, seleção de tomada feita por conteúdo, integração de voz Alexandre caso o arquivo seja transferido com segurança e uma montagem com locução verdadeira, sem comprometer a autoria documental.
