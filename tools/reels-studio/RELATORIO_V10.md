# Fábrica de Reels — rodada v0.10 (02/11/2026 UTC)

**Estado:** provas locais e componente reutilizável integrados na PR #44. Sem merge ou publicação. Autoria/data/licença das imagens históricas e industriais continuam pendentes.

## Entrega executada
- `studio/depth_stage.py`: parallax físico com máscara registrada, imagem original, fundo derivado reconstruído, zoom do primeiro plano, deslocamento independente e oclusão. Imagens-fonte nunca são alteradas.
- Integração em `studio/factory.py` via `depth_mode: "physical"` em cenas `parallax`, mantendo compatibilidade com o modo legado; não aplicar em `document`.
- `tests/test_v10.py` contém fixtures sintéticas; não exige fotografias privadas nem arquivos de usuário no CI.
- `examples/o_peso_do_aco_depth_v10.json`: mesma apuração e proveniência da versão anterior, reconfigurando foco `pan_x:0.28`. Não contém imagens no GitHub.
- **69 testes locais passaram, 1 ignorado**. GitHub Actions no ramo após testes do operador: **sucesso**.

## Demonstrações apenas locais (anexos da conversa)
- Montagem Aço Gráfico com 12,4167 s, **540×960/24fps/H.264+AAC**, trilha sintética original, sem voz Alexandre. Fotos do usuário e fac-símile contextualizado.
- Cena independente do operador com 3,6 s, **1080×1920 nativos/30fps/H.264**, sem áudio. NÃO é um Reel completo em resolução master.
- Correção artística: bobinas inicialmente fora do foco; `pan_x` foi corrigido de 0,50 para 0,28. Isso melhora assunto/composição, sem inventar evidências.
- Amostras de QA: 11 quadros de montagem e 3 quadros do teste 1080, nenhum quase preto. Variação cromática média entre amostras não equivale a avaliação estética.

## Notas internas, não certificação
| Dimensão | Peso | v0.9 | v0.10 |
|---|---:|---:|---:|
| Direção | 25% | 7,0 | 7,2 |
| Acervo/direitos | 20% | 5,3 | 5,3 |
| Voz/sincronia | 15% | 5,2 | 5,2 |
| Composição/render | 15% | 8,7 | 9,0 |
| Auditoria | 10% | 8,9 | 9,0 |
| Integridade editorial | 10% | 7,8 | 7,8 |
| Testes/reutilização | 5% | 9,8 | 9,9 |
| **Total** | **100%** | **7,06** | **7,17** |

**A nota artística do Reel V7 continua 6,63/10**: a prova da fábrica não substitui um Reel final, narrado, licenciado e revisto.

## Obstáculos
Faltam: o MP3 existente da voz profissional Alexandre no ambiente local, legendas realmente alinhadas, filmagem licenciada em movimento, teste celular, revisão independente e integração do renderizador expressivo v0.9/v0.10 local ao GitHub. **Não afirmar que o renderizador expressivo inteiro já está na PR**, embora seu operador físico, teste e manifesto estejam nela.

## Próxima estação
Priorizar transferência da tomada já gerada (sem regenerar), alinhamento humano, acervo audiovisual licenciado, e benchmark em três pautas distintas. Trabalhar a estética Aranhaverso-brutalista por princípios gerais, nunca copiar personagens/frames. Documentos originais permanecem sem estilização factual.
