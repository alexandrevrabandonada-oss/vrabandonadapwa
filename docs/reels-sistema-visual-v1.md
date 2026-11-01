# VR Abandonada — Aço Gráfico | Sistema visual dos Reels v1.0

**Data:** 01/11/2026  
**Status:** proposta em prototipagem; **não aprovada como identidade final**, **sem publicação automática**.  
**Projeto:** VR Abandonada. Este documento complementa o roadmap editorial do portal. Não substitui o CMS nem cria fonte paralela para matérias.

## Tese visual

**Brutalismo expressivo documental**: rigor estrutural, imagem real no centro, cor expressiva, textura industrial, tipografia com peso e movimento com função. A referência a linguagens animadas de quadrinhos é de **princípios gerais** (profundidade, contraste, sobreposição e energia), não de elementos identificáveis de uma obra existente.

### Regras inegociáveis
1. **Fato, fonte e contexto antes do efeito.** Nenhum registro visual é tratado como prova sem proveniência.
2. **Fotografia/documento verdadeiro domina as cenas factuais.** Grafismos nunca inventam informações.
3. **O movimento orienta o olhar.** Evitar transições aleatórias, aceleração permanente e templates genéricos.
4. **A leitura no celular prevalece sobre o virtuosismo.**
5. **Linguagem de luto é sóbria.** Nada de transformar morte e sofrimento em espetáculo.
6. **Reconstruções visuais/IA sempre rotuladas** de modo persistente quando representarem eventos reais.

## Identidade e tokens

| Papel | Hex | Uso |
|---|---|---|
| Carvão | `#101619` | base |
| Papel | `#F2EEE4` | texto e documentos |
| Aço | `#212C2F` | planos escuros secundários |
| Concreto | `#707577` | legendas, apoios |
| Ferrugem | `#D84F3D` | conflito e investigação |
| Sinalização | `#F0B92E` | atenção, número, prova |
| Ciano raro | `#55C7C7` | análise de dados, uso pontual |

Tipografia proposta: **Lato Black / Inter Display** para títulos; **Lato/Inter** para corpo; **mono** para data, processos e metadados. Fontes definitivas devem passar por teste de direitos e legibilidade em aparelhos reais. Max. 2 linhas para o gancho; 1 ideia por quadro.

**Espaço vertical padrão:** 1080×1920, 30 fps, com margem provisória de segurança lateral de 85 px, superior de 250 px e inferior de 340 px. Ajustar com teste no Instagram; valores não são garantia de overlay universal.

## Gramática de motion

| Componente | Papel | Regra |
|---|---|---|
| `ColdOpen` | Gancho que situa a pauta | 0–3s, afirmação factual validada |
| `ArchivePhotoParallax` | Foto real ganha presença | deslocamento discreto, sem reconstruir detalhes |
| `DocumentFocus` | Destacar evidência | documento e fonte identificáveis |
| `TimelineStep` | Ordenar fatos | datas verificadas |
| `MapEvidence` | Localizar | mapas documentados, sem inferir coordenadas |
| `DataComparison` | Comparar | unidade, período, fonte explícitos |
| `QuoteCard` | Citar | transcrição fiel, crédito e contexto |
| `FinalSignature` | Encerramento | marca curta, CTA discreto |
| `DisclosureBadge` | Transparência | identifica simulação, IA ou imagem atual |

Transições próprias:
- **CRASH:** corte seco para mudança de ideia.
- **BEAM_WIPE:** barra estrutural que revela plano em 8–14 quadros, com significado.
- **DOCUMENT_FOCUS:** aproximação suave até excerto legível.
- **ARCHIVE_DEPTH:** deslocamento de imagem fotográfica de 0,8% a 2% por eixo, respeitando origem.
- **HOLD:** pausa deliberada para leitura.
- **FINAL_STAMP:** fechamento em 12–18 quadros.

## Três graus de energia

- **Sobriedade:** acidentes, mortes e sofrimento; som contido, movimento discreto, documentos dominantes.
- **Investigativo (padrão):** foto, fonte e análise alternados com cortes secos e tipografia expressiva.
- **Impacto:** apenas gancho ou teaser; evitar estímulo extremo em todo o Reel.

## Pipeline editorial técnico

`dossiê com fontes → roteiro → storyboard → seleção e licenças de assets → narração → alinhamento de fala → animação em Remotion → render em FFmpeg → auditoria de quadro/som → revisão humana → publicação`

### Estados rastreáveis

`DRAFT`, `FACT_CHECK`, `ASSETS_PENDING`, `READY_TO_RENDER`, `RENDERED_PREVIEW`, `EDITORIAL_APPROVED`, `PUBLISHED`. Nunca confundir preview com produção.

### QA de aceite
- Verificar cor/contraste, ortografia, identidade, ritmo, tipo e fonte de cada mídia, direitos autorais e atribuição.
- Verificar áudio, alinhamento de legenda, frames iniciais/finais e páginas de origem.
- Bloquear publicação se fonte, direito de imagem ou contraditório pertinente estiver pendente.
- Registrar o hash ou caminho do MP4 aprovado; revisões devem gerar nova versão identificada.

## Teste técnico de 01/11/2026

Foi renderizada **uma demonstração local**, com 8s / 720×1280 / 24fps / sem áudio / com grafismos abstratos e rótulo de protótipo. Este teste prova apenas a possibilidade de animar a gramática de design com recursos locais; **não** prova a qualidade do Reel final, integração Codex/Remotion/ElevenLabs, nem qualidade de fotografias históricas.

A especificação e o storyboard do primeiro piloto estão em [reels-piloto-o-peso-do-aco-v1.md](./reels-piloto-o-peso-do-aco-v1.md).

## Critério de próxima estação

Criar primeiro um trecho de 12–20s usando **pelo menos 2 imagens reais licenciadas/documentadas** e **1 evidência textual verificável**. Só então medir estética, legibilidade, retenção visual e necessidade de 3D. Não multiplicar templates simples como substituto de direção de arte.
