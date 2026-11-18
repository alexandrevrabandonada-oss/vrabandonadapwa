# Fábrica Aço Gráfico v0.39 — direção adaptativa por intenção narrativa

**03/11/2026 · PR #44 em rascunho · experimento interno, não publicado**

## Mudança concreta

Em vez de simplesmente escolher uma paleta ou uma velocidade para o vídeo inteiro, o diretor atribui oito coreografias originais e dois perfis de tempo segundo a função de cada plano. Na fotografia de **1941** da construção da CSN e no interior de **1969**, o movimento desacelera para permitir leitura. Nas cenas de **2014**, o enquadramento acelera. A ação filmada de siderurgia usa um ritmo cinético, mas a identificação da **França, 2011**, desacelera para evitar confusão com a CSN; o encerramento também faz pausa.

**Plano:** oito tomadas, quatro de leitura/repouso e quatro cinéticas. A paleta é mantida; não se cria efeito cromático para disfarçar a repetição visual. O novo MP4 foi renderizado em 1080x1920/30 fps/14,5 s usando hashes conferidos dos quatro originais e não quadros extraídos de outro Reel. São três fotografias locais (1941, 1969, 2014) e uma filmagem francesa autêntica (2011). Uma fotografia de 2014 ainda aparece em dois planos, limite declarado.

## Evidências locais verificadas

- **12 testes de regressão aprovados**, cobrindo integridade, cronologia, palavras cronometradas, duas velocidades, oito gramáticas, créditos de origem, ausência de locução fictícia e nenhuma publicação.
- **H.264/AAC, 1080x1920, 30 fps, 14,5 s, −16,15 LUFS, −1,99 dBTP** conforme FFprobe e FFmpeg EBU R128.
- **Oito de oito cenas** aprovadas em auditoria de diferenças de pixels: cada quadro médio do master ficou inequivocamente mais próximo da variante A ou B correspondente ao perfil indicado no plano. Relatório `V39_AB_MOTION_PROOF.json`.
- Sete transições entre cenas a **no máximo 0,098 segundo** de inícios de palavras da transcrição Scribe v1 da tomada profissional Alexandre, embora a voz **não esteja embutida** no MP4.
- Fotos de Arquivo Nacional 1941 e 1969, CSN 2014. Vídeo estrangeiro explicitamente não identificado como CSN e jamais apresentado como imagens de acidentes da usina.

## Duas notas — estimativas internas, não avaliações independentes

**Qualidade artística: 7,78/10** (+0,04 em relação à v0.37, 7,74), com pesos canônicos identidade 20%, composição 15%, movimento 15%, acervo 15%, narrativa 10%, legendas 10%, áudio e voz 15%. O ganho é moderado e restrito à adequação do ritmo à função jornalística. **Capacidade técnica: 8,91/10 mantida até passar o CI remoto v0.39**, tendo anteriormente sido verificada localmente. Um teste automático não certifica qualidade estética.

## Limites e próximos passos

A voz Alexandre já gerada no ElevenLabs tem cerca de 14,071 s e 32 palavras cronometradas, mas seu arquivo MP3 **ainda não chegou ao renderizador** por limitação do conector. O novo MP4 continua com trilha instrumental e legendas referenciadas por tempos reais; nenhum novo áudio pago foi solicitado. Não há filmagem local em movimento comprovadamente feita na CSN. Ainda são necessárias avaliação humana, análise em celular e teste de retenção. Não fazer merge nem publicar neste estado.
