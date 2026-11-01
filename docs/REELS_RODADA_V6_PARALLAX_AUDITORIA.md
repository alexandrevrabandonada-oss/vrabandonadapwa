# Reels — Rodada V6 | Ferro em Ebulição | 01/11/2026

**Estado: protótipo interno NÃO publicado.** Esta rodada complementa V1–V5 na PR #43, sem alterar site público, CMS ou fluxo de publicação.

## Entregas locais verificadas
- Filme experimental **23 segundos**, render **1080×1920 nativo, 24 fps, H.264/AAC**, com 4 fontes visuais fornecidas pelo usuário; trilha sintética original, **sem narração incorporada**.
- Movimento **2,5D real** nas bobinas e na torre da fotografia industrial: máscaras gravadas com GrabCut/polígono + reconstrução de fundo por inpainting, para mover fundo e primeiro plano com oclusão. Originais imutáveis.
- Jornal *A Noite*, p.4, cabeçalho de 29/01/1962, mantido como fac-símile; ampliação usa recorte direto do scan. Revisão corrigiu a perda do número “12” na manchete causada pelo enquadramento vertical.
- Banco de imagens local v0.3 com controle do uso dos quatro ativos em V6 e nova aba comparativa de notas V3–V6. Arquivos de mídia e cópias privadas não foram enviados ao GitHub.

## Narração — diferença crítica entre gerada e incorporada
- Narrativa em português do Brasil **gerada com sucesso** via ElevenLabs, usando a voz profissional própria `Alexandre`, voz `uM5sFrRJkaxDKSD5SLWM`, duração de **21,64 segundos** (ElevenLabs flow `qx80P2HVVBmCEJKyOi8V`).
- **O MP3 não ficou disponível ao renderizador**, então NÃO foi incorporado ao MP4 e NÃO há sincronização de fala/legenda. Não afirmar conclusão do áudio nem criar nova cobrança para recuperar a mesma fala.

## Fontes e verificação
- Imagens industriais recebidas do usuário: autoria, licença, data e contexto exato **desconhecidos**. NÃO são registros confirmados do acidente de 27/01/1962.
- Fac-símile da edição de *A Noite* fornecido pelo usuário: manchete informa **12 mortos e 11 feridos** em 29/01/1962. Acervo do periódico em https://memoria.bn.gov.br/DocReader/DocReader.aspx?bib=348970_06. Consulta da página específica ainda não confirmada diretamente na Biblioteca Nacional; houve indisponibilidade reportada em https://bndigital.bn.gov.br/hemeroteca-digital/.
- Retrospectiva do jornal aQui de 07/02/2022 menciona **16 mortos no momento e 4 posteriores** (https://jornalaqui.com/chuva-de-ferro-derretido/). Os recortes são distintos; não declarar 20 como se fosse o número da manchete de *A Noite*.

## Rubrica — autoavaliação ponderada, não certificação
| Critério | Peso | V5 | V6 |
|---|---:|---:|---:|
| Arte/identidade | 20% | 6,0 | 6,4 |
| Câmera/profundidade | 15% | 5,6 | 6,8 |
| Vida/ação | 15% | 3,2 | 4,2 |
| Acervo real | 15% | 8,1 | 8,4 |
| Montagem | 10% | 5,8 | 6,3 |
| Tipografia | 7% | 6,6 | 6,2 |
| Cor | 5% | 6,2 | 6,0 |
| Som/sincronia | 7% | 4,7 | 4,8 |
| Integridade editorial | 6% | 8,4 | 8,5 |
| **Total** | **100%** | **5,92** | **6,40** |

**Conclusão crítica:** V6 deixou de ser zoom sobre fotos e ganhou oclusão real, mas ainda carece de ação filmada, voz sincronizada, iluminação mais sofisticada e direitos confirmados. Meta **10/10 não alcançada**. Próximo gate V7: transferir áudio gerado sem refazer geração, sincronizar palavra a palavra, adicionar filmagens contextualizadas e inspecionar no celular antes de qualquer publicação.

**Arquivos locais:** `/mnt/data/VR_REELS_V6/` e pacote `PACOTE_REELS_V6_FERRO_EM_EBULICAO.zip` (não transferidos ao repositório).
