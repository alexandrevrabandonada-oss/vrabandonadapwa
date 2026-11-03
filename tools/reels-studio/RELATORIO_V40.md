# Fábrica Aço Gráfico v0.40 — uma pauta audiovisual original: O Minério e o Carvão (1953)

03/11/2026. Estudo interno não publicado. PR #44: integração em andamento.

## Obra histórica nova, fonte primária

Cinemateca Brasileira registra *O Minério e o Carvão* (1953), filme sonoro PB, direção Humberto Mauro, produzido pelo INCE/Ministério da Educação e Cultura, **12 minutos**, catálogo **013614**, Série Volta Redonda. A sinopse descreve trem, carvão, transporte de minério e maquinário da CSN. Fonte: https://www.bcc.org.br/filmes/443375 e catálogo https://bases.cinemateca.org.br/cgi-bin/wxis.exe/iah/?IsisScript=iah/iah.xis&base=FILMOGRAFIA&exprSearch=ID%3D013614&format=detailed.pft&lang=p&nextAction=lnk.

**Direitos:** BCC não permite presumir licença para reprodução de material exibido. As cenas do filme de 1953 **NÃO foram usadas**, nem incorporadas, nem redistribuídas. Solicitação de cópia e direito de uso à Cinemateca: atendimento@cinemateca.org.br. Rascunho em `brief/PEDIDO_CINEMATECA_RASCUNHO.md`, **não enviado**.

## Reel comprovadamente renderizado

`V40_CSN_FILME_1953_ESTUDO_INTERNO.mp4`, original no workspace: **24 segundos, 1080×1920, 30 fps exportados, gráficos em poses de 15 fps**, oito composições, H.264/AAC. O filme discute a existência do documentário, sem exibir ou simular qualquer fotograma dele. Usa três fotografias de contexto originais: construção CSN em 1941, interior em 1969 e vista de 2014, verificadas por SHA-1. A origem e o ano estão sobreimpressos. Não é reconstrução da tragédia de 1962.

**Som:** faixa instrumental original, sem música protegida reutilizada e **sem voz Alexandre**. QA final: aproximadamente **−21,8 LUFS** e **−3,9 dBTP**, sem clip; o primeiro áudio tinha picos excessivos e foi substituído por um ganho linear seguro da trilha original. Formato, duração, fonte, direitos e oito evidências de movimento passaram no controle. **10 testes locais aprovados**; nenhum teste certifica qualidade estética.

## Originalidade do fluxo

- Pela primeira vez desde v0.24, não é a mesma fala demonstrativa de 14,5 s nem o vídeo industrial francês de 2011.
- A coreografia passa a representar **arquivo histórico/documento/cinema** por oclusão, parallax, shutters, filme geométrico original e pausa de leitura. A animação não inventa o que foi gravado em 1953.
- A trava de direitos `assert_legal_gate` rejeita ingestão de vídeo de 1953 ou mudança de `usage_permission_received` sem implementação e revisão editorial apropriada.
- Novo pedido pronto para a Cinemateca, com ID e perguntas sobre acesso, direitos e formatos de reprodução; não foi enviado.

## Notas internas

A v0.40 recebe uma nota ARTÍSTICA **inferior à melhor v0.39**, pois é uma prévia de pesquisa documental sem filmagem do próprio filme nem voz profissional. Rubrica com os mesmos sete critérios históricos em `brief/SCORECARD_V40.json` (estimativa, não audiência).

A fábrica permanece em **8,91/10** até a execução de CI v0.40 e o gate de licenciamento serem comprovados no repositório. A qualidade do Reel v0.39 era **7,78/10** (interno).

## Pendências

- Acesso ao material original de 1953, autorização escrita e timecodes depois de assistir à íntegra.
- Análise histórica específica das filmagens de 1941, incluindo o fato de versões disponíveis serem colorizadas por IA.
- Importação real do MP3 Alexandre já gerado, sem consumir créditos de outra síntese.
- Testes de retenção, avaliação independente e revisão em aparelho celular.
- CI do PR, aprovação editorial, autorização para publicação (não dada).