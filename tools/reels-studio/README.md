# Fábrica de Reels VR Abandonada — v0.1 (protótipo executável)

**Resultado real:** um motor audiovisual reutilizável, separado do portal e sem qualquer API de publicação. Produz provas internas de composição 2,5D e valida fontes, direitos, duração, narração e saída. **Não representa um sistema artístico ou editorial 10/10 concluído.**

## Componentes

| Componente | Estado em v0.1 | Gate / limitação |
|---|---|---|
| Manifesto JSON por Reel | implementado | fatos e fontes declarados, não inferidos |
| Acervo com proveniência | implementado | bloqueia publicação com direitos pendentes |
| Cenas reutilizáveis `photograph`, `parallax`, `document`, `clip` | implementado | movimento ainda básico, trabalho 3D avançado pendente |
| Render 9:16 (540×960 preview, 1080×1920 master) | implementado | master final deve ser testado em ambiente de render |
| Importação de voz já gerada | implementada | MP3 precisa ser disponibilizado localmente; tempo deve caber nas cenas |
| Mix com FFmpeg | implementado | loudness/mix devem ser medidos e aprovados após áudio real |
| Scorecard e backlog ponderado | implementado | nota artística exige avaliação humana; não é IA pontuando a si mesma |
| Variantes de câmera | implementado | somente câmera; preserva evidências, tempo, legenda e direitos |
| QA técnico e bloqueio de publicação | implementado | não substitui verificação jurídica/editorial |
| Correção tipográfica auto, supervisão ótica/semântica | pendente | QA em celular necessário |
| Voz e legendas palavra a palavra | não integrado | sem MP3/timing confirmado não afirmar sincronização |
| Remotion / Blender avançado | alvo de arquitetura | não instalados nem testados neste pacote |
| Publicação Instagram/site | **desativada por design** | somente após revisão e integração separadas |

## Uso local

```bash
python -m pip install -r requirements.txt
python -m studio.factory validate --project examples/o_peso_do_aco.json
python -m studio.factory render --project examples/o_peso_do_aco.json --mode preview
python -m studio.factory qa --project examples/o_peso_do_aco.json --mode preview
python -m studio.factory improve --project examples/o_peso_do_aco.json --ratings examples/scorecard_v7.json
python -m studio.factory variant --project examples/o_peso_do_aco.json --style kinetic --output examples/o_peso_do_aco_kinetic.json
# Produção HD: quando fontes e parâmetros estiverem validados
python -m studio.factory render --project examples/o_peso_do_aco.json --mode master
pytest -q
```

### Importar áudio existente sem refazer geração

```bash
python -m studio.voice --project examples/o_peso_do_aco.json --audio /CAMINHO/A/NARRACAO_APROVADA.mp3
```

Essa ação gera um novo manifesto em `output/`, sem alterar o original. **Se o áudio for mais longo que a soma das cenas, o importador BLOQUEIA**, para impedir truncamento de depoimentos e fatos. O sincronismo de palavras exige alinhamento separado e inspeção humana: importar áudio não significa legenda sincronizada.

## Entradas e saídas da linha

Entrada: manifesto, arquivos locais, metadados de direitos, evidências para claims, texto narrado e MP3/timings aprovados. Saídas: MP4, metadados FFprobe, scorecard, relatório de bloqueios, backlog de melhorias e variantes de câmera.

**Operação por pauta:** coleta/acervo → checagem editorial → shotlist/manifesto → geração de áudio aprovada → montagem e variantes → render → QA técnico + revisão 2 pessoas → correção → pacote para aprovação → publicação (fora desta ferramenta).

## Regra 10/10: aprovação não é automática

- Grade qualitativa ponderada: direção de arte 20%, profundidade 15%, ação 15%, acervo 15%, montagem 10%, tipografia 7%, cor 5%, voz/áudio 7%, integridade editorial 6%.
- Score >=9,5 **permite encaminhar para revisão**, nunca concede aprovação.
- Duas avaliações humanas independentes de celular e audição integral, com critérios por shot. Mostrar discordâncias, não reduzir tudo a média.
- Para o conteúdo ir a público: 100% dos arquivos utilizados com direitos compatíveis, todos os claims com evidência, áudio e legendas conferidos, versão 1080×1920 30fps, revisão de crédito, privacidade e contexto histórico; aprovação editorial final explícita.
- Conteúdo cuja verificação esteja pendente pode ser renderizado como **estudo interno**, nunca publicado automaticamente.

## Arquitetura proposta de evolução

V0.1 motor local simples (este pacote); V0.2 catálogo persistente/ingestão e mídia em storage protegido; V0.3 Remotion Studio + componentes cinematográficos configuráveis + edição por cena; V0.4 auditoria de temporização, acessibilidade e render em CI; V1.0 distribuição assistida após aprovação. Blender opcional para planos 3D, não requisito de todo Reel. Documentos e imagens da época devem permanecer distinguíveis de reconstruções.

**Atenção aos direitos:** diretório `private_assets/` é apenas para teste interno. As imagens enviadas pelo usuário são de autoria e direitos não verificados; não faça commit, distribuição externa ou publicação sem apuração e autorização necessárias. A imagem do jornal é evidência do que foi **publicado na edição**, não comprovação de números finais do episódio. A trilha sintética, quando usada, não é captação real na usina.

## Biblioteca cinematográfica v0.3 (experimental)
`studio/cinema.py` adiciona cor expressiva por cena (`molten`, `steel-blue`, `silver`, `industrial-ink`), luz móvel controlada, perspectiva leve, profundidade com máscara suavizada e um palco de página inteira para documentos. Configure apenas em cenas ilustrativas:
```json
"cinema": {"grade": "steel-blue", "grade_intensity": 0.56, "light": "cool",
           "light_opacity": 0.16, "perspective": 0.012, "depth_focus": 0.4}
```
Em cenas `document`, o motor bloqueia efeitos estilísticos sobre a fonte. A visualização da página inteira preserva a integridade do fac-símile. Use `examples/o_peso_do_aco_cinema_v03.json` com arquivos locais de trabalho; fotografias e jornal originais não são redistribuídos no GitHub. O CI usa mídias sintéticas nos testes. A demonstração v0.3 não inclui voz, não é uma reportagem e não foi aprovada para publicação.

## v0.4 — montagem orientada a roteiro (teste interno)
- `studio/beatcut.py`: cada cena pode ter `edit_beats` com `scene_id`, `time_sec`, `reason` e `audio_anchor` textual de roteiro; **não são timecodes reais da voz**.
- `studio/motion.py`: `camera_keyframes` controlam foco, deslocamento e zoom no decorrer da cena; 2 a 12 pontos com `at` em segundos e `focus:[x,y,zoom]`.
- `studio/layout.py`: títulos e identificação de fontes passam por medição tipográfica para não serem cortados no celular.
- `studio/benchmark.py`: aceite 10/10 depende de **três produções em temas diferentes**, nota criativa humana/externa >=9.5, direitos liberados, voz sincronizada, revisão mobile e aprovação editorial.
- Exemplo de anotação: `"edit_beats":[{"scene_id":"s01","time_sec":0,"reason":"Situar o território","audio_anchor":"Em janeiro"}]`.
- Exemplo de câmera: `"camera_keyframes":[{"at":0,"focus":[0.5,0.48,1.0]},{"at":3,"focus":[0.55,0.5,1.12]}]`. A última marca deve coincidir com a duração da cena.
- Rodar `python -m studio.factory editplan --project <manifesto.json>` para inspecionar o plano de edição. A geração prévia da voz Alexandre no ElevenLabs não foi transferida; não afirmar sincronização verificada.
- Relatório v0.4: `RELATORIO_V04.md`. Sem autorização de publicação, não inclui acervo privado nem MP3 no repositório.

## v0.5 — áudio verificável e acervo com procedência

- `studio/alignment.py` recebe arquivos JSON com `words:[{text,start,end}]`; não calcula timing por velocidade presumida. Confere todos os termos contra o texto aprovado e exporta `.json` (cues) + `.srt`, com flag **DRAFT_TIME_CODES_NOT_HUMAN_REVIEWED**.
- Exemplo: `python -m studio.alignment --words /CAMINHO/words.json --transcript /CAMINHO/roteiro.txt --duration 20.712 --output output/legendas_rascunho`.
- `studio/audioqa.inspect_audio(Path("output/reel.mp4"))` mede EBU R128 e true peak.
- `studio/provenance.snapshot(project, workspace)` registra origem e SHA-256; hash não prova direito de publicação.
- A mixagem da faixa única de voz recebe compressão moderada + normalização, evitando que TTS baixíssimo chegue sem tratamento ao master.
- Há testes de regressão `tests/test_v05.py` e registro em `RELATORIO_V05.md`. **Os três ensaios audiovisuais de outras pautas usam voz e imagens sintéticas de laboratório, não a voz Alexandre.** Foram gerados localmente; não são acervo jornalístico nem foram commitados por direitos/privacidade.
- A gravação profissional Alexandre permanece gerada no ElevenLabs, mas indisponível ao renderizador: não elevar a nota de sincronização real nem alterar os gates editoriais.

## v0.6 — gramática cinematográfica e transferência de voz existente

As cenas podem usar `"transition_in":{"style":"print_registration","duration":0.25}`, com opções `hard_cut`, `slag_reveal` e `press_gate`; duração máxima 0,45s e no máximo metade da cena. A regra não altera o arquivo de imagem/documento: é um efeito temporário de montagem.
`studio.variants_v06.produce(manifest, 'restrained'|'expressive')` gera duas alternativas A/B, preservando imagens, origens, direitos, texto e referências.
`python -m studio.voice_delivery --source /CAMINHO/tomada_original.mp3 --output private_assets/voz/alexandre_original.mp3 --expected-duration 20.7122` registra a gravação original já obtida pelo usuário sem solicitar síntese; o status de sincronização permanece não verificado, até conferência do áudio e alinhamento.
O arquivo MP3 do ElevenLabs não foi transferido durante esta rodada; nenhum vídeo de prova contém a voz profissional real. O desempenho de renderização de variantes longas ainda precisa de otimização. Ver `RELATORIO_V06.md` para notas, testes e pendências. Não colocar áudios privados, credenciais ou imagens sem direitos em commits.

## v0.7 — otimização A/B verificável
- `studio/fast_stills.py` prepara fotografias para câmera virtual com cache LRU limitado a 96 MiB, registrando `photo_cache` no relatório; arquivo original permanece inalterado.
- `studio/visual_grammar.py` memoriza geometria das três transições por resolução. A auditoria de fidelidade compara o efeito otimizado ao algoritmo anterior e preserva documentação.
- 52 testes locais passaram (+ 1 skip), e ambas as variações do filme piloto foram renderizadas a **24 fps** (303 quadros; 12,625s; 540×960) em ambiente local, sem narração. Os exemplos não são peças publicáveis.
- Relatório com benchmarks de operadores, notas conservadoras e bloqueios: `RELATORIO_V07.md`.
- A voz profissional Alexandre continua gerada no ElevenLabs, mas **ainda não está no MP4**. Nem os direitos das imagens nem a revisão humana estão concluídos.

## v0.10 — parallax fotográfico físico (protótipo)
- `studio/depth_stage.py` separa fotografia, fundo derivado e máscara registrados nas mesmas coordenadas; movimenta planos independentes com oclusão. São **derivados visuais**, não novas evidências.
- Em cenas `type: "parallax"`, configurar `"depth_mode":"physical","pan_x":0.28,"pan_y":0.55,"depth_strength":1.45` com `asset`, `background_asset` e `mask_asset`.
- O modo antigo permanece disponível. Não aplicar `depth_mode` em cenas `document`; a validação rejeita o uso.
- O exemplo `examples/o_peso_do_aco_depth_v10.json` usa arquivos privados por referência, sem redistribuir fotos. O CI testa com fontes sintéticas.
- Master 1080×1920/30fps foi verificado **apenas para uma cena de 3,6 s**; montagem de 12,4s ainda é prévia 540×960/24fps, sem voz sincronizada.
- Biblioteca de identidade expressiva local **não sincronizada integralmente** ao repositório; especificação no arquivo `IDENTIDADE_BRUTALISMO_EXPRESSIVO_V09.md`. Relatório de auditoria: `RELATORIO_V10.md`.
