# Fábrica Aço Gráfico v0.28 — imagem antes do título, não depois

**03/11/2026 · Projeto VR Abandonada · PR #44 permanece draft · nenhum Reel publicado.**

## Entrega concreta

Foram renderizadas duas peças internas de **14,500 s, 540×960, 24 fps, H.264/AAC**, usando a fotografia real CSN/Volta Redonda de 2014 (HenriqueBarraMansa) e os planos em movimento **da França, 2011** (Damien Vicart). As filmagens francesas são apenas ilustração industrial, nunca atribuídas à UPV. O vídeo não representa o acidente de 1962.

- `V28_GRAFICO.mp4`: estética amarela, impressão de gravura e tipografia industrial.
- `V28_CINEMA.mp4`: ciano, imagem documental mais clara.
- Ambos preservam **seis planos** e **três janelas diferentes de filmagem** escolhidas pelo módulo `director_v26`; nenhuma imagem nova foi inventada e nenhuma fonte foi redatada.
- `art_director_v28.py` introduz **nove gramáticas visuais reutilizáveis** (três para foto, três para filme, três para comparação) e função de composição livre da pauta; a instância atual usou seis tipos.
- O título monumental permanece apenas na entrada da tomada e **regride após ~0,62 s**, aumentando a exposição da mídia. Teste controlado no terço superior y=155–390, foto de laboratório: a alteração de pixels pela manchete caiu de **0,837 no motor v27 para 0 no v28** após a entrada. Isso é uma medida de *oclusão da camada gráfica numa região de teste*, não de qualidade de filmagem.
- Retícula de papel, marcas de registro e vinhetas cinéticas são aplicadas às **margens e elementos editoriais**, sem substituir os pixels das fontes por imagens sintéticas.
- A legenda de **32 palavras** mantém timestamps recebidos da gravação Alexandre de 14,071s do ElevenLabs Scribe. O desenho tenta evitar palavras órfãs e testa a área móvel segura.
- Área principal de imagem: y 82–754 (672 px); abaixo ficam legendas, créditos, estado da voz e barra de progressão.

## Controles executados localmente

**12 testes de regressão** aprovados: nove possibilidades de composição para diferentes papéis de mídia; variação de quadros; oclusão da manchete versus v27; entrada e retirada da tipografia; duas paletas; legenda sem órfãs; origem da fonte; condição de voz; papéis inválidos e duração real das palavras. `qa_v28.py` também avaliou ambos os MP4s:

| Indicador | Gráfico | Cinema |
|---|---:|---:|
| Duração | 14,500 s | 14,500 s |
| Formato | H.264/AAC | H.264/AAC |
| Geometria / fps | 540×960 / 24 | 540×960 / 24 |
| Janelas de fonte distintas | 3 | 3 |
| Alteração visual média amostrada (px) | 46,60 | 45,99 |
| LUFS integrados | −17,0 | −17,0 |
| True peak | −3,1 dBTP | −3,1 dBTP |
| QA técnico | Aprovado | Aprovado |

**Limitações do QA:** alterações entre fotogramas não provam beleza cinematográfica, ausência de textos cortados ou retenção de público. O CI não atribui nota criativa. Avaliação em celular, exportação nativa 1080×1920 e três pautas diferentes ainda faltam.

## Voz Alexandre: origem segura, integração não completada

- A gravação de **14,071 s** previamente gerada no ElevenLabs, flow `kyxg6hlu1YvywVBXNdFQ`, permanece concluída e não foi regenerada.
- Tentativa de buscar o link de áudio retornado pelo conector não criou um arquivo local utilizável. A interface da geração permite reprodução, porém os bytes **não estão no MP4**. Como a voz não foi importada, o motor não adicionou voz sintética substituta, e a legenda informa claramente **“SEM VOZ NO MP4 • ESTUDO INTERNO”**.
- O renderer aceita `--voice` para ingestão de um MP3 existente, com validação de duração e `sha256`/track, mas só pode afirmar `voice_embedded=True` quando recebe o arquivo de áudio real. `v28` corrige a versão anterior que poderia mostrar indevidamente a mensagem de ausência mesmo após embutir voz.

## Notas — avaliação interna, não independente

A rubrica e os pesos estão em `examples/scorecard_v28.json`; a conta pode ser reproduzida, mas as notas de cada dimensão são avaliações humanas/editoriais **internas** feitas sobre as prévias. **Não são notas públicas, de público, nem avaliação por especialistas externos.**

- Melhor Reel **v0.28 Gráfico: 7,09/10** (v0.27 impacto: 6,93/10, aumento de 0,16).
- Reel **v0.28 Cinema: 7,03/10**.
- Capacidade da fábrica: **8,50/10** (v0.27 8,45/10, aumento modesto de 0,05), ainda com risco alto em voz, reuso multipauta e resolução final.

**Principal gargalo permanece:** voz não está dentro do MP4; o acervo local de ação ainda é limitado e o roteiro de teste fala mais de origem de imagens do que de um achado jornalístico que prenda a atenção. A evolução da direção visual é real, mas ainda **não é um Reel 10/10**. Requer o áudio já criado e uma pauta investigativa com cenas locais mais expressivas, revisão cega e teste de retenção.

