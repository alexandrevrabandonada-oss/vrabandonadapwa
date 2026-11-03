# Fábrica Aço Gráfico v0.42 — Três linguagens do mesmo motor

**03/11/2026 · Laboratório privado · PR #44 em rascunho.**

Objetivo: validar três modalidades de Reels com **origens audiovisuais distintas**, sem reduzir a identidade autoral a cores ou animação de um cartão genérico.

| Ensaio | Fonte e ano | Gramática de movimento | Regra documental |
|---|---|---|---|
| Arquivo histórico | Construção CSN 1941, interior CSN 1969, panorâmica CSN 2014 | 2,5D fotográfico, díptico com movimento independente, revelação industrial | Crédito histórico por plano; nenhuma foto é filmagem de acidente |
| Ação industrial | Damien Vicart, França, 2011 | Ação de vídeo original, máscaras em camadas, cortes em regiões distintas do filme | **França**, nunca CSN nem 1962 |
| Telejornal urbano | TV BrasilGov, reportagem Rodovia do Contorno, 2017 | Enquadramento horizontal preservado dentro de canvas vertical, moldura editorial, cronologia e transição entre reportagem/apresentador/entrevista | Preserva tarja e imagem de TV sem cortar para simular 9:16 nativo; não é captação atual |

Três vídeos de **6 segundos, 1080×1920, 30 fps**, com grafismos editoriais movidos por poses a 15 fps, H.264/AAC e música sintética original, *sem voz Alexandre*. Fontes verificadas por hash SHA-1. Os clipes foram obtidos de fontes acessíveis anteriormente registradas no projeto; o sistema não infere direitos de publicação. Os originais **não vão ao repositório ou a artifacts públicos de CI**.

### Comandos locais

```bash
cd tools/reels-studio
python -m pytest -q tests/test_three_grammars_v42.py
python -m studio.three_grammars_v42 --profile arquivo --sources /CAMINHO/sources --output /CAMINHO/V42_ARQUIVO_HISTORICO.mp4
python -m studio.three_grammars_v42 --profile industria --sources /CAMINHO/sources --output /CAMINHO/V42_ACAO_INDUSTRIAL.mp4
python -m studio.three_grammars_v42 --profile telejornal --sources /CAMINHO/sources --output /CAMINHO/V42_TELEJORNAL_URBANO.mp4
python -m studio.quality_gate_v42 --video /CAMINHO/V42_ARQUIVO_HISTORICO.mp4
```

CI testa motor e integridade do manifesto com imagens sintéticas, sem distribuir os arquivos externos. Verifique QA local antes de distribuir qualquer artefato. A licença não bloqueia o ensaio local, mas **a publicação permanece desativada**.
