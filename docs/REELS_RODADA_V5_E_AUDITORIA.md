# Ferro em Ebulição — Rodada V5 | 01/11/2026

**Estado:** protótipo interno de 18 segundos produzido e inspecionado; **não publicado**. Este registro complementa as versões V1–V4 na mesma branch e não torna as imagens reutilizáveis publicamente.

## Novas fontes e rigor histórico

- **CSN-UPV-FOTO-0002**, imagem preto e branco de bobinas/instalação siderúrgica. Data, autoria, local exato e direitos desconhecidos.
- **CSN-UPV-FOTO-0003**, imagem preto e branco de metal líquido em operação siderúrgica. Data, autoria, local exato e direitos desconhecidos.
- **ARQUIVO-ANOITE-1962-0004**, captura de `A Noite`, página 4, edição visível de 29/01/1962, com manchete **“Chuva de Ferro Derretido Mata 12 e Fere 11 Operários de Volta Redonda”**. A digitalização não foi autenticada diretamente no acervo original, mas a manchete e o fato histórico encontram respaldo contextual na reportagem retrospectiva do Jornal aQui de 07/02/2022 https://jornalaqui.com/chuva-de-ferro-derretido/. A reportagem retrospectiva apresenta **20 mortes no total**, incluídas posteriores ao dia da tragédia; as contagens NÃO são intercambiáveis e devem ser verificadas historicamente.

**Importante:** as duas fotos industriais servem como contexto visual, **não** como imagens registradas no dia do acidente. Direitos de cópia e redistribuição pendentes para as três imagens. Originais não incluídos neste repositório.

## Render e QA

- `V5_O_PESO_DO_ACO_PREVIA_18s.mp4`: H.264 / 1080×1920 **nativo** / 24 fps / 18,0s / áudio AAC; teste visual interno.
- Cenas: metal líquido → bobinas → jornal em página completa → detalhe de manchete → metal líquido → assinatura. Movimento de câmera próprio em cada cena, colorização estilizada apenas em derivados, efeito de montagem transitório em cortes, preservação dos originais.
- `CONTATO_V5.jpg`: seis fotogramas para auditoria estética.
- `BANCO_IMAGENS_VR_ABANDONADA_V02.xlsx`: catálogo anterior atualizado com as três fontes adicionais e controle de usos.
- `render_v5.py`: código de renderização reproduzível. O áudio é sintetizado, **não gravado na usina**, e não há voz clonada nesta versão.

## Rubrica fixa de qualidade (autoavaliação, não certificação)

| Critério | Peso | V4 | V5 |
|---|---:|---:|---:|
| Arte e identidade | 20% | 5,3 | 6,0 |
| Câmera e profundidade | 15% | 4,8 | 5,6 |
| Vida e ação interna | 15% | 2,3 | 3,2 |
| Acervo visual real | 15% | 6,7 | 8,1 |
| Ritmo e montagem | 10% | 4,6 | 5,8 |
| Tipografia e legibilidade | 7% | 6,0 | 6,6 |
| Cor e iluminação | 5% | 6,3 | 6,2 |
| Som e sincronização | 7% | 4,3 | 4,7 |
| Integridade editorial | 6% | 8,0 | 8,4 |
| **Total ponderado** | **100%** | **5,11** | **5,92** |

## Autoauditoria visual

**Melhorou:** agora há 3 fontes independentes, mudança real de composição em 5 movimentos, material de origem reconhecível, manchete preservada como fac-símile e exportação 1080p vertical nativa. Foi removido o destaque gráfico em formato de cartão que parecia PowerPoint.

**Ainda falha:** não há personagem, ação filmada, recortes reais com oclusões (2,5D), narração, sincronização de fala, multiplicidade de mídias de época com data exata; fundo e detalhes provenientes das fotos antigas limitam nitidez e não atingem qualidade de cinema de animação.

## Gate de V6

1. Reunir fontes fílmicas pertinentes ou material recortável com movimento real; solicitar documentação de autoria e de uso para imagens de arquivo.
2. Fazer separação real em 3–5 planos e teste de oclusão/câmera, sem inventar detalhes históricos.
3. Confirmar manchete na Hemeroteca e cronologia das mortes em duas fontes primárias independentes, distinguindo 12 de 20.
4. Produzir áudio narrado aprovado e mixagem que deixe a fala inteligível, com legendas em sincronia.
5. Testar em celular e buscar nota de avaliação independente/usuário. Não declarar 10/10 antes dos gates.

**Não há autorização de publicação pública neste estágio.**
