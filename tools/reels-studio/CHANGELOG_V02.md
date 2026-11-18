# Fábrica de Reels — rodada de engenharia v0.2

Data: 01/11/2026. **Estação de software e QA, não upgrade automático da qualidade artística dos Reels.**

## Entregue e demonstrado
- Nova gramática declarativa de direção por cena: tema, sujeito, intenção, movimento motivado e motivo do corte, com revisão de enquadramentos repetitivos e sobreposição de documentos (`studio/director.py`).
- Arquivo de legendas com tempos reais validáveis: sequência ordenada, duração máxima por bloco, checagem literal do texto da narração, proteção contra texto truncado, e renderização em área móvel segura (`studio/captions.py`). **Não é alinhamento automático**.
- Audio gate: impede cortar falas mais longas do que o vídeo; marca sincronia aprovada somente com arquivo temporal, revisão e mídia presente. Importador ElevenLabs anterior permanece disponível, mas o MP3 real não foi transferido para este ambiente.
- Video gate: clipes incompletos são recusados antes da montagem; não há mais fallback silencioso para quadros pretos durante a composição.
- Auditoria visual por fotogramas amostrados (`studio/visualqa.py`): detecção indicativa de sequências quase pretas, sem movimento detectável e sem quadros decodificáveis. Contempla a possibilidade de uma pausa documental intencional.
- Rubrica editorial: documentos não recebem título de efeito em cima da fonte original, evitando mascarar o fac-símile. Enquadramentos e texto narrado continuam dependentes de revisão humana.
- Duas provas independentes: (1) render com trilha sintética de teste e mudança de legendas (NÃO é Alexandre); (2) 15s de O Peso do Aço reanalisados sem falsificar novos resultados artísticos.
- **21 testes locais** aprovados; **20 aprovados/1 ignorado** no teste da cópia sem acervo privado; CI remoto ainda necessita rodar depois da PR.

## A conta correta
A fábrica ficou mais robusta em produção técnica e QA; a nota de um Reel real **não muda automaticamente**. O protótipo V7 permanece em 6,63/10 pela rubrica subjetiva anterior. Não foi produzido nem auditado um Reel final com narração sincronizada ou filmagens verificadas nesta rodada.

## Limitações abertas
- Sem voz Alexandre importada no MP4; geração anterior existe no ElevenLabs, transferência/arquivos de timing pendentes.
- Sem biblioteca de efeitos autorais cinematográficos avançados (Remotion/Blender), sem filmagens licenciadas, sem render humano 10/10.
- Licenças e autoria de fotos industriais e scan do jornal ainda pendentes para publicação.
- Faltam teste de tela em celulares reais, revisões por duas pessoas e métricas de retenção.

## Próxima estação
Biblioteca modular de cenas específicas: industrial parallax, evidence-dive, retratos de jornal, filmagem verificável, narrativa urbana. Medir cenas pelo propósito e pelos materiais, não por efeitos genéricos. Integrar a tomada existente de Alexandre com MP3 e timings revisados sem repetir geração sem necessidade.
