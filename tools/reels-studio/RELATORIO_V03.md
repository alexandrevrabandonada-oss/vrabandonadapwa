# Fábrica de Reels — Rodada v0.3 | 01/11/2026

**Projeto:** VR Abandonada. **Status:** protótipo interno — nenhuma publicação, merge ou aprovação de direitos.

## Capacidade entregue
- Biblioteca reutilizável em `studio/cinema.py`: notas de cor motivadas (`molten`, `steel-blue`, `silver`, `industrial-ink`), perspectiva leve por cena, passagem de luz, foco em profundidade e máscaras de oclusão suavizadas.
- O motor de manifesto JSON aceita `cinema` por cena, sem reescrita do código. Valores de perspectiva/iluminação têm limites configurados e testados.
- Cenas `document` rejeitam grade e perspectiva cinematográfica; `document_view: full` enquadra a página inteira sem cortar a manchete.
- Exemplo `examples/o_peso_do_aco_cinema_v03.json` reutiliza os assets privados já existentes, sem transportar imagens ao GitHub.
- **27 testes locais**, contando 6 novos; CI da PR deve ser verificado independentemente.

## Prova local
Filme experimental **12 segundos, 540×960, 24 fps, H.264, sem áudio**, com fotogramas de conferência. QA automático amostrou quatro cenas e não apontou quadros praticamente pretos. É demonstração de composição, não Reel final e nem uma avaliação estética 10/10.

## Autoavaliação de capacidade da Fábrica
Mantida a rubrica da v0.2, para evitar inflação:
| Dimensão | Peso | v0.2 | v0.3 |
|---|---:|---:|---:|
| Direção por cena | 25% | 5,2 | 5,5 |
| Acervo/direitos | 20% | 5,0 | 5,0 |
| Voz/sincronização | 15% | 4,0 | 4,0 |
| Composição e render | 15% | 5,5 | 6,6 |
| QA audiovisual | 10% | 7,5 | 7,5 |
| Integridade editorial | 10% | 7,0 | 7,3 |
| Testes/reutilização | 5% | 8,0 | 8,5 |
| **Total** | **100%** | **5,58** | **5,87** |

São avaliações internas. A nota artística anterior da V7 (**6,63/10**) não muda sem novo Reel final e avaliação humana.

## O que ainda falta para excelência
A montagem é majoritariamente uma sequência de fotos com movimento, sem ação filmada, sincronização de voz e legendas verificadas, variedade audiovisual, identidade animada mais sofisticada ou teste de percepção em celular. **Não inflar a nota por acrescentar filtros.**

Próximos gates: importação do MP3 já gerado com voz Alexandre (sem geração duplicada), alinhamento real das legendas, clipes documentais licenciados com movimento, transições guiadas por ação e revisão A/B com avaliadores. Direitos, autoria e data das imagens fornecidas continuam pendentes e o gate de publicação permanece **BLOQUEADO**.