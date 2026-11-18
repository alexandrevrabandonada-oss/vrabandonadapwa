# Fábrica Aço Gráfico — v0.42 | Laboratório privado multifonte e seleção automática

**Data: 03/11/2026. Estado: artefatos internos, não publicados; PR #44 em rascunho.**

## Mudança real de arquitetura

A fábrica agora oferece **dois caminhos complementares**:

1. `shot_scout_v42.py` + `auto_director_v42.py`: análise real de fonte original por mudanças visuais, candidatos de janelas de vídeo, exclusão de duplicatas por dHash, seleção com espaçamento e papel editorial declarado. O plano de edição é determinístico e pode ser inspecionado. A narrativa macro ainda é escrita por humano; **não há IA que entenda semanticamente cada tomada**.
2. `three_grammars_v42.py`: três modos independentes e compatíveis com fontes documentais diferentes — arquivo fotográfico 2,5D, vídeo de ação industrial em camadas, e telejornal 16:9 preservado na tela vertical. Não é uma simples alteração de cores.

A movimentação das fotografias é gerada por recortes e geometria editorial, sem alterar ou regravar os originais. O modo de telejornal mantém enquadramentos horizontais e não confunde entrevistas de 2017 com imagens de 2026 nem de 1962. O modo indústria usa registro francês de 2011 explicitamente rotulado, **não filmagem da CSN**.

## Render e QA locais efetivamente aprovados

- `V42_AUTO_CINEMATIC_MASTER.mp4`, `V42_AUTO_RESTRAINED_MASTER.mp4`: **1080×1920, 30 fps, 16,0 segundos**, H.264/AAC, diferença A/B com mesmas imagens, fontes e sequência de cortes, mas movimento de diferentes intensidades. Áudio instrumental original, sem voz Alexandre.
- Scouts da origem: **18 janelas do filme francês e 29 janelas na seção de entrevista da reportagem regional de 2017**. Seleção: 2 janelas industriais + 1 janela de reportagem; combinação editorial com fotografias da própria CSN em **1941, 1969 e 2014**; cinco origens de cena e seis gramáticas por master.
- A&B passaram `qa_v42`: **−16,4 LUFS, −1,2 dBFS de pico verdadeiro**, 6 cenas com movimento medido, 5 fontes distintas e 0 erros técnicos. As duas versões não têm locução. A/B apresenta diferença visual mensurável, embora alguns planos deliberadamente em repouso permaneçam semelhantes.
- `V42_ARQUIVO_HISTORICO.mp4`, `V42_ACAO_INDUSTRIAL.mp4`, `V42_TELEJORNAL_URBANO.mp4`: três filmes de **6,0 segundos, 1080×1920 a 30fps**, todos com QA aprovado. O modo de vídeo usa quadros das fontes originais, não de Reels derivados.
- **30 testes locais adicionais aprovados**: 15 para seleção e edição, 15 para perfis audiovisuais. Não são testes de retenção, opinião pública ou estética independente.
- O vídeo original da Rodovia do Contorno (2017) contém majoritariamente apresentador e entrevista; o motor trata seus trechos como **telejornal/entrevista**, nunca como filmagem industrial da CSN. A notícia sobre a fumaça da CSN de 28/10/2026 tem vídeos de fonte local, mas os bytes ainda não foram importados; portanto **não entram nestes renders**.

## Integridade e limites de segurança editorial

- Todas as cinco fontes originais foram verificadas por SHA-1 antes do render, incluindo o 2017 WebM original TV BrasilGov e a filmagem francesa de Damien Vicart de 2011.
- Os cinco arquivos originais permanecem fora do repositório GitHub. Como combinado, o laboratório privado permite ensaios com material de direitos de publicação pendentes; a **saída pública continua bloqueada**.
- Não há MP3 da voz Alexandre no ambiente do render; *não* foi sintetizado outro. Trilha instrumental produzida por síntese local, não música protegida reutilizada.
- Os resultados não são reportagens publicáveis, e suas fontes não documentam um mesmo evento. A transparência sobre isso está nos próprios créditos do vídeo.

## Notas editoriais conservadoras — SEM certificação estética

- Melhor amostra nova v0.42, master automático de 16s: **7,35/10** (estimativa interna). Estudos separados de seis segundos: arquivo **7,25**, indústria **7,15**, telejornal **7,01**. A melhor nota histórica ainda é **7,78**, da v0.39. Não há revisão humana externa.
- Capacidade da fábrica de referência **8,91/10**; proposta **8,96/10 somente após CI específico e CI geral sem falhas**, como ganho por seleção automática de tomada e suporte a três gramáticas reais. Não elevar em função da contagem de efeitos ou fontes.

## Próxima evolução útil

Priorizar nova aquisição de vídeos **da própria Volta Redonda** em movimento, classificação semântica com revisão humana, trechos mais longos de pautas investigativas e transferência da gravação profissional Alexandre **já gerada**. Com essas entradas, avaliar uma reportagem real com diretores adaptativos, duração flexível, mais fontes, mais ações e menos gráficos desnecessários.
