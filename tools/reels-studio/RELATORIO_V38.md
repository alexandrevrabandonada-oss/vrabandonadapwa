# Fábrica Aço Gráfico v0.38 — movimento com sentido e revisão A/B

**03/11/2026 · VR Abandonada · PR #44 draft · sem merge nem publicação.**

## Resultado
A v0.37 foi integralmente versionada neste PR: código de renderização, auditoria, testes e workflow. GitHub Actions v0.37: [run 41690746669](https://github.com/alexandrevrabandonada-oss/vrabandonadaPWA/actions/runs/41690746669), **success**.

Novo módulo \`studio/temporal_audit_v38.py\`: mede sete cortes contra o início de palavras reais da gravação existente de Alexandre (32 palavras; Scribe ElevenLabs), valida atribuição da filmagem da França e dos registros CSN, audita movimento dentro de cada um dos oito planos e rejeita declarações de narração inexistente. Rodada local nos dois masters v0.37: **desvio máximo de corte = 0,098 s**, oito cenas com movimento detectável, 1080x1920/30 fps/14,5 s. Os testes locais completos dessa auditoria passaram (8/8).

Nova \`review/v38/index.html\`: interface A/B local offline para comparação sincronizada, avanço quadro a quadro, navegação por cenas, modos de velocidade e avaliação humana nas sete dimensões históricas da rubrica; exporta avaliações JSON com notas inicialmente vazias. Requer os dois MP4s no mesmo diretório e é distribuída no pacote da conversa. A interface não publica conteúdo nem envia informações a um servidor.

## Notas
- **Reel A v0.37: 7,74/10**, nota editorial interna anterior, **mantida**; nenhuma nova montagem artística foi renderizada como v0.38.
- **Fábrica: 8,91/10**, referência anterior, a reavaliar após confirmar o CI v0.38.

## Honestidade
Voz Alexandre ainda não incorporada aos MP4s; música instrumental de laboratório, embora legendas usem timestamps da fala real. Imagens CSN 1941, 1969 e 2014; filmagem industrial em movimento França 2011, nunca identificada como CSN. Sem publicação. Aprovação técnica não certifica qualidade estética e o formulário não fabrica notas humanas.
