# VR Abandonada — avaliação da Fábrica de Reels v0.2

**Data:** 01/11/2026 · **Escala:** 0–10 · **Tipo:** autoavaliação provisória de capacidade de produção, não medida objetiva ou avaliação externa. Não confundir com a nota artística do Reel V7 (6,63/10, preservada). **Sem publicação autorizada.**

## Rubrica fixa para fábrica (processo e capacidade criativa)

| Área | Peso | v0.1 (retroativa) | v0.2 | Evidência do avanço |
|---|---:|---:|---:|---|
| Direção narrativa e por cena | 25% | 4,0 | 5,2 | Novo shotlist com sujeito, intenção, motivo de câmera/corte e alerta de repetições |
| Acervo real, direitos e diversidade | 20% | 5,0 | 5,0 | Mesmo acervo, direitos de publicação ainda não confirmados |
| Voz, duração e sincronia | 15% | 2,0 | 4,0 | Integração validada com voz sintética de teste, timecodes conferidos contra transcrição, sem voz Alexandre em MP4 |
| Composição visual / render | 15% | 5,5 | 5,5 | Motor 2,5D mantido; não foi desenvolvida nova biblioteca cinematográfica nesta rodada |
| QA audiovisual automatizado | 10% | 4,0 | 7,5 | Amostragem de frames, alerta para imagem preta e falta de movimento, recusa clipes incompletos |
| Segurança e integridade editorial | 10% | 6,5 | 7,0 | Proteção ao fac-símile e bloqueio de áudio que ultrapassa a timeline |
| Testes, reuso e versionamento | 5% | 7,0 | 8,0 | 13 → 21 testes locais; exportação master já demonstrada antes; CI remoto precisa comprovar v0.2 |
| **Total ponderado** | **100%** | **4,53** | **5,58** | **+1,05 ponto (avaliação interna)** |

### O que NÃO melhorou
A qualidade artística do último Reel V7 permanece 6,63/10, porque não foi produzida uma nova reportagem final para avaliação. O novo teste de áudio usa sinal sintético, não a voz real de Alexandre. Ainda faltam fontes audiovisuais licenciadas, direção de cena e iluminação mais ricas, avaliação humana em celular, mixagem com voz real e sincronização auditada.

## Verificações de regressão executadas
- `python -m pytest -q`: 21 aprovados localmente, com acervo de trabalho disponível.
- Cópia sem ativos privados: 20 aprovados, 1 ignorado (teste que depende do MP4 real pré-existente). Nenhum segredo ou fotografia de terceiros requerido no CI.
- `studio.factory qa` em MP4 v0.1 de 15 segundos: 4 cenas amostradas, sem quadros quase pretos nos pontos amostrados, **publicação bloqueada** por direitos, narração, revisão e outros gates.
- `studio.factory shotlist`: 4 cenas com objetivos e motivo de movimento explícitos, sem novos alertas de gramática repetida no plano atual.

## Qualidade 10/10 — não deve ser automatizada com nota inventada
A fábrica pode medir erros estruturais, metadados e riscos; não pode concluir que uma peça tem relevância jornalística, estética e musical 10/10 sem observação humana. A aprovação final depende de dois avaliadores, teste no celular, documentos/licenças, voz aprovada, som, originalidade visual e comportamento em reprodução normal.

## Próximas duas estações de maior impacto
1. Biblioteca de **4 modelos de cena cinematográfica** alimentados por assets verdadeiros: passagem de retrato para documento, foreground industrial oclusivo, montagem por ação de filmagem, cartografia 2,5D. Cada módulo deve ter testes visuais e performance.
2. Voz profissional própria **Alexandre**, gravação existente no ElevenLabs; importar MP3 e fornecer timecodes revisados. Provar sincronização em vídeo; não pagar pela geração de áudio novamente só para movimentar o arquivo.
