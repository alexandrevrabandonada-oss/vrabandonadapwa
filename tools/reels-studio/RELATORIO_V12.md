# Fábrica de Reels — rodada v0.12 | 01/11/2026

**Status:** acervo/controle editorial implementado e testado; vídeo publicável **NÃO** produzido. Continuidade da PR #44.

## Ganhos concretos
- `studio/media_registry.py` valida autoria declarada, data, modalidade de direitos, licença e uso contextual ou probatório. Simulações exigem tarja SIMULAÇÃO e não são aceitas como evidência de evento. Filmagem de 2017 não pode ser rotulada como ocorrência de 1962.
- `studio/preflight_v12.py` exige voz MP3 local decodificada, duração compatível, texto/tempos revisados, direitos e aprovação humana antes de liberar uma produção.
- `studio/factory.py` aceita `media_catalog` + `editorial_usage` opcionais e chama a verificação integrada.
- Testes locais **85 aprovados/1 ignorado** usando o conjunto de testes completo do workspace. Na PR, testes autocontidos foram adicionados e devem ser verificados pelo CI do commit atual.
- A configuração de *O Peso do Aço* foi bloqueada no modo publish por **13 razões**, incluindo imagens sem direitos, voz não incorporada e aprovações humanas pendentes.

## Fontes novas para acervo
1. https://commons.wikimedia.org/wiki/File:Rodovia_do_Contorno_%C3%A9_inaugurada_ap%C3%B3s_22_anos_de_obra.webm — TV BrasilGov, 08/12/2017, declarada CC BY 3.0, mas a página registra **license review needed**. Status: PENDENTE, não liberado; material de obras urbanas 2017, não imagem da CSN.
2. https://nucleopiratininga.org.br/os-homens-da-fabrica/ — documentário de Luiz Arnaldo Campos, produção Telenews Service, realização Sindicato dos Metalúrgicos. Reutilização não demonstrada, solicitar autorização.
3. Fotografias da usina e fac-símile de *A Noite* enviados pelo usuário: direitos/data das fotos ainda pendentes; não constituem registro comprovado do acidente.

Catálogo textual inicial: `examples/acervo_candidatos_v12.json`, sem upload de originais privados.

## Áudio da voz profissional
A tomada Alexandre existente (20,712 s; fluxo do ElevenLabs `qx80P2HVVBmCEJKyOi8V`) está gerada, mas os bytes do MP3 ainda não chegaram ao renderizador. **Não foi recriada nem sincronizada** e não foi gerada nova cobrança.

## Autoavaliação da capacidade da FÁBRICA
| Critério | Peso | v0.11 | v0.12 |
|---|---:|---:|---:|
| Direção | 25% | 7,4 | 7,4 |
| Acervo/proveniência | 20% | 5,4 | 5,8 |
| Voz/sincronia | 15% | 5,2 | 5,2 |
| Render e composição | 15% | 9,1 | 9,1 |
| QA audiovisual | 10% | 9,4 | 9,4 |
| Integridade editorial | 10% | 8,0 | 8,2 |
| Reutilização/testes | 5% | 9,9 | 9,9 |
| **Maturidade interna** | **100%** | **7,31** | **7,41** |

A nota artística do Reel V7 continua **6,63/10**. Nenhum novo filme 10/10 foi produzido; objetivo é qualidade repetível, com voz sincronizada, direitos e supervisão humana.

## Próximo salto
1. Importar MP3 existente sem síntese duplicada e realizar alinhamento auditivamente revisado.
2. Adquirir vídeo contextual com permissão comprovada; não usar clipes recentes para reencenar 1962 sem rotulagem.
3. Montar primeiro Reel completo em 1080×1920/30fps, com ação real, direção Aço Gráfico e avaliação em celular.
