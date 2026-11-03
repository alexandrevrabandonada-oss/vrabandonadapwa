# Fábrica Aço Gráfico — v0.25 · identidade Aranhaverso-brutalista autoral

**03/11/2026 · PR #44 draft · Reel privado, não publicado**

## Resultado efetivamente renderizado

Dois Reels experimentais em **14,5 s / 540×960 / 24 fps / H.264 + AAC**:

- **A — Zine industrial:** amarelo de segurança, magenta e ciano, retícula de serigrafia, separação de cores e composição brutalista.
- **B — Documental:** retícula reduzida e ciano como assinatura editorial, mantendo os mesmos fatos.
- **7 composições**, com ritmos e movimentos próprios: `imprint`, `monument`, `printer`, `furnace`, `filmstrip`, `collision`, `resolution`.
- Legendas de **32 palavras com timestamps reais** produzidos previamente por ElevenLabs Scribe para a voz Alexandre. A voz **NÃO** está audível nos MP4s: trilha instrumental original de laboratório, claramente identificada.

Fontes reais, sem inventar tomadas: fotografia de 2014 da CSN em Volta Redonda, de HenriqueBarraMansa (Commons), e filmagem de siderurgia de 2011 na França, de Damien Vicart (Commons). A fonte francesa é creditada na própria cena e nunca apresentada como CSN.

O ritmo de imagem acompanha o texto aprovado: foto de 2014 até depois do fim da data narrada (6,049 s); vídeo industrial a partir de 6,22 s, antes da palavra `siderurgia` em 6,861 s; duas fontes separadas no fechamento. As cenas geradas pela fábrica são animações de *layout*, não novos eventos históricos.

## DNA visual permanente

A referência do Aranhaverso será traduzida de maneira original em `Aço Gráfico | Brutalismo Expressivo Documental`, sem copiar personagens, elementos proprietários ou quadros do filme:

1. Retícula irregular/halftone aplicada como camada gráfica separada; o vídeo original permanece identificável.
2. Registro deliberadamente deslocado em 2–4 px **na tipografia**, e não nos documentos primários.
3. Grandes massas de cor cobalto/ink, magenta, ciano, cobre e amarelo de segurança, relacionadas à ideia de indústria/impressão.
4. Geometrias de fábrica/chapas, cortes oblíquos e planos visuais com movimento independente; não depender exclusivamente de cartões/texto.
5. Linhas de velocidade e efeitos gráficos modulados a **12 fps efetivos** sobre vídeo preservado em 24 fps (on twos).
6. Gancho forte, alternância entre imagem histórica de contexto e filmagem de ação real, pausa de leitura e conclusão editorial.
7. Crédito territorial e temporal coerente, legenda próxima do centro do celular, sem conflito com títulos.

Fonte de técnicas gerais: Sony Pictures Imageworks, Making Spider-Man: Into the Spider-Verse, https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse .

## Avaliação obrigatória — notas com critérios fixos

**Notas subjetivas editoriais internas do modelo, NÃO aprovação artística independente nem métricas de engajamento.** Pesos: identidade 20%; composição 15%; movimento/montagem 15%; qualidade/variedade do acervo 15%; narrativa 10%; legendas 10%; som/voz 15%.

| Versão | Nota artística estimada /10 | Natureza |
|---|---:|---|
| v0.24 (avaliada retrospectivamente) | **5,80** | Mais regular, tarjas horizontais repetitivas |
| v0.25 A — Zine industrial | **6,61** | Mais identidade e recortes industriais; falta voz |
| v0.25 B — Documental | **6,45** | Mais legibilidade documental, menos originalidade de impressão |

**Ganho artístico estimado v0.25 A frente à v0.24: +0,81.** Não é métrica de retenção nem nota de avaliador externo. Capacidade técnica de processo histórica **8,14/10**; estimativa **8,24/10** após novos operadores e 10 testes locais (sujeita à aprovação da integração CI). Nunca misturar nota de processo e nota da obra.

O scorecard de cada rodada deve continuar sendo mantido em JSON e sempre acompanhado de incertezas e da diferença entre imagem original e animação. **O CI não pode atribuir nota artística 10/10 automaticamente**.

## O que realmente passou localmente

- **10 testes V25**: grade de 7 planos, limites/cronologia da narração, fonte real, integridade SHA, variação A/B, legibilidade/segurança de 32 palavras, animação verificável e bloqueios de publicação.
- QA de ambos os vídeos: 14,5 s, 540×960, 24 fps, H.264/AAC, sem quadros vazios nas sete amostras; áudio **−17,3 LUFS e −3,1 dBTP** em ambos; deslocamento entre fotogramas de ação real acima do limiar de diagnóstico.
- O motor funciona com fotografia e filme baixados localmente e **não gera imagens alucinadas de eventos históricos**.

Arquivos entregues em `studio/spider_brutalist_v25.py`, `studio/qa_brutalist_v25.py`, `tests/test_spider_brutalist_v25.py`, `examples/scorecard_aranhaverso_v25.json` e workflow `reels-studio-v25-brutalista.yml`.

## Auditoria crítica — por que ainda não é 10/10

1. **Locução ausente**: o ElevenLabs gerou a voz profissional Alexandre (14,07 s) numa rodada anterior, mas não foi possível transferir o MP3 assinado à máquina de render. Neste turno, não foram consumidos créditos em uma nova geração.
2. **Acervo ainda estreito**: uma foto real da CSN e um filme estrangeiro. O movimento industrial é real, mas falta ação local e desenvolvimento da história específica de Volta Redonda.
3. **Direção ainda fechada em 7 planos**: os efeitos são reutilizáveis, mas não existe ainda um roteirista que recomponha livremente os layouts de cada pauta.
4. **Som**: instrumental sintetizado funcional, porém sem narração, mix autoral refinada e sound design original com referência industrial.
5. **Master**: protótipo é 540×960/24; a capacidade de master nativo 1080×1920/30 para ESTA linguagem precisa ser provada, não simulada via upscale e chamada HD.
6. **Validação independente**: sem uma banca de revisão em celular, comparação cega A/B ou teste real de retenção. Não elevar nota com base somente na opinião do gerador.

## Próximo salto funcional

Priorizar uma ponte para receber o MP3 já pago **sem gerar de novo**, sincronizar fala/legenda e inserir no master; construir um planejador declarativo que extraia do roteiro as cenas e suas relações com o acervo, ao invés de 7 beats hardcoded; produzir ao menos três pautas com filmagem local real e três grades visuais automaticamente; testar master HD real e scorecard humano. Direitos continuam sendo um gate separado antes de publicação, e não o foco das rodadas criativas.

**Estado:** versão v0.25 local renderizada, GitHub PR #44 em rascunho, sem merge e sem publicação. O status específico de CI será atualizado somente após confirmação da execução.
