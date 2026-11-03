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

## Auditoria de resultados

**Três produções independentes de 6 segundos, 1080 × 1920 a 30 fps, H.264/AAC; 15 testes unitários aprovados.**

- **Arquivo histórico:** QA passou; −16,8 LUFS e pico verdadeiro −2,0 dBFS; cinco amostras de mudança visual de 0,4584; 0,6606; 0,5089; 0,814; 0,4107.
- **Ação industrial:** QA passou; −17,7 LUFS e pico verdadeiro −1,6 dBFS; cinco amostras de mudança visual de 0,4926; 0,6303; 0,5978; 0,5997; 0,3792.
- **Telejornal urbano:** QA passou; −16,4 LUFS e pico verdadeiro −1,9 dBFS; cinco amostras de mudança visual de 0,3917; 0,4271; 0,0863; 0,4164; 0,1385.

A auditoria foi corrigida depois de encontrar um erro de serialização `numpy.bool_`. O quadro final de 2014 foi renderizado novamente após falhar no teste de movimento, adicionando pan cinematográfico durante a revelação. Os resultados apresentados são os **pós-correção**.

**NÃO** interpretar movimento percentual como qualidade artística; as notas são rubrica interna e permanecem abaixo do pico histórico de 7,78/10. **NÃO** reutilizar quaisquer trechos de 2017 como filmagem de 1962 ou evento atual, nem trechos franceses como captação local da CSN.

## Gargalos ainda relevantes

1. Obter a voz Alexandre já gerada e inserir no master com validação de áudio, sem gastar novamente créditos.
2. Testar criativamente elementos de movimento mais profundos (separação real de objetos e oclusão) em duas ou três pautas completas, não apenas seis segundos.
3. Aumentar filmagens atuais e históricas de Volta Redonda, incluindo entrevistas e cenas de rua, sempre rotuladas corretamente.
4. Avaliação humana independente dos vídeos, especialmente celular e acessibilidade, para sustentar aumento da nota artística.
5. CI executa testes de código sobre fontes sintéticas; os três masters privados são verificados no laboratório local e não são enviados como artefatos públicos ao repositório.
