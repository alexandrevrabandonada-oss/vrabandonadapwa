# Aço Gráfico — v0.20 | curadoria de tomadas por ação local

**02/11/2026 · PR #44 draft · demonstração interna · nenhum Reel liberado**

## Problema real encontrado na v0.19
O renderizador escolhia um único trecho da reportagem de 2017 pela posição temporal (`--start 41`), sem justificar o valor da cena. Um trecho inicial de estúdio já havia passado nos testes técnicos. A substituição por uma entrevista em contexto da inauguração melhorou a pertinência, não a energia audiovisual. Uma fotografia animada + entrevista estática não atende à direção Aço Gráfico.

## Implementação entregue nesta rodada
- `studio/shot_scout_v20.py`: verifica tamanho/hash SHA-1 contra o manifesto de origem previamente criado; varre intervalos do vídeo original; mede fluxo óptico local compensado pelo deslocamento global e reporta possíveis cortes, exposição e nitidez.
- Ranking **heurístico** de propostas de trechos que exijam revisão humana; exclui janelas sem movimento local suficiente, não confunde um corte de edição com ação por si só. Nenhum classificador atesta que a cena é Volta Redonda, CSN, trabalhador, prova histórica ou uso autorizado.
- Relatório integral JSON para todas as janelas, lista reduzida de candidatos sem sobreposição e folha de contato com dois fotogramas por trecho selecionado.
- `tests/test_v20.py`: experimentos sintéticos com movimento, cena estática, corte, manifesto alterado e bloqueio de direitos.
- `.github/workflows/reels-studio-v20-shot-scout.yml`: ensaio reproduzível sobre a **mesma** reportagem NBR/TV BrasilGov de 2017 já obtida na v0.19. Os originais permanecem fora do repositório. Artefatos internos com retenção de 7 dias.
- Saída continua `publication_approved=false`, `rights_cleared=false` e `aesthetic_quality_certified=false`.

**Importante:** O teste v0.20 NÃO adiciona uma terceira filmagem local e NÃO constitui um novo Reel. Os fotogramas selecionados e eventual aproveitamento cinematográfico dependem da execução do workflow e de avaliação visual.

## Fontes públicas revisadas durante a pesquisa de acervo
- [Categoria de vídeos de Volta Redonda no Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Videos_from_Volta_Redonda) apresenta somente um vídeo categorizado na página consultada, `Beltane 2011`, sem pertinência presumida às pautas siderúrgicas. A categoria é **incompleta**: a própria reportagem da rodovia existe fora dela.
- [Reportagem da Rodovia do Contorno, 2017](https://commons.wikimedia.org/wiki/File:Rodovia_do_Contorno_%C3%A9_inaugurada_ap%C3%B3s_22_anos_de_obra.webm): contém imagens de Volta Redonda, mas é cobertura institucional da inauguração, e sua licença declarada CC BY 3.0 ainda precisa de revisão.
- [Fotos de Volta Redonda](https://commons.wikimedia.org/wiki/Category:Volta_Redonda): acervo fotográfico relativamente maior, **não é substituto** para filmagens de pessoas e máquinas em ação.

## Próxima exigência artística (ainda não comprovada)
1. Inspecionar os fotogramas da folha de contato e escolher trechos **com acontecimento visível**, descartando entrevistas e elementos gráficos de estúdio, mesmo que obtenham escore alto por movimento.
2. Ampliar o acervo com vídeo captado em Volta Redonda e autorização/licença verificada; diferenciar material licenciado, material com revisão pendente e cenas ilustrativas de outras localidades.
3. Compor uma montagem dirigida por **ação → consequência → evidência**, preservando o documento original, a identificação da fonte e variedade de planos; evitar cartão de texto repetitivo.
4. Recuperar, sem regenerar, o arquivo já existente da voz profissional Alexandre; medir duração, sincronizar legendas e ouvir a mixagem. Enquanto ausente, o vídeo permanece sem narração própria.
5. Medir renderização/QA e submeter ao olhar humano em tela de celular antes de qualquer nota artística ou avanço da fábrica.

## Critérios não negociáveis
- Procedência/hashes **não provam autoria, licença ou veracidade**.
- Movimento óptico **não prova ação humana real** (podem existir overlays, sombras, cortes e animação).
- Nenhum frame de 2014 ou 2017 representa o acidente de 1962.
- Não autorizar publicação automática, merge ou divulgação a partir de testes técnicos.
- **Nota da capacidade permanece 8,14/10 até a v0.20 demonstrar ganhos e os testes passarem.** Nota artística exploratória da v0.19: 6,2/10; não há novo filme avaliado.


## Auditoria por amostragem da fonte original (rodada v0.20.1)
- A execução **41549381823** do novo workflow V20 passou e gerou o pacote de revisão. Arquivos originais verificados novamente pela fonte Commons.
- Relatório da v0.20: **60 janelas examinadas; 45 janelas candidatas a ação**, por heurística óptica. Oito foram listadas na folha de contato; várias receberam nota automática **100/100**.
- Revisão dos oito exemplos selecionados **e amostragem a cada 5 s do vídeo original 0–165 s** mostrou um erro estrutural: animação e grafismos televisivos 0–13 s e 157–169 s; apresentação em estúdio ~13–41,5 s; enquadramento de entrevista na rodovia ~41,5–157 s. Limites são aproximados, não decupagem quadro a quadro.
- As oito propostas visualizadas eram inadequadas ao objetivo de ação cinematográfica local. **Nenhuma foi pré-selecionada editorialmente.** Isso não diz que não haja qualquer movimento local em toda a fonte; significa que a auditoria por amostragem encontrou **zero tomadas aprovadas para compor o filme de ação**.
- Novo `studio/editorial_curation_v20.py` exige intervalos documentados, revisão identificada e correspondência de hash antes de levar qualquer sugestão à lista de pré-seleção. `examples/rodovia_curadoria_v20.json` contém a revisão visual por amostragem. Uma janela que atravessa dois intervalos ou que cai em grafismos/entrevista é **recusada**, independentemente da nota automática.
- `tests/test_editorial_curation_v20.py` cobre pontuação alta falsa, divergência de fonte, intervalos não cobertos, janela que cruza categoria e recusa de certificação automática de publicação. O workflow V20 invoca o gate e exige `action_preselected_count == 0` para a fonte de 2017.
- **Pesquisa de novas tomadas** catalogada em `examples/acervo_candidatos_reais_v20.json`, cinco referências locais com condições de uso **não liberadas**: Diário do Vale e CNN (28/10/2026), Reuters Connect/STRINGERSHUB (licença comercial pendente), Arquivo Nacional (greve de 1988), e Núcleo Piratininga/Os Homens da Fábrica. Nenhum vídeo novo foi incorporado nem publicado.

### Critério de resultado
Se o novo workflow v0.20.1 aprovar, teremos demonstrado a capacidade da fábrica de **recusar uma fonte visualmente inadequada após inspeção editorial**, não uma melhoria cinematográfica certificada. O score de capacidade da v0.19 permanece **8,14/10**; o filme V19 6,2/10 permanece o último ensaio visual avaliado. Não fabricar nota nova, nem afirmar narração/sincronização Alexandre, master final ou liberação de direitos.
