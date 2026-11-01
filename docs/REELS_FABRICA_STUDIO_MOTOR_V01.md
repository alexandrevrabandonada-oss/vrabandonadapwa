# Reels Studio — Fábrica de Reels v0.1 (01/11/2026)

**Estado:** motor local executável em pacote entregue na conversa; **não instalado/implantado neste repositório**. Esta especificação canônica complementa as rodadas V1–V7 na PR #43. Nenhuma mudança no Next.js público ou publicação no Instagram.

## Mudança arquitetural
Deixar de criar scripts acoplados a um único vídeo. A entrada passa a ser um projeto declarativo JSON com:
- ID estável, edição e revisão;
- catálogo de ativos com fonte, local, data, licença, status de direitos, hash e papel editorial;
- cenas com duração, tipo, movimento de câmera, rótulo documental e IDs de evidências;
- arquivo de narração aprovado, IDs de tomada, timings revisados;
- saída de render, QA técnico, parecer de qualidade e aprovação humana explícita.

## Módulos do pacote experimental
- `studio.factory`: validate, render preview/master, score, QA, improve, variant.
- `studio.quality`: inspeção de ffprobe e gates de direitos, voz, legendas e aprovação.
- `studio.iterate`: backlog baseado no maior déficit ponderado e variantes documental/cinematic/kinetic que **não alteram textos, fatos, direitos ou documentos**.
- `studio.voice`: importar MP3 aprovado **sem gerar novamente**, bloqueando quando o áudio excede duração do roteiro; não afirmar alinhamento de legenda automaticamente.
- `tests/test_factory.py`: testes unitários e smoke test com uma segunda pauta sintética.

## Resultado verificado nesta execução
- **12 testes automatizados passaram**.
- Render executado de 15,00 s: MP4 H.264, **540×960 / 24 fps**, usando as imagens recebidas anteriormente no chat. O vídeo é preview sem narração.
- Prova técnica de render master executada: **1080×1920 / 30 fps / 1,00 s**. Isso valida o preset, não a qualidade artística de 60s.
- Um segundo roteiro sintético foi renderizado no teste, comprovando que não há hardcode da CSN no motor.
- A verificação de publicação recusou as imagens com direitos pendentes, a narração ausente, timings não verificados e falta de aprovação editorial.
- Tomadas de voz ElevenLabs **Alexandre** já foram geradas no fluxo `qx80P2HVVBmCEJKyOi8V`; nenhuma voz foi incorporada neste motor experimental porque o MP3 não foi disponibilizado localmente.

## Rubrica criativa fixa
| Critério | Peso |
|---|---:|
| Direção de arte | 20% |
| Profundidade | 15% |
| Vida/ação das cenas | 15% |
| Acervo real | 15% |
| Montagem e ritmo | 10% |
| Legibilidade tipográfica | 7% |
| Cor e luz | 5% |
| Narração, som e sincronização | 7% |
| Integridade editorial | 6% |

Notas não substituem avaliação humana. Alcançar uma média numérica de 9,5 não concede automaticamente 10/10 nem libera publicação.

## Linha de produção alvo
`dossiê -> fontes e direitos -> roteiro -> storyboard -> voz -> cenas/motion -> edição -> render -> QA técnico -> 2 revisões criativas -> correção -> aprovação editorial -> distribuição`.

**Gates obrigatórios:** fontes auditáveis; fotos de data desconhecida rotuladas sem atribuir contexto temporal; nenhuma reconstrução como documentação; preservação de trechos originais; 1080×1920 30 fps para master; áudio inteligível e legendas alinhadas; revisão em celular; checagem de licença; aprovação humana.

## Próximas estações sem depender de nova decisão editorial
1. **Portar o motor para código versionado em PR técnica separada**, com mídia sintética de teste no CI, sem comitar imagens com direitos pendentes.
2. Criar adaptador de armazenamento privado para acervo, mantendo originais e derivados em storage, não Git.
3. Importar MP3 ElevenLabs já gerado e obter timestamps precisos, renderizando só quando couber no roteiro.
4. Evoluir cenas em Remotion e eventualmente Blender para abandonar o efeito de foto animada, testar ações, oclusões e composições com revisão humana.
5. Registrar variações A/B por Reel e aprendizado editorial, sem criar publicação automática.

## Distinções de estado
`executado localmente` ≠ `pushed ao GitHub` ≠ `testado em CI` ≠ `deploy` ≠ `publicado`. Nesta versão, apenas **documentação/roteiro de integração** entra no GitHub; código completo e vídeo permanecem no pacote de trabalho privado da conversa até migração técnica.
