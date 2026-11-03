# Reels Studio — direção v0.9: Aço Gráfico | Brutalismo Expressivo Documental
**Data:** 01/11/2026. **Estado:** protótipo visual LOCAL; não aprovado/publicado.

## Identidade (permanente)
O referencial do *Aranhaverso* deve inspirar apenas princípios gerais: profundidade, perspectivas inesperadas, cor expressiva, animação em camadas, textura de gravura e montagem cinética. Não reproduzir personagens, poses, quadros ou a linguagem proprietária de um filme.

Tradução autoral: geometrias industriais de Volta Redonda, tipografia brutalista como arquitetura, retícula gráfica, cores cobalto/magenta/cobre/amarelo de segurança e interferência de papel impresso.

## A regra “mundo + evidência”
- **Mundo expressivo:** somente sobre fotos claramente rotuladas como contexto/ilustração; câmera e recortes gráficos podem deformar o ENQUADRAMENTO, não os fatos.
- **Mundo documental:** fac-símile do jornal/contrato em pixels originais, sem reescrever manchete, sem gerar nomes, datas ou números; câmera pode aproximar recortes autênticos.
- A transição entre esses modos é narrativa, não decorativa. Reduzir efeitos nas cenas de morte/luto.

## Variedade de direção obrigatória
1. Plano arquitetônico inclinado com oclusão por viga e câmera avançando.
2. Dois planos fotográficos em deslocamentos opostos e tipografia presa à colisão.
3. Mergulho oblíquo com foto dominante, linhas de velocidade e grande contraste.
4. Pausa documental: página completa e aproximação direta de recorte da página.

Não repetir o mesmo layout, o mesmo cartão e o mesmo gesto de zoom ao longo de 3 cenas. No máximo uma chamada de alto impacto por momento.

## Prova v0.9 LOCAL, ainda não sincronizada ao GitHub
Implementação no pacote da conversa `VR_FABRICA_REELS_V09` em `studio/expressive_world.py`, `studio/render_v09.py` e um manifesto declarativo. Render local: **12 s, 540×960, 24 fps, H.264/AAC, som original sintético**, 288 frames; **não tem locução profissional nem filmagem real em ação**.
- Cinco testes específicos do novo perfil passaram; suíte completa **62 testes aprovados / 1 skip**.
- Segundo teste com mídia sintética urbana prova reuso de manifesto e fonte, 2,7 s, 270×480.
- Fotogramas inspecionados; a primeira versão repetia layouts e foi corrigida antes do render final.
- Todos os arquivos enviados pelo usuário continuam com direitos e data de captação não verificados. Fotos industriais **não retratam comprovadamente o acidente de 1962**.
- **Bloqueio de publicação permanece ativo**; falta voz Alexandre sincronizada, direitos, filmagem viva e avaliação humana em celular.

## Próximos gates
1. Integrar o pacote local ao ramo da PR quando possível, sem publicar arquivos privados.
2. Transferir MP3 da voz profissional já criada no ElevenLabs (sem criar outra tomada), alinhar legendas palavra por palavra e revisar.
3. Acervo autorizado com filmagens de pessoas, máquinas, rua e ações, preservando proveniência.
4. Criar três filmes em pautas diferentes; avaliar também em celular e com avaliadores humanos independentes.

**Nota do Reel V7 continua 6,63/10.** A prévia V0.9 é uma prova da biblioteca de direção visual, não um Reel de reportagem aprovado.

## Canonicalização v0.25 — Aranhaverso-brutalista industrial

Os princípios visuais aprovados para continuar desenvolvendo (sem copiar personagens ou cenas): **retícula gráfica em camadas, impressão cromaticamente deslocada em tipografia, chapas diagonais, movimento em profundidade, alternância de composições, cor expressiva e edição orientada à fala**. O referencial proprietário não deve ser reproduzido literalmente. As evidências históricas permanecem identificadas e suas alterações nunca devem criar fatos.

O perfil-base de experimento é **Aço Gráfico / Zine Industrial**, com uma alternativa **Documental Ciano** para testar legibilidade; não promover automaticamente a versão mais colorida sem avaliar a história.

**Toda versão entregue precisa apresentar duas notas em escala 0–10:**

1. **Arte do Reel**: rubrica fixa identidade 20%, composição 15%, movimento 15%, acervo 15%, narrativa 10%, legendas 10% e som/voz 15%. Registre o peso e as notas por eixo em JSON; indique se são estimativas internas ou revisão humana externa. QA técnico NÃO concede nota estética.
2. **Capacidade da fábrica**: nota distinta, comparável à histórica 8,14/10, que mede processo testado, renderização, fontes, sincronismo e reusabilidade. **Não elevar por mudanças cosméticas sem regressão comprovada.**

A v0.25 gerou localmente duas versões de 14,5 s. Avaliação interna provisória da arte: **6,61/10 Zine**, **6,45/10 Documental**, e v0.24 retrospectivamente **5,80/10**. Nota interna de processo estimada: **8,24/10** apenas depois de verificar a suíte geral, preservando histórico de 8,14/10. Sem voz Alexandre audível nos vídeos, sem master HD nativo, sem avaliação externa e sem publicação. Evidência: `RELATORIO_V25.md` e `examples/scorecard_aranhaverso_v25.json`.

### Anti-regressões de identidade

- Não trocar tomadas reais por um pôster estático ou blocos de cor apenas para subir nota visual.
- Não aplicar 'offset' e texturas que falsifiquem o conteúdo de um documento/fotograma histórico. Efeitos existem ao redor ou como acabamento explicitamente artístico.
- Não reutilizar o mesmo fundo/corte/tratamento por três planos seguidos sem progressão narrativa.
- Não encher a tela de palavras: preservar a leitura da fonte, a legenda e a hierarquia principal.
- Não declarar voz sincronizada quando só os timestamps das legendas foram alinhados.
- Metas de produção: três pautas distintas, **imagem local em movimento**, locução Alexandre, master 1080×1920/30, revisão humana no celular e scorecard estruturado.


## Correção canônica v0.32 — identidade Aranhaverso é ANIMAÇÃO, não apenas cor

**Prioridade nº 1: movimento expressivo autoral.** A referência estética geral ao Aranhaverso exige direção de movimento e linguagem de animação como partes essenciais da identidade Aço Gráfico. Uma paleta magenta/cobalto com retícula estática, títulos sobrepostos e zoom genérico NÃO cumpre a identidade.

**Sete mandamentos de movimento da fábrica:**

1. **Camadas independentes:** fotografia, fundo, recortes, estruturas industriais, letras e partículas têm trajetórias com ritmos diferentes. Um único zoom geral não comprova parallax.
2. **Cadência mista intencional:** filmagem documental mantém seus 30 fps no master; gráficos e personagens tipográficos podem segurar poses a cada dois quadros (15 fps) ou variar exposições. Nunca artificializar a temporalidade de um registro histórico sem rotulá-lo.
3. **Peso e coreografia:** antecipação, impacto, overshoot, inércia, colisão e pausa são sincronizados com a mensagem e a voz, não aplicados aleatoriamente como um filtro.
4. **Câmera espacial:** travessias oblíquas, profundidade, oclusões por estruturas e janelas móveis fazem o quadro parecer um espaço em transformação. Não falsificar a cena de um documento ou foto factual.
5. **Impressão animada:** registro deslocado, retícula, recortes e eco cromático só nas CAMADAS EDITORIAIS; os pixels originais da fonte não são tratados como tinta inventada.
6. **Montagem narrativa:** mudanças reais de planos e energia nos momentos certos da locução; movimento não é desculpa para vídeo com uma só foto repetida.
7. **Respeito ao assunto:** luto, acidentes e testemunhos graves exigem movimento mais contido, sem flashes ou efeitos espetaculares incongruentes.

**Anti-regressão vinculante:** nenhuma versão deve receber promoção de NOTA ARTÍSTICA somente por cores, filtros, retículas ou QA técnico. Qualquer alegação de evolução em animação deve mostrar pelo menos três gramáticas de movimento, dois planos independentes e uma comparação audiovisual REAL; revisão no celular por pessoa externa continua pendente até ser feita.

**Rubrica artística v2 (a partir de v0.32; não retroativa):** direção de movimento/animação **25%**, profundidade/câmera/camadas **15%**, ritmo/montagem/sincronismo **15%**, variedade de tomadas e ação real **15%**, narrativa/integridade documental **10%**, voz/legendas/áudio **10%**, cor/retícula/tipografia **10%**. Os scores antigos permanecem na rubrica antiga; não comparar novas notas brutas sem indicar a mudança. A nota do último Reel completo v0.31 continua **7,56/10** e a capacidade técnica, **8,76/10**, até haver novo master verificado e avaliação.
