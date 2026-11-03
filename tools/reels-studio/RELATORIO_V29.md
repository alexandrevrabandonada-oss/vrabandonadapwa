# Fábrica Aço Gráfico v0.29 — primeira composição vertical nativa Full HD

**03/11/2026 · PR #44 rascunho · não publicado**

## Por que esta rodada é diferente

O motor vinha exportando previews 540×960 a 24 fps, com aparência repetitiva de blocos sobre fotografias. A v0.29 **desenha novamente cada fotograma em resolução 1080×1920 a 30 fps**, em vez de ampliar o MP4 540×960; recorta diretamente a fotografia original da CSN de 1440×960 e o filme siderúrgico original em 1920×1080. A resolução gráfica, tipografia, legendas e geometria são nativas; o enquadramento 9:16 necessariamente recorta/reamostra áreas das fontes horizontais e não implica que elas foram captadas em 9:16.

## Conteúdo e montagem — contextos explicitamente distintos

- CSN em Volta Redonda: fotografia real de 2014 de HenriqueBarraMansa, SHA-1 `6a792f0fd16ddd4c8bed2ca981788c9b9accb7a4`.
- Usina siderúrgica **na França**, filmada por Damien Vicart em 2011, SHA-1 `c1129cac8654866856c7bec31196206f16eac6c7`. Nunca apresentada como filmagem da CSN.
- Sete planos de 0–14,5 s; três papéis visuais da fotografia (abertura de faixas, cópia de arquivo, composição horizontal), três trechos distintos da siderurgia (faíscas, trabalhador, luz de forno) e uma comparação final das duas origens. Quatro janelas temporais diferentes do vídeo original; corte e seleção **predefinidos e verificáveis** nesta pauta demonstrativa. **Ainda não é direção universal automática para qualquer filme**, embora seu módulo de composição possa ser reutilizado.
- Identidade de impressão brutalista documental inspirada em técnicas gerais de quadrinhos animados: separação de cores **apenas na tipografia**, retículas em faixas de design, planos fotográficos, diagonais, luz, título monumental inicial de curta duração e legendas com destaque da palavra ativa. Não há personagens, quadros ou símbolos copiados de propriedade audiovisual de terceiros.

## Narração, legendas e honestidade do arquivo

São usados os 32 carimbos de tempo **reais** da transcrição ElevenLabs Scribe da tomada Alexandre de 14,071 s, já sintetizada em rodada anterior, sem recomputação baseada em velocidade do texto. Os arquivos `.srt` e a faixa de legendas decorrem desses tempos. Foi implementada uma opção `--voice <MP3>` que só marca `voice_embedded=true` quando o arquivo existe, pode ser decodificado e sua duração coincide com a transcrição. Ele é então mesclado com a trilha industrial original sob compressão sidechain.

**Limitação atual:** os bytes do MP3 não estão presentes no container e a URL temporária não foi importada pelo conector. A prévia atual tem **trilha sintética original, sem narração Alexandre**. O vídeo identifica esse fato no próprio rodapé. **Não comprar nova voz só para repetir o mesmo texto.**

## Infraestrutura nova

- `studio/master_director_v29.py`: master 1080x1920/30, fontes com SHA-1 fixos, 7 planos documentais, grafismo Aranhaverso-brutalista autoral, cortes temporais, 32 palavras destacáveis, música original sintetizada, controle de voz pelo arquivo real e desativação de publicação.
- `studio/master_qa_v29.py`: FFprobe, EBU R128, true peak, verificação do movimento entre fotogramas, legibilidade de metadados, geração de SRT com as marcas originais e folha de contato.
- `tests/test_master_director_v29.py` e `tests/test_master_qa_v29.py`: 11 testes locais contra falsificação de origem, falsos áudios, lacunas temporais, integridade de plano, dimensão nativa, legenda, gráficos e efeitos.
- `.github/workflows/reels-studio-v29-native-master.yml`: reproduz master e QA com mídias autênticas verificadas por SHA, sem segredo nem geração ElevenLabs, e preserva artefatos internos.

## QA, notas e limites

O master interno teve **1080×1920, 30 fps, 14,5 segundos, H.264/AAC** verificados. O medidor independente FFmpeg EBU R128 da primeira versão anotou **−16,1 LUFS e −1,8 dBFS true peak** e movimento visual detectado nos trechos de ação. Pontuações abaixo são estimativas editoriais internas, não avaliações independentes.

| Métrica | v0.28 | v0.29 |
|---|---:|---:|
| Reel artístico (melhor versão) | 7,09/10 | **7,18/10** |
| Capacidade técnica da fábrica | 8,50/10 | **8,60/10** |

**Por que ainda não é 10/10?** Roteiro demonstrativo sem novo furo jornalístico; três cenas usam uma única foto original; a ação mostrada foi captada na França; falta MP3 Alexandre no arquivo; faltam avaliações independentes mobile e testes reais de retenção, e a arte ainda depende de estilos pré-definidos.

O 1080p nativo é ganho real de infraestrutura audiovisual, **não uma promoção automática da nota estética**. Direitos e aprovação editorial continuam como etapa separada antes de publicar, mas não paralisaram a montagem interna.
