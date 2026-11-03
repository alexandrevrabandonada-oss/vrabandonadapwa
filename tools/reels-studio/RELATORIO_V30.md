# Fábrica Aço Gráfico v0.30 — diversidade fotográfica real + identidade Aranhaverso-brutalista

**2026-11-03 · estudo interno, sem publicação · continuação da PR #44.**

## Achado cinematográfico da rodada

A v0.29 repetia a **mesma fotografia da CSN durante 6,16 segundos**; isso contribuía para o visual de apresentação de slides mesmo em 1080p. Em vez de simular pluralidade de imagens com três recortes do mesmo arquivo, a v0.30 usa **três fotografias realmente diferentes** para essas cenas:

1. 1965 — **Escritório Central da CSN, Volta Redonda**: *Correio da Manhã AN 353.jpg*, Fundo Correio da Manhã / Arquivo Nacional. [Ficha Wikimedia e referência arquivística](https://commons.wikimedia.org/wiki/File:Correio_da_Manh%C3%A3_AN_353.jpg). É o prédio administrativo, **não uma fotografia do interior da usina**; funciona para a frase inicial "Volta Redonda tem memória".
2. 06/05/2014 10h23 — **CSN02.jpg**, fotografia panorâmica da CSN, autor HenriqueBarraMansa, publicada sob **CC BY-SA 3.0**. [Página original](https://commons.wikimedia.org/wiki/File:CSN02.jpg). A partir da fala "Aqui, a CSN em dois mil e quatorze".
3. 06/05/2014 10h30 — **CSN01.jpg**, o registro de HenriquebarraMansa já empregado nas versões anteriores; agora somente no terceiro plano, em vez de nos três primeiros. [Página original](https://commons.wikimedia.org/wiki/File:CSN01.jpg).
4. 2011 — **Vicart - Aciérie.webm**, siderurgia real na França (Damien Vicart), quatro janelas diferentes e identificação explícita no vídeo. **Não é filmagem da CSN.**

É uma seleção que respeita os momentos originais da narração, sem gerar fala nova: a fotografia histórica de 1965 termina a 1,90s, antes da palavra "Aqui"; as duas fotos de 2014 ocupam a fala sobre a CSN até 6,16s; a siderurgia internacional entra durante a frase sobre o arquivo francês.

## Avanço técnico mensurável

- Máxima exposição da **mesma foto contínua** reduzida de **6,16s para 2,18s** (**64,6%**), sem interpolação nem imagens inventadas. É uma métrica de repetição de fonte, **não** nota de qualidade estética.
- Código de busca por metadados oficiais, cópia e SHA1 por fonte `studio/verified_media_v30.py`, que diferencia foto da usina de fotografia de seu escritório administrativo e atribui as datas corretas.
- `studio/visual_director_v30.py`: três fotos verificadas, detecção de quase-duplicação por hash perceptual, render cinematográfico 1080×1920/30, gramática de impressão e som original. Preserva imagem documental sem alteração factual.
- `studio/visual_qa_v30.py`: contraste/propriedades de arquivo, legendas com 32 timestamps da tomada real Alexandre, auditoria de diversidade, movimento e áudio EBU; não converte métricas em pontuação artística.
- `tests/test_visual_director_v30.py`: 10 testes locais aprovados antes do envio ao GitHub; simulam fontes e barram fotos adulteradas, repetidas ou apresentadas como antigas em data falsa.
- `.github/workflows/reels-studio-v30-multiphoto-master.yml`: aquisição e renderização reproduzíveis no CI, sem download dos MP3s privados e sem nova síntese ElevenLabs.

## Narrador Alexandre — pendência persistente e claramente delimitada

A gravação original de aproximadamente 14,071s **continua gerada no ElevenLabs, não importada no container**; URL assinada apresentada pelo conector não pôde ser baixada pelos métodos disponíveis. A v0.30 pode receber `--voice` como arquivo local e fará mix com trilha sem alterar velocidade da voz. **Nenhum vídeo v0.30 pode ser descrito como contendo voz Alexandre se o MP3 não tiver sido entregue ao renderizador.** Não gerar outra tomada do mesmo texto.

## Relatórios e notas

Reel v0.29 (estimativa artística) **7,18/10**; capacidade interna da fábrica **8,60/10**. A v0.30 só receberá nota artística revisada após inspeção de seus quadros e QA reais. Os dados de metrificação podem demonstrar diversidade de arquivo, não excelência visual ou previsão de engajamento. Direitos e revisão editorial são uma etapa separada antes de uma publicação, sem bloquear experimentação interna.

**Estado do PR:** draft, sem merge, sem publicação. Nenhum pedido à Cinemateca enviado durante esta etapa.
