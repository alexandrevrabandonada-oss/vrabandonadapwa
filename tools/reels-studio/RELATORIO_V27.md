# Fábrica Aço Gráfico v0.27 — fotografia dominante, narrativa sincronizada e identidade brutalista

**03/11/2026 · laboratório interno · PR #44 em draft · sem publicação.**

## O que foi executado

Foram renderizadas **duas versões MP4** (v0.27 Impacto Gráfico e Cinema), 14,5 segundos, 540×960/24fps, H.264/AAC. A narração foi transcrita anteriormente pelo ElevenLabs Scribe, com **32 palavras e seus tempos reais**, mas **o áudio não foi transferido ao renderizador**. Esses arquivos têm trilha industrial original instrumental e legendas cronometradas, não a voz Alexandre audível. Não foi criada ou cobrada outra tomada TTS nesta rodada.

### Melhorias reais na imagem

- **Três gramáticas diferentes de fotografia da CSN** para evitar o mesmo enquadramento repetido: `impact_reveal` (tiras independentes), `architecture` (panorâmica e eixo industrial) e `contact_triptych` (três recortes do original).
- **Três gramáticas de filme e composição mista** disponíveis por papel de fonte, não presas à duração/tema: `furnace_bleed`, `industrial_diptych`, `moving_crop`, `diagonal_duel`, `dossier_final` e `photo_film_field`.
- Teste de história: o mecanismo escolhe variações pelo papel documental `photo`, `film` ou `both` e pelo índice da cena; não se restringe ao editorial de 14,5 segundos.
- A imagem real ocupa o centro da tela (largura 540px, faixa aproximada **95–741**). A tipografia de impacto e a retícula/impressão deslocada compõem a *moldura e as entradas*, não são usadas para inventar informações históricas.
- A nova legenda calcula os cortes de linha com largura real dos glifos e penaliza palavras órfãs; continua destacando cada palavra segundo **timestamp obtido do áudio**, sem interpolar leitura artificial.
- Duas paletas autorais: **amarelo/magenta** (Impacto) e **ciano/magenta** (Cinema). Inspiração no Aranhaverso em princípios gerais de profundidade, motion design e retícula, **sem copiar cenas/personagens do filme**.

## Materiais factuais do ensaio

1. Fotografia **CSN em Volta Redonda, maio de 2014** (Wikimedia Commons, HenriqueBarraMansa).
2. Vídeo documental **siderurgia na França em 2011** (Damien Vicart, Wikimedia Commons). **Não** é filmagem da CSN ou de acontecimentos de Volta Redonda.

O seletor v0.26 foi preservado: seis planos para o roteiro, três janelas distintas da filmagem internacional e cortes vinculados aos capítulos da locução. Qualidade dos acontecimentos e adequação jornalística exigem revisão editorial: motion score não certifica cenas.

## Testes técnicos e notas

- Dois MP4s efetivamente renderizados e inspecionados por fotogramas; 540×960, 24 fps, H.264/AAC, 14,5 s.
- QA das duas versões: **−17,0 LUFS / −3,1 dBTP**, sem planos pretos, 3 janelas distintas e legendas dentro da faixa móvel.
- **5 testes novos aprovados** (`test_kinetic_v27.py`) e **12 testes v0.26 preservados** localmente. A validação de workflows no GitHub deve ser relatada separadamente.
- Nota artística interna v0.27: **Impacto 6,93/10; Cinema 6,85/10**; melhor v0.26: 6,73/10. **Sem nota pública, sem avaliadores cegos.** Critérios e pesos: `examples/scorecard_v27.json`.
- **Capacidade técnica da fábrica: 8,45/10** (estimativa interna, anterior 8,35). Não confundir com a qualidade artística de um Reel.

## Gargalo real

A voz profissional própria **Alexandre** (ElevenLabs, tomada já gerada de 14,071 s, flow `kyxg6hlu1YvywVBXNdFQ`) continua **indisponível em arquivo local**. A recuperação via URL autenticada do conector não foi bem-sucedida: acesso externo do container sem DNS; a ferramenta de download solicitou uma URL visualizada, mas não aceitou o link temporário. **Nenhuma nova geração, nenhum crédito adicional.**

O produto ainda não é Reel 10/10: faltam a voz na mix final, ação real da cidade em múltiplos planos, áudio espacial/editado, tipografia revisada em telefone, master nativo e prova de engajamento/nota externa. A progressão por notas internas não substitui audiência e revisão humana.

## Engenharia de reuso / não regressão

- `studio/kinetic_editor_v27.py` — gramática visual dependente da fonte e legendas sem órfãs.
- `studio/render_v27.py` — adaptador fino ao `studio/render_v26.py` existente, preservando aquisição autenticada, render e QA; não duplica o pipeline de vídeo/áudio.
- `tests/test_kinetic_v27.py` — cinco testes para variação real de layouts, legendas temporizadas/seguras, dois tratamentos e uso honesto do áudio ausente.
- CI v0.27 dedicado renderiza A/B em contexto interno, valida metas técnicas e arquiva MP4, contato e scorecard; **nenhuma publicação nem merge**.

