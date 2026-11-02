# Fábrica de Reels — v0.11 | Aço Gráfico em movimento

**Estado:** prova técnica INTERNA. Não há Reel jornalístico aprovado ou publicado.

## O que foi efetivamente produzido

1. Novo módulo `studio/actionqa.py`: fluxo óptico Farneback compensado pelo movimento global mediano da câmera. Produz indicadores de ação local **no próprio arquivo-fonte**, evitando contabilizar só zoom/câmera como ação. Heurístico; pode errar e não comprova autenticidade.
2. `studio/render_v11.py`: motor expressivo passou a aceitar vídeo verdadeiro como entrada, além de fotografias e parallax físico. A cena dinâmica recebe tipografia industrial e identificação de proveniência; imagens históricas mantidas como fac-símile.
3. Uma sequência procedimental original de **simulação gráfica industrial**, feita para o teste. NÃO é gravação da CSN nem reconstrução do acidente de 1962. Recebe duas tarjas legíveis 'SIMULAÇÃO GRÁFICA' e 'NÃO É ARQUIVO HISTÓRICO'.
4. Filmagem sintética validada por análise de ação, com p95 de fluxo residual 14,165 pixels e fração local de 46,8% nas amostras. Teste de movimento global confirmou que um deslocamento de câmera de ~6,7px gera residual p95 pequeno, evitando falso ganho de qualidade por câmera.
5. Vídeo experimental final **11,583 segundos, 540×960, 24 fps, H.264/AAC**, com cinco cenas: fábrica, movimento sintético, bobinas em parallax, metal e jornal de 1962. Trilha original sintetizada, **sem voz**. Audiometria: **−18,9 LUFS**, true peak **−5,6 dBTP**.
6. Teste curto de exportação **1080×1920 / 30 fps / 1,4s** do componente de vídeo; o arquivo de origem do laboratório é de resolução inferior e não equivale a capturar imagens em 1080.
7. **74 testes locais aprovados, 1 ignorado.** Auditoria de quadros do vídeo final em cinco cenas, sem avisos de quadros quase pretos. Também foram corrigidas as legendas obrigatórias de identificação da simulação, antes muito pequenas.
8. Motor completo, gramática visual base e testes foram integrados à PR #44 sem enviar as imagens privadas originais. CI deve ser confirmado independentemente.

## Nota de maturidade (autoavaliação, pesos preservados)

| Dimensão | Peso | v0.10 | v0.11 |
|---|---:|---:|---:|
| Direção por cena | 25% | 7,2 | 7,4 |
| Acervo/proveniência | 20% | 5,3 | 5,4 |
| Voz e sincronização | 15% | 5,2 | 5,2 |
| Composição/renderização | 15% | 9,0 | 9,1 |
| QA audiovisual | 10% | 9,0 | 9,4 |
| Integridade editorial | 10% | 7,8 | 8,0 |
| Reutilização e testes | 5% | 9,9 | 9,9 |
| **Total ponderado** | **100%** | **7,17** | **7,31** |

**Não confundir:** nota 7,31 é julgamento interno da CAPACIDADE da fábrica, não de qualidade estética certificada. A nota artística antiga do Reel V7 permanece 6,63/10. O filme V11 não foi avaliado por especialistas ou espectadores independentes.

## Limites e portões obrigatórios

- **Sem voz Alexandre integrada.** A gravação de ~20,71s está concluída no ElevenLabs, mas o MP3 privado não pôde ser transferido para a montagem. Não foi gerada outra tomada nem simulada a voz.
- **Sem filmagem documental real em movimento.** A integração de clipes é demonstrada exclusivamente por animação original sintética, explicitamente rotulada; o programa agora aceita arquivos de vídeo, mas os direitos e a procedência de futuras filmagens devem ser verificados.
- **Fotografias e jornal sem liberação autoral comprovada** para redistribuição pública. A presença de fonte histórica não valida uso publicável automaticamente.
- **Reel experimental de 540×960**, sem narrador e sem master integral em 1080×1920 com sincronização. Sem avaliação humana em celular.
- Som, movimento, história, documentos e cenas precisam de revisão editorial antes de publicação. Nenhuma publicação ou merge realizado.

## Próximos saltos de maior impacto

A. Obter o MP3 já gerado do ElevenLabs sem regenerá-lo, transcrever/alinha-lo com revisão auditiva e montar o filme pela fala.
B. Coletar **filmes reais licenciados** de Volta Redonda, de trabalho e ambientes em ação; usar nova métrica apenas para ajudar na seleção de tomadas.
C. Produzir três Reels completos sobre assuntos independentes, todos em 1080×1920, qualidade e direitos verificados, revisão externa e comparação A/B.
D. Preservar a linguagem **Aranhaverso-brutalista reinterpretada**: cores fortes, profundidade, textura de impressão, movimento arquitetônico e pausa documental, sem copiar filmes nem banalizar o assunto.