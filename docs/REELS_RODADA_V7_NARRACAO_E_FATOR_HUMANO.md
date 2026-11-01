# Ferro em Ebulição — Rodada V7 (01/11/2026)

**Status:** protótipo interno, **não publicar**; complementar às rodadas V1–V6 na mesma PR, sem alteração do portal público.

## Executado e verificado

- MP4 **23,0 s, 1080 × 1920, 24 fps, H.264/AAC**. Trilha sintética original e **sem narração no MP4**.
- Mantida a técnica 2,5D de primeiro plano e fundo nas fotos industriais da V6.
- Novidade narrativa: tomadas que percorrem **retratos já impressos no jornal** *A Noite* de 29/01/1962. Não são retratos recriados por IA nem fotografias apresentadas como captadas no acidente.
- Melhorada a imagem da página de jornal: corrigida sobreposição que atingia a manchete; o texto **“Chuva de Ferro Derretido Mata 12 e Fere 11 Operários de Volta Redonda”** permanece fac-símile original.
- Voz profissional **Alexandre** gerada com sucesso no ElevenLabs, 21,64 segundos, fluxo `qx80P2HVVBmCEJKyOi8V`, mas o MP3 não foi transferido ao renderizador. Não confundir `gerado` com `incorporado`.
- Entregue `integrar_voz.py` como procedimento local para adicionar **a mesma gravação** assim que seu MP3 estiver disponível; SRT das falas é apenas **aproximação temporal** e exige alinhamento real antes de exportação final.
- Catálogo Excel **v0.4** registra os quatro ativos usados na V7 e a avaliação V3–V7. Imagens originais não foram publicadas no repositório.

## Fatos e pendências editoriais

- O recorte fornecido pelo usuário de *A Noite*, 29/01/1962, mostra o balanço **12 mortos, 11 feridos** na manchete — **não o balanço final**.
- O *Jornal aQui*, em retrospectiva publicada em 07/02/2022 (https://jornalaqui.com/chuva-de-ferro-derretido/), informa **16 mortes imediatas e quatro posteriores**. São apurações e janelas distintas; não equivaler os números sem fontes independentes.
- Página do acervo *A Noite* na Hemeroteca Digital: https://memoria.bn.gov.br/docreader/WebIndex/WIPagina/348970_06/4193 . **Não verificada a identificação página-a-página do scan entregue**.
- **Autoria, data e direitos das fotos não demonstrados**; foto de bobinas, metal e instalação não é evidência fotográfica de 27/01/1962.
- Não registrar cenas sintéticas como documentação de mortes ou do acidente.

## Rubrica da rodada — autoavaliação, não aprovação

| Critério | Peso | V6 | V7 |
|---|---:|---:|---:|
| Direção de arte | 20% | 6,4 | 6,5 |
| Câmera e profundidade | 15% | 6,8 | 6,9 |
| Vida/ação das cenas | 15% | 4,2 | 4,6 |
| Acervo real | 15% | 8,4 | 8,8 |
| Ritmo/montagem | 10% | 6,3 | 6,8 |
| Tipografia | 7% | 6,2 | 6,4 |
| Cor/iluminação | 5% | 6,0 | 6,0 |
| Som/sincronia | 7% | 4,8 | 4,8 |
| Integridade editorial | 6% | 8,5 | 8,6 |
| **Total ponderado** | **100%** | **6,40** | **6,63** |

**Diagnóstico:** melhora no fator humano, na leitura integral da manchete e na dramaturgia documental. Limitações graves: falta de filmagens com ação real, voz integrada, legenda sincronizada, direitos confirmados e revisão humana do filme no celular. **Meta 10/10 não alcançada**.

## Próximo gate sem publicar

Importar o MP3 já gerado, sincronizar cortes/legendas à voz verdadeira, inserir filmagens verificáveis, aprimorar iluminação/cor e submeter a QA móvel. Não criar nova geração de voz sem necessidade. Os MP4, originais e código da V7 permanecem em pacote de trabalho na conversa, não no site público.