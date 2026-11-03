# Fábrica Aço Gráfico v0.43 — curadoria de tomadas baseada em qualidade e diversidade

**03/11/2026 — estudo audiovisual privado, não publicado.** Continuidade da PR draft #44 (`codex/reels-studio-v01`). Sem merge, sem deploy e sem alteração do site VR Abandonada.

## Resultado executado, não apenas proposto

- Dois novos MP4s renderizados **diretamente dos arquivos originais** em 1080 × 1920, 30 fps, 16 s, H.264/AAC, no compositor v0.42: `V43_CURADORIA_CINETICA_1080.mp4` e `V43_CURADORIA_DOCUMENTAL_1080.mp4`.
- Três janelas de vídeo selecionadas automaticamente em cada edição. Abertura conserva os três documentos fotográficos reais da CSN (1941, 1969, 2014). O vídeo de entrevista é de 2017 e trata da Rodovia do Contorno; os dois trechos industriais são **da França em 2011, não da CSN**.
- **QA real aprovado em A e B:** 1080×1920, 30fps, 16s, H.264/AAC; **−16,4 LUFS**, pico **−1,2 dBFS**, cinco fontes e seis gramáticas, sem erros de QA. Trilha instrumental original de laboratório; **voz Alexandre não inserida**.
- **15 testes de v0.43 + 15 testes de v0.42 = 30 passaram localmente**, além de `node --check` do JavaScript da mesa de revisão.
- O pipeline avalia nitidez, exposição, movimento adequado ao ritmo, continuidade temporal (diferença entre intervalos de fotogramas) e redundância via dHash. Não usa redes neurais, não classifica o que um evento representa visualmente e não afirma fazer isso.

## Achado de curadoria — repetição visual

| Fonte real | Janelas analisadas | Grupos visuais aprox. (dHash ≤7) | Maior grupo | Diagnóstico |
|---|---:|---:|---:|---|
| Siderurgia francesa (2011) | 23 | 22 | 2 (8,7%) | Acervo diverso |
| Telejornal rodovia (2017) | 37 | 2 | 31 (83,8%) | Fonte visualmente repetitiva; exige curadoria humana |

A maioria das janelas da entrevista mostra o mesmo entrevistado. **Trocar o instante do vídeo não melhora a variedade visual por si só.** O sistema registra esse aviso em vez de declarar sucesso artificial.

## Novos timecodes comparados

| Fonte | v0.42 (máximo movimento) | v0.43 cinética | v0.43 documental |
|---|---:|---:|---:|
| Entrevista 2017 | 123,8 s | 146,0 s | 65,0 s |
| Indústria francesa, primeiro plano | 9,4 s | 22,0 s | 31,0 s |
| Indústria francesa, segundo plano | 1,0 s | 29,5 s | 19,0 s |

Na v0.43, o algoritmo **não escolhe automaticamente o maior valor de movimento**: pondera ritmo (37%), nitidez (23%), exposição (22%), continuidade (18%), com rejeição de janelas próximas e imagens repetidas. Os pesos foram definidos editorialmente; não são resultados comprovados de retenção ou avaliação humana. O método de agrupamento dHash é aproximado e não equivale a detecção semântica.

## Mesa de revisão humana e reutilização

`output/index.html`: funciona offline, sem redes externas. Reproduz os dois masters em sincronia; permite avançar um quadro e selecionar manualmente janelas candidatas com valores de pontuação, movimento e risco. **Exporta uma nova EDL JSON**, sem substituir as fontes originais ou publicar. Valida o distanciamento de 5 s e dHash mínimo de 6 entre os dois trechos industriais. A EDL manual exige depois renderização e QA; não é aprovada automaticamente.

### Reproduzir com fontes privadas já obtidas

```bash
cd tools/reels-studio
python -m studio.shot_curator_v43 --france /fonte/france_2011.webm --road /fonte/rodovia_2017.webm --baseline /caminho/V42_SCOUT_EDL.json --out /saida/EDL_V43_CINEMATIC.json --pace cinematic --contact-dir /saida/contacts
python -m studio.auto_director_v42 --plan /saida/EDL_V43_CINEMATIC.json --sources /pasta/dos/cinco/originais --out /saida/V43.mp4 --variant kinetic
python -m studio.qa_v42 --video /saida/V43.mp4 --plan /saida/EDL_V43_CINEMATIC.json --out /saida/QA_V43.json
```

Não colocar as gravações originais/privadas na PR; usar diretório local de laboratório. Os direitos de publicação pendentes não impedem **a experiência privada**; a distribuição pública segue desativada. Nada foi enviado ao público, à Vercel ou à conta Instagram.

## Notas honestas e pendências

- **Reel (estimativa editorial interna): 7,35/10 — mantida v0.42.** Não há nova pauta narrada ou revisão humana que justifique aumento. Só mudou a curadoria dos trechos de vídeo e sua cadência.
- **Capacidade da fábrica: referência 8,96/10 (v0.42 com CI aprovado).** A v0.43 adiciona curadoria explicável, nova interface, medição de diversidade e varredura de vídeo de 2017 em cerca de 9s; só atualizar após CI verde da v0.43.
- **Pendente:** MP3 profissional Alexandre sem bytes locais, fontes de imagem em movimento da própria CSN/Volta Redonda, avaliação externa e um roteiro investigativo unificado. Os registros atuais são *contextos diferentes* e não devem ser montados como prova de um único evento.