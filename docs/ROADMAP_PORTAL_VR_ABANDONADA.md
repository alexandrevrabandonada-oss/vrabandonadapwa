# VR Abandonada — Auditoria e roadmap canônico do portal

**Data:** 27/10/2026  
**Domínio auditado:** https://www.vrabandonada.online  
**Repositório:** alexandrevrabandonada-oss/vrabandonadapwa  
**Status:** auditoria técnica/documental; **não equivale** a teste visual, auditoria de performance ou Search Console.

> **Norte:** do Instagram para uma casa digital editorial, com notícias originais, acompanhamento de investigações, memória e distribuição. Não replicar as funções comunitárias do COMUN.

## Fontes verificadas

- Vercel: projeto `vrabandonadapwa`, build de produção READY no commit `c66e927f1c3b93bdfe8c40f5606c24455921592e`.
- Configuração DNS Vercel: `vrabandonada.online` e `www.vrabandonada.online` = `misconfigured:false`. `vrabandonada.com.br` = `misconfigured:true`.
- Repositório principal: `app/page.tsx`, `app/materias/**`, `app/publicacoes/**`, `app/sitemap.ts`, `app/robots.ts`, `lib/site-url.ts`, `lib/search/index.ts`, `lib/editorial/queries.ts`, `lib/captura/actions.ts`, `next.config.ts`.
- Relatórios já existentes: `reports/estado-da-nacao-075.md`, `076.md`, `077.md`, `078.md`.
- Busca web pela homepage e indexação não retornou conteúdo verificável. A ferramenta de navegador conectada não pôde abrir páginas; o acesso via terminal teve falha de resolução DNS geral. **Não concluir** que o site está indisponível ou não indexado a partir dessas limitações de observação.

## Estado conhecido

| Pilar | Estado do código/serviço | Limite de evidência |
| --- | --- | --- |
| DNS .online | Vercel informa domínio configurado | Não foi feita prova HTTP/SSL do lado cliente |
| DNS .com.br | Registrado no projeto, mas DNS apontado como incorreto | Não concluir posse/estado registral |
| Next.js/Vercel | Build de produção READY | Não é teste de experiência real |
| Navegação | Muitos hubs, dossiês, Agora, Buscar, Acompanhar, PWA, acervo | Sem teste humano e Lighthouse |
| Matérias diretas | Templates, páginas, SEO e validação implementados | Diretório `content/materias` sem matérias reais |
| Arquivo Instagram | API/importador opcional implementado | `public/data/instagram-posts.json` = `[]` |
| Captura Universal | Rota `/interno/capturar`, inbox, ações de publicação, arquivamento, enriquecimento | Relatórios não substituem teste E2E |
| Busca | Busca transversal complexa | Não inclui, pelo código atual, `getMaterias` |
| SEO | Metatags, sitemap, robots, OG, JSON-LD em matérias, RSS | Não existem métricas do Search Console nesta auditoria |
| CMS | Publicações em `editorial_items` (Supabase) **e** `content/materias/*.json` (Git) | Fontes paralelas exigem unificação |

## Problemas prioritários — evidências

### P0 — confiança editorial
- `lib/editorial/queries.ts` devolve `editorialMockItems` quando a conexão ao banco está indisponível, existe erro **ou a tabela está vazia**.
- `lib/editorial/mock.ts` contém 4 textos demonstrativos com `published:true`, `editorial_status:"published"`. `lib/dossiers/queries.ts` também usa mock público de dossiês.
- **Decisão proposta:** mocks somente em ambiente de desenvolvimento/preview, jamais como fallback silencioso de produção. Página pública vazia deve ter estado honesto, não inventar acervo.
- `lib/captura/actions.ts` implementa `publishCapture` e `sendToEnrichment` sem chamar explicitamente `ensureInternalSession()` dentro dessas funções, diferentemente de `archiveCapture`. Rever autenticação/autorização servidor/RLS antes de tratar como seguro.
- Botão `Publicar (Agora)` insere diretamente `editorial_items` como publicado a partir de `raw_text`; requer checklist mínimo, confirmação humana explícita, tratamento idempotente e log. Não basta o nome do botão.

### P0 — operação editorial
- Primeiro publicar 3–5 matérias reais, fonte/autoria/contraditório/data claros, sem conteúdos sintéticos demonstrativos.
- Definir uma fonte canônica para nova matéria: aproveitar cockpit `/interno/capturar` e `editorial_items` **ou** unificar `content/materias` com o cockpit por adaptador; nunca exigir preenchimento manual duplo nem manter publicações divergentes.
- Testar fluxo completo: pedir no ChatGPT -> rascunho -> checagem -> aprovação -> produção READY -> URL HTTP válida -> capa/WhatsApp -> sitemap/RSS.

### P1 — clareza e conversão
- A home possui dezenas de seções e um hero de posicionamento, enquanto matérias JSON e Instagram estão vazios. Colocar **notícia real atual na primeira dobra**, seguida de últimas publicações, 3 séries ativas, vídeo e entrada no acervo.
- Simplificar navegação pública em: **Últimas, Investigações, Bairros, Acervo**, mais Sobre/Apoie e acesso externo COMUN.
- Eliminar duplicidades `publicacoes` vs `materias` vs `pautas`: funções distintas, com vocabulário intuitivo e um fluxo unificado.
- Revisar `/envie`: é entrada **editorial de pautas/documentos**; COMUN é espaço de relatos comunitários, organização e acompanhamento. Nunca duplicar coleta sensível.

### P1 — SEO que gera tráfego
- Escolher `www.vrabandonada.online` como canônico **provisório**, conforme código e DNS que estão funcionando na Vercel; só alterar mediante auditoria de propriedade, Search Console e mapeamento 308.
- `.com.br` está misconfigured na Vercel; quando restaurado, redirecionar URL a URL para o host canônico, preservando caminhos e query.
- O sitemap atual lista apenas rotas fixas, matérias JSON e posts importados; incluir URLs públicas verificadas de pautas, dossiês, bairros e séries da base editorial.
- `/buscar` não inclui `getMaterias`: unificar índice de busca.
- Usar imagens reais, documentos e títulos baseados nas buscas de moradores; Google Search Console e monitoramento de impressões, cliques e páginas indexadas.
- Evitar indexar páginas vazias, demonstrativas ou filtros redundantes. `lastmod` deve refletir atualização real.

### P1 — estabilidade/segurança
- `next.config.ts` tem `eslint.ignoreDuringBuilds:true` e `typescript.ignoreBuildErrors:true`; build READY não equivale a validação estática. Planejar restaurar gates após corrigir legado.
- Rever opções de configuração Next.js deprecadas, avisos do build, status de upload, upload de conteúdo sensível, permissões Storage e RLS.
- Testes obrigatórios em celular: home, leitura, fontes, denúncia/pista, navegação, PWA, login, uploads, menu, compartir WhatsApp.
- Medir Lighthouse/Web Vitals reais; sem dados, **não inventar notas**.

## Visão de produto V2 — cinco superfícies

1. **Últimas**: manchetes factuais datadas, visuais, vídeos e posts curtos para compartilhar; uma leitura rápida de 30 segundos.
2. **Investigações**: dossiês conectados a matérias e documentos, linha do tempo, respostas de órgãos e perguntas ainda abertas.
3. **Bairros**: páginas permanentes por localidade com matérias e histórico, sem copiar sistema de registro participativo do COMUN.
4. **Acervo**: busca única com materiais de origem rastreável, reportagens, vídeos/transcrições, documentos e contexto.
5. **Sobre/apoie/método**: independência editorial, identidade, transparência e sustentabilidade, sem promessas ainda não implementadas.

Princípio visual: **jornalismo documental industrial**, preto/grafite/branco/amarelo; capas com fotografia real em primeiro lugar, documentos legíveis, números contextualizados e identidade consistente com Reels.

## Automação: uma decisão editorial

`matéria investigada -> roteiro/capa/Reel -> revisão humana -> publicar -> páginas SEO + imagem social + RSS + sitemap -> distribuição Instagram/WhatsApp`.

- O operador diz "publique esta matéria no VR Abandonada".
- IA prepara pacote com título, data, SEO, capa, corpo, fontes e link do dossiê, mas **não se atribui autoridade para publicar sem aprovação**.
- Usar GitHub/Vercel como pipeline confiável; unir aos estados do cockpit existente ao invés de duplicar CMS.
- Meta API é opcional, nunca condição para funcionamento do site.
- Corrigir/editá-la não deve exigir criar URL nova; preserva histórico e transparência.

## Plano executivo e aceite

**Sprint 0 — estabilização (P0)**
- [ ] Comprovar HTTPS/308/URL canônica de todos os quatro hosts e favicon/sitemap
- [ ] Limpar mocks da produção, mantendo conteúdo real existente
- [ ] Revisar autorização no servidor e proteção anti-duplicidade das ações rápidas
- [ ] Definir modelo único de publicação a partir de `editorial_items` e `materias`
- [ ] Habilitar observabilidade de falhas
**Aceite:** nada demonstrativo se apresenta como reportagem; ação não revisada não vira pública; domínios consistentes.

**Sprint 1 — site alimentado (P0/P1)**
- [ ] Publicar 3 reportagens com fonte/contraditório e capas reais
- [ ] Integrar publicação a homepage, `/buscar`, sitemap, RSS
- [ ] Roteiro de republicação para Reel/Instagram/WhatsApp
**Aceite:** criar notícia uma vez e encontrar em todos os locais apropriados, inclusive celular.

**Sprint 2 — frente pública simplificada (P1)**
- [ ] Home com manchete atual, Últimas, Investigações e Bairros
- [ ] Navegação reduzida, card de acompanhamento por caso, segurança do envio
- [ ] Performance e acessibilidade mobile medidas e corrigidas
**Aceite:** leitor novo identifica notícia do dia, investigação e ação em até 2 toques.

**Sprint 3 — descoberta e crescimento (P1/P2)**
- [ ] Search Console + sitemap, relatórios de indexação; analytics com privacidade
- [ ] Séries CSN, trabalho, Rua 33, saúde; páginas por bairro
- [ ] Transcrições de Reels, esquemas corretos e mídia original
**Aceite:** medir indexação, buscas orgânicas, cliques em compartilhamento e retorno dos leitores.

**Sprint 4 — diferenciais (P2)**
- [ ] "O que mudou neste caso?" com cronologia e resposta oficial
- [ ] "O que os documentos dizem?" com fonte primária ligada ao trecho
- [ ] Quiz/explicações em linguagem acessível, áudio narrado
- [ ] Comparação antes/depois e mapa de reportagens, sem expor denunciantes
**Aceite:** cada recurso tem utilidade pública comprovada, não só apelo visual.

## Métricas de resultado

- Matérias originais verificadas/mês e mediana do tempo entre aprovação e URL publicada;
- % matérias com fonte primária, data e status do contraditório;
- % páginas publicadas que estão indexadas, consultas e cliques orgânicos;
- Compartilhamentos/visitas provenientes de Instagram e WhatsApp;
- Retorno a séries/dossiês em 7/30 dias;
- Falhas de publicação, correções e tempo de recuperação;
- Acessibilidade, desempenho no celular e segurança de dados enviados.

## Não verificado / não autorizado nesta auditoria

- Renderização visual real no celular, Core Web Vitals e HTTPS/redirect via cliente;
- Dados reais do Supabase conectado especificamente a esta Vercel;
- Google Search Console, indexação e tráfego;
- Segurança de ponta a ponta do formulário público e da área interna.
- Nenhum arquivo de código de produção foi modificado por esta auditoria. Este relatório entra numa PR documental para revisão.

## Próxima decisão editorial

A prioridade **não** é construir mais 20 páginas. É fazer uma pessoa abrir o site, reconhecer imediatamente uma investigação verdadeira, entender o contexto, acessar evidências e compartilhar — com publicação fluindo de uma única operação simples.
## Registro de execução — Sprint 0 (27/10/2026)

**PR de código:** https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/pull/5

**Executado na branch de revisão:**
- Guard explícito de dados demonstrativos em consultas públicas (pautas, dossiês, campanhas, acervo, memória, territórios, marcos e outras coleções); comportamento de produção = sem fixtures.
- Confirmação editorial exigida na interface e na server action de publicação da Captura Universal, com verificação de permissão no servidor, status condicional e tentativa de recuperação ao falhar.
- Matérias Git incluídas no índice da busca; sitemap expandido para pautas, dossiês e lugares reais; home prioriza matérias autorais quando existirem.
- Nova verificação automatizada no CI para guardas, publicação e indexação.

**Validado:** testes GitHub Actions e compilação de CI concluídos com sucesso para o commit `bd770bc30fd7ef696d5a193efe8c5f34e0b94cd5`. Prévia Vercel READY confirmada para commit anterior `981a97e46073b9308a241c5b327729760224a141`; a prévia do último commit ainda precisava ser confirmada.

**Não concluído:** merge em main, teste HTTP/celular, banco e RLS conectados, teste E2E de publicação real, remoção definitiva da possibilidade de inconsistência entre duas gravações no fluxo rápido, três primeiras reportagens originais.

**Decisão:** conservar PR #5 isolada até verificar a prévia final e segurança operacional.

## Registro de execução — 27/10/2026, etapa seguinte

**Segurança entregue no código:** PR #5 integrada em `main`, commit `2d1ac0597cd508271bf6807298747641e28d5cfb`. Testes GitHub Actions passaram e prévia Vercel do commit revisado `f755ad6abaa3943747097e42a6b129cc59a8b016` ficou READY. Produção passou ao processo de implantação automática; confirmar estado READY antes de relatar publicação efetiva.

**Novo risco documentado:** as migrações 0031/0032 declaram `archive-assets` e `universal_captures` como buckets públicos, com leitura aberta. Uma linha marcada `public_visibility=false` NÃO protege o arquivo nessa arquitetura. Até migrar documentos sensíveis para bucket privado com URLs assinadas e RLS, o formulário interno da Captura Universal não aceita novos anexos, o botão rápido de arquivamento está suspenso e o botão de publicação rápida exige `VR_ENABLE_FAST_PUBLISH=true`, flag não configurada por padrão. Notas textuais sem dados pessoais permanecem disponíveis. **Objetos legados exigem inventário e tratamento posterior, não foram removidos.**

**Integridade editorial:** fixtures de demonstração não aparecem no site de produção; categorias temáticas de memória permanecem como navegação, mas não geram falsos itens publicados. A busca integra matérias Git e sitemap inclui URLs reais publicadas da base. Os textos editoriais do Supabase não foram sobrescritos.

**Primeira matéria em produção editorial:** PR #6 traz rascunho da auditoria da Rua 33 (2021–2026), apoiada pelo dossiê-mestre existente no Google Drive e fontes municipais/imprensa. Arquivo em `editorial-drafts` com `status:draft` e `reviewed:false`, fora do acervo indexável, aguardando contraditório, checagem final e aprovação do usuário. **Não foi publicada na homepage.**

**Próximos blocos:** 1) confirmar deploy e testes cliente HTTP/HTTPS; 2) identificar projeto Supabase realmente usado pela Vercel e inventariar arquivos públicos legados; 3) criar armazenamento privado e migração responsável, sem expor fontes; 4) unificar publisher Git + editorial/Supabase; 5) revisar e publicar a Rua 33 com URL permanente; 6) ativar Search Console e monitorar indexação.

## Auditoria de armazenamento — 27/10/2026

- Produção Vercel READY no commit `afbb6940f631e59bdfd50a0c062aee3cf0e41ce7`; HTTPS da home, robots e sitemap responderam 200, e `/interno/capturar` sem sessão redirecionou para login.
- A URL de produção identifica o projeto Supabase `ghehhhztsukhshdhotmu`. Ele não aparece nas duas contas conectadas ao Supabase disponíveis nesta sessão. Logo, aplicação das migrações, políticas, RLS, contagem e classificação de objetos legados permanecem **não verificadas**. Não consultar outros projetos como substitutos.
- Além da Captura Universal, a entrada editorial e o acervo usam `uploadArchiveAsset` para gravar no bucket legado `archive-assets` mesmo com `public_visibility=false`. O bloqueio preventivo cobre agora esse helper e as duas ações; formulários indicam a suspensão. Ações de entrada e acervo também verificam a allowlist após `getUser`. Os documentos existentes não foram removidos nem tiveram permissões alteradas.
- Projeto proposto: bucket privado separado para originais internos; metadados identificam bucket e caminho sem URL pública; acesso por sessão verificada e autorização específica no servidor, com URLs assinadas curtas e sem cache público. Materiais aprovados para divulgação devem ser copiados deliberadamente para bucket público separado, nunca tornar o original interno público. Antes de ativar: inventário por contagem e referências, classificação humana, teste com usuário anônimo e autorizado, cópia verificável com hashes, revisão de links e cache, plano de reversão e aprovação para mudanças em objetos ou permissões existentes. A suspensão de uploads não protege objetos legados já públicos.
- Publicação rápida permanece desativada; unificação editorial, transações atômicas, histórico de correções e teste E2E ainda pendem de acesso e validação. O rascunho da PR #6 continua sem aprovação ou publicação; documentos primários, valores e contraditório devem ser conferidos antes de finalizar.
