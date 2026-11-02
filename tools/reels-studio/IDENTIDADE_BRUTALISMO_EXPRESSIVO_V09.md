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