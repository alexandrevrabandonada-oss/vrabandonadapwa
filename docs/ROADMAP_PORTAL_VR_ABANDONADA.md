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


## Sprint visual V2 — reestruturação mobile-first (27/10/2026)

**Origem:** captura real do site em dispositivo Android fornecida pelo proprietário. Diagnóstico visual: painel de leitura por voz ocupa grande parte do viewport; menu inferior cai numa segunda linha; baixa hierarquia de notícia e excesso de apresentação institucional.

**Código proposto em branch independente do Sprint 0 / PR #7:**
- Homepage mais enxuta com manchete editorial introdutória, últimas **publicações efetivamente publicadas**, investigações, bairros, busca e vínculo contextual com COMUN. Nunca sintetizar matérias fictícias quando o banco/acervo está vazio.
- Nova barra mobile com **quatro destinos + botão Menu** em cinco colunas, ícones compactos e labels legíveis. Ajustes de área segura do Android/iOS, sem barra dupla.
- Leitor de voz acionado apenas por ação explícita: sem salvar/reabrir painel por localStorage, sem rolagem automática na montagem, botão Fechar que interrompe a narração; janela compacta limitada à altura móvel.
- Cabeçalho tipográfico responsivo, paleta grafite/amarelo, contrastes definidos, tipografia editorial e blocos de notícias com leitura clara.
- Navegação simplificada em Últimas / Investigações / Bairros / Buscar; seções antigas continuam acessíveis via menu e URLs estáveis.
- Sem mudanças no Supabase, capturas, buckets, direitos de publicação, domínio ou APIs sensíveis.

**Aceite e verificação:**
1. Build Next.js + TypeScript + lint + testes Node.
2. Conferir prévia da PR; comparar mobile 360, 390 e 430 px e desktop.
3. Validar abertura/fechamento de áudio, ausência de auto-abertura após recarregar e ausência de scroll involuntário.
4. Garantir que o menu inferior permaneça uma linha com cinco ações em 360–430 px.
5. Validar conteúdo publicado real, foco por teclado, contraste, zoom de texto e ausência de overflow.
6. Somente integrar em produção depois da inspeção visual e de fluxos reais; não confundir READY com aceitação de UX.

## Passada UI/UX V3 — densidade editorial Android

**Origem e evidência:** capturas reais do portal em Android após o lançamento V2. A barra inferior ficou numa única linha, mas a homepage ainda apresentou hero excessivamente alto, estado vazio grande, cartões de temas superdimensionados, aviso institucional amarelo dominante e textos cortados à direita. A página Últimas repetia um hero genérico em vez de mostrar publicações.

**Diagnóstico de conteúdo:** public/data/instagram-posts.json contém zero posts importados no commit auditado, e a camada content/materias ainda não fornece notícias aprovadas. Não inserir exemplos para fingir movimento. O Instagram oficial segue acessível externamente; o conteúdo só integra o portal quando importado de forma fiel e autorizada.

**Implementação na PR separada de Storage:**
- CSS mobile-first refinado para hero, títulos, estados vazios, cards e CTAs entre 320 e 640 px sem bloquear zoom.
- Sem matérias publicadas, apresentar aviso compacto com link ao Instagram oficial e busca; diferenciar temas de cobertura de dossiês realmente publicados.
- Rota /agora simplificada para reunir matérias aprovadas, publicações importadas e dados públicos do Radar, deduplicados e ordenados por data; sem hero genérico. Preservar /agora#mudou.
- Quadro institucional passa a ser discreto no celular, mantendo referência contextual ao COMUN.
- Cache PWA versionado para v3; nenhuma navegação é armazenada no runtime cache e rotas internas/autenticação são ignoradas pelo service worker.
- Nenhuma mudança no banco Supabase, permissão de arquivos, secrets ou PR #7.

**Critérios antes de merge:** testes, types, lint, build, Vercel READY; comparação visual 320, 360, 390, 430 px e desktop; verificar overflow, zoom, menu, busca, tela vazia e fluxo com conteúdo real. Sem navegador autenticado nesta sessão, não declarar validação visual real.


### Revisão visual real da PR #9 — screenshots Android do proprietário
- Screenshots enviados do **preview**, abrangendo homepage, rodapé, rota /agora e rota /dossies. A homepage ficou substancialmente mais compacta e legível; o Agora passou a usar listagem e estado vazio honesto. **O bloqueador remanescente era /dossies:** hero original em caixa alta de ~13vw, largura superior ao viewport e texto cortado.
- Correção nesta mesma PR: rota /dossies substituída por cabeçalho pequeno, agrupamento somente de dossiês efetivamente publicados e links úteis; estados sem conteúdo não exibem números vazios nem capas artificiais. Rota antiga e slugs dos documentos preservados.
- Aplicada folha de estilos própria para dossiês com título móvel <= 2,35rem, itens compactos, quebra de linhas robusta e sem dependência do hero global. Ajustes no rodapé: remove texto sobre tecnologias internas, reduz espaço vertical e elimina assinatura duplicada da homepage.
- O botão circular preto com símbolo compatível com a Vercel Toolbar aparece apenas na captura do preview. Sem prova de que seja um componente do portal; não tentar ocultá-lo por CSS do site. Confirmar ao inspecionar o domínio público.
- Testes adicionados para evitar regressão do hero de dossiês, presença de estados vazios honestos e informações públicas corretas no rodapé.
- **Publicação:** não integrar a PR apenas porque o build ficou READY. Checar CI, prévia real e nova captura de /dossies num celular antes do merge. PR #7 e arquivos legados permanecem intocados.


### Revisão UI V3.2 — busca no preview Android

**Evidência:** nova rodada de imagens enviadas pelo usuário no preview, mostrando que /dossies está sem o hero cortado e que /buscar ainda exige rolagem extensa por capa gigante, tutorial, histórico de leitura, filtros empilhados, sugestões, resultados e um segundo destaque repetido.

**Achado de integridade editorial:** `getEditorialSeriesCards(editorialItems)` retornava 4 séries do catálogo mesmo com `items.length === 0`, que apareciam como "4 resultados encontrados". Uma série temática sem pauta aprovada não deve ser apresentada como publicação encontrada no índice. Corrigir o construtor do índice público para incluir apenas séries com itens publicados. Não remover a taxonomia de temas nem alterar os dados de origem.

**Implementação:** reformular `/buscar` para pesquisar imediatamente no primeiro viewport, com campo de busca visível, filtros semânticos expandíveis (tipo, território, ator, ordem), sugestões explícitas como termos e lista de resultados públicos sem duplicações de destaque nem trilha de leitura. Vazio honesto com link para Instagram oficial. CSS responsivo em 320–430px, desktop e tablet. Sem tocar em autenticação, Supabase ou arquivos legados.

**Aceite:** CI (Node, TS, lint, build) e Vercel READY; conferir por screenshots no Android real. Não integrar PR #9 por inferência de sucesso de build. Validar ao menos uma consulta com termo que encontra conteúdo e outra sem resultado; filtros não devem mudar os dados públicos sem aprovação editorial. A plataforma ainda depende de alimentar o acervo com matérias aprovadas.

## Sprint editorial Git-first — pós V3 (27/10/2026)

- A PR #9 do redesign mobile foi integrada ao `main` como `a9a7aa6f4147ee67b44dda0232f0cdec90f60c9f`, após aceitação visual via Android, CI verde e prévia READY. Vercel confirmou o deploy de produção READY.
- Confirmado: `public/data/instagram-posts.json` ainda é `[]`; nenhum Instagram real foi automaticamente incorporado à homepage. Não confundir ausência de itens no sistema com ausência de publicações do veículo.
- Fluxo de publicação Git-first implementado em branch separada: `scripts/editorial-workflow.mjs` cria rascunhos de posts legítimos, sem publicar; rotina de aprovação verifica checklist factual, fontes, contraditório, privacidade, responsável e data. Emite matéria JSON apenas mediante `--write`; depois depende de revisão/merge na PR.
- Rascunhos são ignorados no Git por padrão para proteger dados não revisados. Nenhum texto real ou depoimento sigiloso é publicado automaticamente.
- Matérias aprovadas aproveitam SEO existente: URL canônica, meta description/Open Graph, JSON-LD Article, inclusão no sitemap, busca e homepage. **Indexação efetiva no Google não é garantida pela presença de SEO**; monitorar Search Console quando conectado.
- Pendente: autenticar conta profissional Meta/Instagram e configurar credenciais seguras e permissões; importar posts reais com autorização; produzir e aprovar a primeira matéria, testar imagem/capa, links, segurança de fontes, indexação e revisão em produção.
- Este sprint não modifica o Supabase, buckets privados/legados nem os trabalhos de proteção da PR #7.

## Sprint automatização Instagram segura — 27/10/2026

- Corrigido desenho do job em `.github/workflows/import-instagram.yml`: substituído `git push` direto à main por PR de revisão em modo rascunho, preservando janela de quatro horas e disparo manual.
- Runner só importa quando `INSTAGRAM_ACCESS_TOKEN` está configurado como secret no GitHub. Sem credencial, não altera posts existentes.
- Uma PR automatizada só deve entrar na main depois da conferência das legendas, imagens, direitos e dados sensíveis. Dados do Instagram público não são reportagens jornalísticas automaticamente verificadas.
- Criada validação do índice antes de build e PR, cobrindo ID, duplicação, legendas, data, permalink, tipo de mídia e caminho de capa. Download endurecido contra mídia não JPEG, arquivo inválido e redirects externos.
- GitHub Actions pode precisar de autorização para gerar PR no Settings do repositório. PRs geradas com `GITHUB_TOKEN` não disparam CI automaticamente: exigir checagem manual e Ready for review antes do merge.
- Importador de postagens ainda não foi exercitado com uma credencial Meta verdadeira; `public/data/instagram-posts.json` continua vazio. A automação é preparada, **não conectada nem executada com posts reais**.
- Não modifica Supabase, buckets ou PR #7; não integra dados de denúncia não publicados ou de fontes privadas.


## Sprint Agente Editorial sem Meta — 27/10/2026

- Arquitetura escolhida: publicação pelo ChatGPT conectado ao GitHub, com revisão de fontes e aprovação expressa do texto final antes de mesclar na main; Vercel distribui o site.
- Novo painel interno /interno/agente com autenticação existente, contador de matérias e importações, área de preparação de pauta e comando editorial copiado localmente. Não é um LLM hospedado nem envia texto automaticamente.
- Vigia técnico no GitHub Actions: 09h17 BRT diariamente, com acionamento manual; testa homepage, robots, sitemap, feed e amostra de matérias, criando e encerrando Issue deduplicada em caso de falha/recuperação. Não comprova indexação Google.
- Testes, documentação operacional e atalho no cockpit. Esta PR não publica nenhuma matéria, não modifica Supabase nem PR #7 e não exige token Meta.
- Pendente: CI, preview, teste real do login/admin no celular e aprovação editorial da primeira reportagem efetiva.


## Publicação inaugural como investigação viva — 28/10/2026

- Usuário autorizou explicitamente o texto inaugural da Rua 33, mesmo com o contraditório ainda pendente; futuras respostas deverão ser incorporadas à mesma matéria.
- PR #13 passa de rascunho técnico para a primeira publicação autorizada em `content/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json` com status reviewed/published e data local de 28/10/2026.
- Novo padrão opcional para publicações: `investigationStatus: ongoing` e `updates[]` (data/título/resumo), exibidos com indicador de investigação em andamento e histórico público. Atualizações futuras preservam permalink, alteram `updatedAt` e acrescentam eventos.
- O texto informa expressamente que ainda não houve contato específico com Prefeitura, Grupo VR e Luquip e não sugere resposta recebida. Dados parciais não são apresentados como custo final, nem há imputação de fraude.
- Na conclusão desta fase verificar CI, preview Vercel, merge, produção READY, página real, sitemap e RSS. Indexação Google exige verificação posterior.


## 28/10/2026 — Editorias notícias e investigações, sem dependência Meta

- Nova rota pública `/noticias`: notícias classificadas como `kind=news` com página própria de listagem, pesquisa, estados vazios honestos, fontes e URL editorial. Não publicar conteúdo fictício.
- Formatos em JSON `kind: news | investigation | explainer`; Rua 33 marcada explicitamente como `investigation`, sem mudar seu conteúdo substantivo ou permalink.
- `/agora` continua fluxo cronológico de publicações e atualizações, sem promover postagens importadas como notícias verificadas; homepage passa a vincular a editoria Notícias e identifica os formatos das matérias.
- `/materias` permite filtros por formato; `/publicacoes` (índice legado) redireciona para `/noticias`, preservando URLs antigas de registros individuais `/publicacoes/[id]`.
- RSS passa a refletir as matérias jornalísticas publicadas em vez de importações sociais brutas; sitemap inclui `/noticias`, NewsArticle JSON-LD aplicado a notícias.
- Menu do site distingue Notícias, Últimas, Investigações e Acervo. O painel privado mostra quantidade de notícias, e o agente editorial oferece modo de preparar notícias diretamente de uma legenda/post/release/documento, sem chaves da Meta.
- Nenhuma notícia real nova foi inventada ou importada nesta migração; a editoria pode ficar vazia até a primeira notícia aprovada.
- Verificar CI, preview, UX móvel e link canônico; deploy só após merge. Na primeira notícia real testar capa, vídeo/Reel (se licenciado), contraditório e rastreio da indexação no Search Console.


## 28/10/2026 — Notícia viva: atualização visível na editoria e RSS
- Depois da primeira notícia do 28º BPM e sua segunda versão com boletins oficiais de 28/10, detectou-se que `/noticias` mostrava somente a data original e ordenava apenas por `publishedAt`; a linha do tempo dizia "investigação" mesmo em notícias. O RSS também ordenava exclusivamente pelo instante de publicação original.
- Corrigir sem alterar conteúdos, datas ou slugs: listagem de notícias ordena por `updatedAt || publishedAt`, preserva a data inicial e mostra "Atualizada em" com horário de Brasília; página de matéria mostra "Notícia atualizada" e a linha do tempo passa a chamar "Atualizações desta notícia"; investigações mantêm texto próprio.
- RSS preserva `pubDate` original e agrega `dc:date` com o último instante modificado, priorizando itens atualizados no XML. `NewsArticle`/Open Graph/sitemap já utilizavam dataModified.
- Fontes dos boletins de 28/10 conferidas independentemente em comunicados Prefeitura nº 12814/12815 e Diário do Vale; quatro viaturas e >=16 agentes permanecem como REFORÇOS ANUNCIADOS, não chegada verificada. Não criar nova matéria nem republicar a notícia, somente melhorar a representação de atualização.
- Pendências: HTTP público indisponível a este ambiente por DNS, portanto Search Console/indexação e renderização real no celular não confirmados. Verificar CI e preview antes de merge, depois deploy produção READY.


## Revisão UI/UX V4 — 28/10/2026 | Navegação coerente e notícia em primeiro lugar

**Escopo desta passada:** código `main` e capturas Android fornecidas nas conversas anteriores; **não** há medição Lighthouse, vídeo E2E ou captura autenticada de produção nesta rodada. Vercel READY não constitui teste visual.

### Achados que fundamentam as correções

1. **Primeira dobra:** o cabeçalho editorial da home ainda é um hero grande, antes de qualquer notícia real. O leitor precisa rolar muito até ver matéria; o modelo antigo com bloco institucional ocupa a atenção.
2. **Falsa capa visual:** reportagem sem foto recebe retângulo 16:9 com letras VR enormes. Funciona como preenchimento artificial e desloca a manchete. Decisão: matéria sem capa exibe manchete diretamente; nunca gerar fotografia sem licença.
3. **Investigações desconectadas:** a home lê dossiês Supabase e, se não houver, mostra apenas temas de busca, embora haja investigação Git-first da Rua 33 publicada em `content/materias`. A home deve considerar ambos os fluxos e priorizar casos reais.
4. **Navegação desencontrada:** desktop oferece Notícias, barra móvel oferece Buscar, mas não Notícias; menu repete itens e a busca fica invisível se for retirada da barra. Decisão: quatro destinos móveis Início, Notícias, Últimas, Dossiês + Menu; busca iconográfica com nome acessível no cabeçalho do celular.
5. **Menu não modal de verdade:** embora marcado aria-modal, o componente não controla foco, não impede Tab de escapar, nem evita scroll do documento. Corrigir ciclo de foco, Escape e retorno ao acionador.
6. **Leitura de matérias:** H1 no celular com tamanho mínimo de 2.8rem e uppercase força excessiva altura e quebra. Ajustar para tipo editorial em caixa natural, largura responsiva e espaçamento controlado.
7. **Rodapé e navegação fixa:** bottom bar pode tapar links finais em telas pequenas. Acrescentar respiro considerando `safe-area-inset-bottom`.

### Implementação na PR V4

- Home com masthead textual compacto, atalhos claros e bloco de destaques logo depois; mantém identidade preto/dourado e conteúdo honesto.
- Card principal sem foto vira card editorial tipográfico. Fotos existentes autorizadas permanecem.
- Home prioriza `kind=investigation` Git-first e só recorre a dossiês Supabase e temas de cobertura quando não existirem matérias correspondentes.
- Barra de navegação móvel alinhada ao percurso jornalístico, busca no cabeçalho e menu mais acessível.
- CSS V4 separado, carregado após os estilos legados, com melhorias específicas de mobile (320–430 px), tipografia, foco, reduzido movimento e respiro inferior.
- Testes de regressão do desenho editorial, ordem dos blocos, integridade, menu e acessibilidade.

### Fila de próximas grandes passadas

**P0, antes de considerar o redesign validado no mundo real:** capturas Android em 320/360/390/430 px e desktop 1280; navegar em /, /noticias, /agora, /materias/<slug>, /dossies e /buscar; validar menu aberto/fechado e botão Ouvir, scroll e teclado. Testar em sessão pública sem Vercel Toolbar. Validar ausência de overflow horizontal.

**P1:** consolidar arquitetura de URL editorial (a relação entre `/dossies` Supabase e investigações Git-first `/materias` é atualmente híbrida); unificar busca transversal e filtros sem duplicar itens. Criar taxonomia única para bairro/assunto/ator/temporalidade em notícias e investigações.

**P1:** melhorar capa e distribuição de notícias com imagens próprias licenciadas, proporções previsíveis e OG real; aprimorar compartilhamento no WhatsApp e Stories. Não gerar fotos documentais de fatos como se fossem registros reais.

**P1:** acompanhar Core Web Vitals e Lighthouse medidos (LCP, CLS, INP, contraste) com orçamento definido após linha de base real. Sem métricas verificadas, não atribuir nota à interface.

**P2:** revisão do sistema de design para reduzir as três folhas CSS legadas (globals.css, portal-v2.css, materias.css), extrair componentes reutilizáveis, tokens e padrões; não migrar tudo de uma vez.

**P2:** avaliar painel editorial próprio para publicação assistida, com prévia no mesmo layout, validação de fontes e agendamento, sem duplicar COMUN ou criar fluxo automático sem aprovação.

**Aceite para merge:** GitHub CI verde incluindo TypeScript, lint, build e testes, Vercel Preview READY; inspecionar alterações e conferir que matérias reais, SEO e PR #7 não sofrem mudanças. **O aceite visual em smartphone físico continua pendente**, mesmo com o deploy de código aprovado.


## Iteração mobile V5 — 28/10/2026 (capturas Android reais)

Problemas observados nas capturas: cabeçalho com marca, busca e Ouvir ocupando espaço excessivo; barra móvel no limite da largura; repetição da investigação Rua 33 na home; Acervo sem itens exibindo estatísticas zeradas e muitas seções; Territórios sem cadastro exibindo longa introdução. A editoria Notícias já exibe uma notícia real; não alterar conteúdo nem inventar páginas.

1. Novo app/portal-mobile-v5.css importado por último. No mobile, header em grid (marca + ações), sem quebra para segunda linha; barra inferior com cinco colunas e elementos sem largura mínima; títulos dos heróis de Acervo/Territórios com escala legível.
2. Homepage elimina repetição da investigação que já ocupa o destaque; quando não há outros casos, oferece chamada curta. CTA distingue notícia versus investigação.
3. Acervo sem documentos/coleções passa a orientar o leitor às fontes nas matérias, pesquisa e investigações; catálogo já preenchido permanece inalterado.
4. Territórios sem registros públicos usa busca por bairros presentes nas matérias; se houver registros, conserva o atlas.
5. Testes regressivos para UI, conteúdo e classificação editorial, sem inserir publicações fictícias.

Verificar CI e Preview, foco, overflow e viewport 360/390/412px. Compilação não prova visual mobile. Sem alteração no banco, RLS, domínio, conteúdo investigativo ou arquivos privados.


## Sprint 28/10/2026 — Acervo + bairros derivados das matérias

- Revisão de arquitetura: Acervo = índice editorial com camadas documentais; Bairros = índice de recorte territorial com vínculos explícitos por matéria, sem duplicação nem COMUN.
- Novo `territories[]` com papéis `main` e `mentioned` em matérias Git-first; cobertura inicial de Vila Santa Cecília, Vila Brasília e Água Limpa, distinguindo a menção contextual da notícia de segurança.
- Páginas editoriais derivadas de bairros em `/territorios/[slug]` coexistem com os hubs existentes do Supabase. Nenhum bairro vazio é inventado.
- `/acervo` passa a mostrar matérias reais mesmo sem anexos publicados; `/buscar`, homepage, artigo e sitemap participam da mesma taxonomia.
- Documento canônico da arquitetura: `docs/ARQUITETURA_ACERVO_TERRITORIOS.md`. Verificar CI e produção separadamente. Nesta sprint não escrever no Supabase, não alterar Storage, nem importar conteúdos privados.

---

## UX V6 — jornada contextual integrada (28/10/2026)

**Diagnóstico sobre a main corrente, não a PR #17 antiga:** a main já introduziu jornalismo Git-first e bairros derivados por `territories: [{slug,label,role}]`, com distinção `main`/ `mentioned`. A proposta V6 parte desse estado e **não copia a PR #17 desatualizada**.

**Promessa de produto mantida:** uma publicação original, múltiplas maneiras de encontrá-la e checar as evidências. Acervo e Bairros são índices do próprio conteúdo jornalístico, não microssites.

**Implementação em PR separada `ux-v6-jornadas-contextuais-20261028`, pendente de merge:**
- Em `/materias/[slug]`: guia contextual visível para texto, histórico se houver, fontes e registro no Acervo; vínculos territoriais explicitam `foco da matéria` versus `citado`; links internos só apontam para URL existente; outras matérias são recomendações de leitura, **não relações causais**.
- Em `/acervo`: uma única composição visual em qualquer situação (com/sem registros no Supabase). Primeiro matérias publicadas, depois referências externas aprovadas agrupadas por reportagem e fechadas progressivamente, depois arquivos públicos e coleções. Links externos levam à origem, **não** constituem cópia ou garantia de disponibilidade. Preservar filtros `type,year,place,memory` e URLs de itens/coleções.
- Em `/territorios`: intro editorial compacta, índice dos bairros efetivamente vinculados nas matérias, hubs publicados complementares, sem duplicar slugs. Nenhum novo bairro criado por texto livre ou menção não verificada.
- De `/territorios/[slug]` para o Acervo: consulta das fontes das reportagens vinculadas diretamente ao local, com link de volta à matéria original.
- CSS V6 escopado e acessível, com foco visível, áreas tocáveis e respeito à redução de movimento.

**Não executar nesta PR:** migração Supabase, supressão de dados ou rotas existentes, troca do logo original fornecido por um desenho regenerado, novas fotografias de fatos, mudanças em texto editorial, publicação sem revisão, automações de denúncias ou integração COMUN.

**Aceite objetivo:** testes Node/testes editoriais, typecheck, lint, build Next.js no SHA exato da PR; preview Vercel READY; revisão visual mobile 320/360/390/430 e desktop; conferir navegação por fragmentos, filtro de memória, links de fontes externos, teclado, 200% zoom, menu e leitor de voz. Não confundir preview READY com teste E2E nem validação por usuário real.

**Próximo P1:** ligar documentos públicos hospedados a um identificador de apuração validado, sem importação automática, e consolidar taxonomia de território/editoria/caso no índice de busca; migrar gradualmente CSS V2–V6 para tokens sem alterar identidade aprovada.

### Sprint V6.1 — percurso completo, homepage e âncoras

**Evidência:** contexto da aba de Preview V6 aberta no navegador pelo usuário confirma que a Home ainda apresentava a reportagem Rua 33 como chamada de Últimas e repetia título/resumo em Investigações. O teste de navegação foi leitura de DOM/links da aba, **não inspeção visual de viewport nem E2E**.

**Correções na PR #25, sem mexer no JSON jornalístico nem em produção:**
- `app/page.tsx`: lista de IDs das matérias efetivamente visíveis na primeira área editorial; o mesmo permalink não reaparece como cartão integral em Investigações. Quando o caso também está visível em Últimas, há um único atalho compacto para histórico e fontes. Corrigida a comparação antiga que misturava slug puro com identificador `materia-...`.
- Home prioriza bairros com vínculos territoriais presentes em matéria aprovada; hubs válidos entram sem duplicação; bairros somente citados exibem explicitamente `menção contextual`.
- A chamada institucional longa de rodapé da Home foi convertida em uma ação concreta para enviar informações à redação, com regra de verificação editorial e link ao método.
- `app/territorios/[slug]`: quando existe um hub territorial e cobertura editorial do mesmo bairro, a seção de notícias verificadas aparece **antes** dos extensos painéis descritivos e operacionais.
- `components/reveal-source-from-hash.tsx`: ao chegar de uma matéria via `/acervo#fontes-<slug>`, o respectivo `details` abre automaticamente, de modo que a fonte realmente fique acessível. É usado somente para slugs conhecidos e preserva controle manual do leitor. Sem necessidade de consulta a dados privados.
- Testes de regressão ajustados para exigir deduplicação, priorização dos bairros, ação de participação, ordem do conteúdo territorial e abertura de fonte por hash.

**Aceite pendente:** finalizar checks do último SHA, confirmar Vercel Preview `READY` para o mesmo commit; inspecionar /, /acervo, /territorios e duas páginas de matéria em Android e desktop, com navegação por links e filtros. Não mesclar até inspeção visual. Os checks da V6 anterior eram verdes, porém não validam commits novos.

**UX seguinte (não incluída nesta PR):** reduzir CSS legado por migração progressiva de tokens, implementar busca contextual por bairro e documentos com proveniência, e medir Web Vitals/contraste reais.

---

## Design System V7 — convergência visual e navegação

**Depende da PR #25 (UX V6)**, baseada no HEAD `8520dcb389e851753483e0e246950a8ed9d4e04a`. Não é alteração de produção nem faz parte do merge automático da V6.

### Entrega planejada nesta branch
- Criar `app/design-tokens.css` como origem de cor, tipografia, medidas, raios, foco e alvos de toque, com aliases temporários V2/V6 e importação anterior aos estilos editoriais.
- Extrair `components/editorial-hub-intro.tsx` do cabeçalho de Acervo/Bairros: um componente, navegação por âncora e URLs, H1 exclusivo da página.
- Migrar estilos V6 e índices editoriais aos tokens e reduzir exagero do título e espaçamento de leitura das matérias sem alterar conteúdo.
- Corrigir barra móvel para quatro destinos **Início · Últimas · Casos · Buscar** mais Menu. Notícias permanece disponível na URL própria e no menu, mas não compete pela função de atualização cronológica.
- Ajustar menu e rodapé para evitar duplicação de `Acompanhar` e priorizar o envio de informações à redação.
- Preservar inteiros os arquivos `content/materias`, o logo, a separação do COMUN e o Acervo privado.

**Critérios de aceite:** `tests/design-system-v7.test.mjs` checa contrato de tokens, contraste AA básico, hierarquia de imports, navegação, introdução compartilhada e integridade dos dois artigos; suíte existente, typecheck, lint, build Next e preview READY do mesmo commit; inspeção visual real permanece necessária.

**Documentação dedicada:** `docs/DESIGN_SYSTEM_EDITORIAL_V7.md`. Não apagar folhas legadas até migrar e revisar cada módulo. Depois desta etapa, migrar cartões editoriais gradualmente, auditar fontes e desempenho com navegador/dispositivo real.

**Sem merge automático:** a V7 deve ser revista isoladamente e integrada depois da V6 aprovada, respeitando o histórico e as verificações de cada commit.

---

## Sprint V7.1 — cartões compartilhados e página Casos útil

**Problema real identificado:** a navegação móvel V7 dá ao leitor a aba `Casos` (rota `/dossies`), mas essa página consultava apenas dossiês estruturados no Supabase. Reportagens investigativas aprovadas e presentes no Git — como a Rua 33 — podiam estar publicadas e, mesmo assim, a área exibir a mensagem de dossiês em preparação. Esse é um erro de produto, não apenas de CSS.

**Implementação V7.1, PR empilhada na V7 (#26):**
- `app/dossies/page.tsx`: integra `getMaterias()`, filtra só `materiaKind(article) === "investigation"` e exibe estas publicações com URL original `/materias/<slug>`. Os dossiês Supabase continuam em grupos próprios. O aviso de ausência aparece **somente** se não existir nem reportagem investigativa Git, nem dossiê público no banco. Não inventar dossiês artificiais nem declarar uma relação causal entre eles.
- `components/editorial-story-card.tsx`: cartão canônico para matérias com título, seção, data, resumo, fontes externas publicadas e bairro principal revisado. Contexto de menção ao bairro é um rótulo explícito do chamador; não é um novo fato jornalístico.
- `components/editorial-navigation.tsx`: Acervo e cobertura por bairros usam este cartão, preservando os links de origem, o H3/H4 correto e o rótulo contextual. A página Investigações usa o mesmo cartão para reportagens investigativas.
- `app/editorial-cards-v7.css`: superfície, foco, contraste, toque, radius e movimento reduzido aplicados a cartões de reportagem, bairro, documento, coleção e dossiê. Os componentes específicos mantêm mídia, direitos, status e metadados próprios.
- `tests/editorial-cards-v7.test.mjs`: regressões de informações publicadas, integração de Casos, permalinks, rótulos e interface.
- `app/layout.tsx`: novo CSS entra após os estilos legados e usa tokens V7, sem apagar folhas anteriores ou reproduzir a marca.

**Não alterados:** JSON de matérias, atribuições, fontes, revisão editorial, banco, esquemas, endpoints de envio de denúncias, identidade aprovada e URLs legadas. **Sem merge automático**.

**Portões da PR:** CI Node, TypeScript, lint, Next build e Vercel Preview no SHA exato; QA visual /dossies, /acervo, /territorios e leitor de reportagens em Android e desktop; conferir links para fontes no Acervo e ausência de overflow. Vercel READY não equivale a UX verificada.

**Próximo:** checar a correspondência explícita entre reportagem Git e dossiê Supabase (ID estável, editorialmente curado), evitando títulos parecidos como critério de união; consolidar componentes de metadados e cartões secundários só após a revisão visual desta PR.

---

## Sprint V7.2 — verificação HTTP independente de Vercel

**Problema:** a Vercel devolve `build-rate-limit` para a PR #27, apesar de o GitHub Actions aprovar TypeScript, lint, testes Node e `next build`. Isso impedia provar que a versão candidata renderiza realmente suas páginas principais. Não assumir que um deploy antigo `READY` corresponde ao HEAD atual.

**Implementado em V7.2, na mesma PR #27 (sem abrir nova PR):**
- `scripts/smoke-local-portal.mjs` inicia o servidor Next.js de produção compilado, **em loopback**, após a etapa `npm run build`; faz requisições HTTP reais em Início, Últimas, Notícias, Investigações/Casos, Acervo, Bairros, Rua 33, Vila Brasília, `robots.txt` e `sitemap.xml`. Verifica status 200 e conteúdo editorial esperado.
- Testa a premissa crucial: `/dossies` contém reportagem investigativa publicada no Git mesmo sem dossiê Supabase; `/acervo` expõe o atalho de fontes por slug aprovado.
- Requisita permalink deliberadamente inexistente e exige HTTP 404. Faz encerramento de processo ao terminar, com timeout e logs curtos; não usa credenciais nem acessa serviços externos.
- `.github/workflows/validate-portal.yml` executa o smoke após o build. Esta etapa protege regressões reais em HTML sem obrigar o uso da cota Vercel.
- Corrigidos avisos de compatibilidade CSS relativos a `align-items: end` em três folhas, usando `flex-end`. No menu React, o botão de retorno do foco é capturado na abertura, evitando referência potencialmente variável na limpeza do efeito.

**Evidência do primeiro ciclo (HEAD `6c6cf37a9cd3337f704ff995632429593e8a45e1`):**
- **113 testes Node aprovados, 0 falhos;** TypeScript, lint e build sucesso; requisições HTTP locais de 10 páginas/rotas com 200 e uma com 404, incluindo verificação de Casos e âncora de Acervo.
- O build registrou avisos do Autoprefixer sobre `end` e um aviso do ESLint sobre `triggerRef.current`, que motivaram as correções de compatibilidade seguintes.
- **O teste local não é QA visual**: não confirma breakpoints reais, contraste renderizado, teclado, leitor de tela, carregamento com dados Supabase de produção, rede externa ou preview Vercel. Esses portões permanecem abertos.

**Política de integração:** não mesclar as PRs #25, #26 ou #27 antes de QA visual e de um preview correspondente ao HEAD exato. Reusar o smoke em futuras alterações editoriais sem consumir builds externos desnecessários. Não contornar limites Vercel desabilitando proteções ou expondo variáveis.

---

## Sprint V7.3 — QA visual Chromium e correções fundamentadas

**Objetivo:** remover o bloqueio de ausência de inspeção visual de fato, não confundir `next build` com experiência coerente. Navegador Chromium local executado pelo GitHub Actions contra o **mesmo HEAD** do Next compilado, sem tocar em produção ou depender de autenticação Vercel.

**Implementação:**
- `scripts/audit-local-ux.mjs`: usa Chromium/Playwright pinado no CI e navegador móvel em **320/360/390/430 px**, além de desktop **1440 px**. Percorre Início, Casos, Acervo, Bairros, reportagem Rua 33 e notícia Vila Brasília; captura PNGs públicos de página completa e um `summary.json` com erros/medidas; não guarda cookies, envs privados nem dados autenticados.
- Mede `documentElement.scrollWidth <= clientWidth + 2`, confere colunas centralizadas de Acervo/Bairros, presença da Rua 33 em Casos, metadados do cartão sem CSS de rota externa, e evidências no Acervo.
- No celular, testa clique na barra inferior, abertura/fechamento do menu com Escape, retorno de foco ao botão original, e link de reportagem para `/acervo#fontes-<slug>` com expansão automática.
- `.github/workflows/validate-portal.yml` instala Playwright isoladamente no runner, após Node tests, lint, TypeScript, build e smoke HTTP, e disponibiliza PNGs/JSON como artefato `vr-abandonada-qa-visual` por 7 dias, inclusive em falha. Não publica screenshots na web ou em produção.

**Achados reais da primeira captura Chromium (HEAD `7f7765292792217a6ceefa5fe88cd5b2798f8e25`):**
- Em Acervo e Bairros, **6 px de overflow horizontal** tanto em 360 como em 390 px. Demais quatro rotas nesses tamanhos, e seis rotas desktop, sem overflow. Barra móvel, Escape/foco e fontes por hash passaram.
- **Causa localizada:** regra móvel `.vr6-hub__jump { margin-right: -.4rem }` em `app/experience-v6.css`, neutralizada; trilho continua rolável internamente.
- **Erro de aparência no cartão Casos:** `EditorialStoryCard` utilizava `.vr-index__meta` de folha CSS importada somente por `EditorialNavigation` em Acervo/Bairros. Em `/dossies`, a data ficava colada à categoria. O CSS V7 passa a definir layout `flex`, espaçamento, tipografia e padding próprios.
- **Inconsistência de desktop:** `.vr6-hub { width:100% }` anulava a largura central herdada de `.container`, deixando Acervo/Bairros sem o mesmo alinhamento que outras páginas. Removida a sobrescrita. Teste agora exige margens laterais simétricas.
- **Artefato histórico da primeira rodada:** https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/actions/runs/40737949329/artifacts/12837404954 ; é evidência do problema, **não da versão corrigida**.

**Critérios pendentes antes do merge:** CI no HEAD final; capturas corrigidas analisadas por responsável e conferência visual da experiência real; Vercel Preview `READY` para o mesmo SHA; verificação de conteúdo com Supabase público e interação de zoom 200%/leitor de tela. Screenshot de navegador automatizado **não é substituto integral de QA humano**.

**Governança:** PR #25 → #26 → #27 continuam empilhadas e em draft. Corrigir o artefato e evidenciar os resultados; não promover PR antiga nem mesclar produção sem autorização.

---

## Sprint V7.5 — gates de qualidade obrigatórios

**Diagnóstico:** apesar de `npm run typecheck` e `npm run lint` aprovados no CI, `next.config.ts` ainda continha `ignoreBuildErrors: true` e `ignoreDuringBuilds: true`. Uma compilação ou deploy desacoplado do workflow poderia ignorar erros reais. Além disso, mudanças isoladas em `next.config.ts` ou `tsconfig.json` não estavam na lista de arquivos que disparavam o workflow de PR.

**Implementação na mesma PR #27:** removidas as duas dispensas do Next (gates nativos voltam a valer); o workflow observa `next.config.ts`, `tsconfig.json` e `.eslintrc*`; adicionados testes de contrato verificando ausência das dispensas, sequência de CI e observação de mudanças. O ajuste foi agrupado em um commit para reduzir builds desnecessários da Vercel.

**Situação antes da alteração:** PRs #25, #26 e #27 abertas, rascunho e encadeadas; `main` inalterada. No SHA `97efcfaf79447488b77ddcb32d41f593a579e20d`, 119 testes Node, Chromium, 10 varreduras axe sem violações detectadas e 10 testes de reflow aprovados; Vercel sem preview READY para esse SHA e com `build-rate-limit`. QA humano real (leitor de tela, zoom nativo, público Supabase) ainda pendente.

**Critérios desta etapa:** CI obrigatório passar novamente no HEAD da V7.5, incluindo o `next build` agora sem dispensas; não considerar a etapa pronta sem comprovação. Não há alteração de dados jornalísticos, banco, logotipo, COMUN, DNS ou produção.

---

## Sprint V7.6 — distinguir catálogo vazio de indisponibilidade

**Problema confirmado por auditoria de código:** `getPublishedDossiers()` retornava o mesmo fallback para três situações distintas: falta de configuração Supabase, falha de rede/RLS/consulta e retorno genuinamente vazio. Na produção, o fallback demonstrativo é desligado; a página `/dossies` poderia afirmar que o catálogo estava em preparação quando apenas a consulta falhou.

**Mudança V7.6 na PR #27:** nova `getPublicDossierCatalogState()` com estados `available`, `not_configured`, `unavailable`; lista vazia válida permanece `available`. A API `getPublishedDossiers()` conserva o retorno anterior para as outras páginas; a rota Casos consome o estado completo, mostra mensagem informativa sobre falha/configuração e mantém as reportagens Git disponíveis. O aviso “dossiês em preparação” só aparece quando a consulta realmente foi bem-sucedida, vazia e não há reportagens Git. Nenhuma consulta exibe detalhes sensíveis do banco.

**Limitação de verificação externa:** conexões Supabase listadas não permitiram identificar com segurança o projeto do banco deste portal; nenhuma base de terceiros/adjacente foi consultada, nenhuma migração ou política RLS foi modificada. O código do repositório contém políticas e seeds históricos, que não constituem evidência de estado atual do banco. Validar o Supabase real continua pendente até identificar projeto e credenciais de escopo público.

**Validação exigida:** TypeScript, lint, build bloqueantes; Node tests com novo contrato de status; smoke HTTP de Casos em ambiente sem configuração; Chromium e axe; prévia Vercel para HEAD exato. Não mesclar #25/#26/#27 sem QA visual remoto e revisão de fontes.

---

## Sprint V7.7 — auditoria do Supabase de produção e catálogos honestos

**Diagnóstico confirmado em 28/10/2026 por leitura somente leitura de ambientes conectados:**
- O projeto Vercel `vrabandonadapwa` disponibiliza `NEXT_PUBLIC_SUPABASE_URL`, uma chave pública Supabase e `SUPABASE_SERVICE_ROLE_KEY` **apenas para `production`**, sem configuração equivalente para `preview`. Os valores secretos não foram exibidos ou replicados.
- A URL pública da produção identifica inequivocamente o projeto Supabase `ghehhhztsukhshdhotmu`, acessível pela conexão "vrabandonada site", embora o nome administrativo do projeto seja genérico.
- Consulta direta a `information_schema.tables`: em `public` existem somente `intake_submissions`, `admin_email_allowlist` e `universal_captures`, todos com RLS habilitado. Estão **ausentes** `archive_assets`, `archive_collections`, `place_hubs`, `investigation_dossiers`, `editorial_items` e demais tabelas da camada editorial esperada pelo código.
- Histórico `supabase_migrations.schema_migrations`: apenas `20261028003300 secure_intake_and_admin_allowlist` e `20261028003847 restrict_capture_truncate`. Os scripts editoriais `supabase/migrations/0003…0033` do Git NÃO devem ser tratados como implantados na produção. Ausência constatada não implica permissão para aplicar migrations.
- **Risco de uma implantação cega:** migrações históricas contêm dados demonstrativos (seeds) e algumas políticas `to authenticated using (true)` sem segregação granular. Exigir revisão de RLS, plano de backup, migrações mínimas sem conteúdo demonstrativo, teste em staging e rollback antes de tocar produção. Recebimento de denúncias e identidade de autores/fonte são dados sensíveis; não fazer consultas a essas tabelas neste fluxo.

**Correções de produto incluídas na PR #27:**
- `getPublicArchiveCatalogState()` e `getPublicPlaceCatalogState()`: retorno com `available`, `not_configured`, `unavailable`; preservam os métodos anteriores que retornam arrays para compatibilidade.
- Acervo apresenta aviso discreto de indisponibilidade sem afirmar que não existem documentos; conserva reportagens Git e fontes verificadas. Os filtros operam sobre o mesmo conjunto obtido da primeira consulta, evitando o acesso duplicado a `archive_assets`.
- Bairros mantém o índice territorial extraído das reportagens aprovadas e não confunde ausência de hubs no banco com ausência factual de cobertura.
- Estados vazios de "em preparação" somente quando a consulta tiver sido realmente bem-sucedida; sem criar material inventado.
- Testes `tests/public-catalog-availability-v7.test.mjs` verificam os contratos e as rotas. Nenhuma mudança em migrations, RLS, env, credenciais, domínio ou conteúdo jornalístico.

**Critérios de aceite antes de qualquer merge:** 100% de Node tests, TS, lint, build, smoke HTTP, Chromium, axe/reflow no SHA exato e Preview Vercel correspondente; revisão de legibilidade das mensagens novas. A implementação das tabelas editoriais deve ser um projeto separado e auditado, e não uma aplicação irrefletida do histórico do repositório.

---

## Sprint V8 — projeto de implantação editorial segura no Supabase

**Investigação operacional (28/10/2026):** confirmou-se pelo ambiente de produção da Vercel e pela conexão `vrabandonada site` qual é o projeto Supabase efetivamente usado. Preflight read-only `scripts/sql/portal-editorial-readiness.sql` foi **executado com sucesso no projeto real**, retornando nove tabelas editoriais ausentes: cinco de Casos/Bairros na fase 1 e quatro de Acervo e suas dependências na fase 2. Isso explica a ausência estrutural da camada Supabase nas interfaces, sem invalidar reportagens Git verificadas.

**Entrega V8, SOMENTE código/documentação, na PR #27:**
1. `scripts/sql/portal-editorial-readiness.sql`: inventário portátil, somente `SELECT`, com presença de tabela, RLS, concessão de `SELECT/INSERT` ao anon e existência de política de leitura. Não consulta nenhuma linha de denunciante/contato.
2. `docs/PLANO_IMPLANTACAO_EDITORIAL_SUPABASE.md`: plano de dependências e rollout por fases (Casos/Bairros → Acervo), staging isolado, política de permissões mínimas, revisão de dados/direitos, sem seeds demonstrativos, checkpoints de backup/rollback e autorização explícita antes de implantar.
3. `tests/editorial-db-rollout-v8.test.mjs`: contratos que garantem SQL somente leitura, inventário de nove tabelas e que os bloqueios conhecidos continuem documentados.
4. **Nenhuma DDL executada**, nenhuma migração aplicada, nenhuma cópia de dados pessoais, nenhum `service_role` exposto ou movido para previews.

**Riscos adicionais verificados no Supabase Security Advisor:** alerta para função administrativa `SECURITY DEFINER` executável por anon/authenticated, objetos descobríveis no GraphQL e proteção de senha vazada desabilitada. A presença de RLS não elimina esses avisos; não revogar `EXECUTE` sem estudar dependências de autorização. O projeto público atual mantém as tabelas de denúncia/captura separadas do esquema editorial proposto.

**Ponto de decisão arquitetural:** os vínculos entre dossiê/bairro/documento e reportagem têm de usar `link_type + link_key` revisados, com permalink de `content/materias/*.json`, sem duplicação de matéria; o Git mantém a publicação jornalística canônica. Resolver no novo schema o descompasso entre os estados de dossiê de `0011` e `0012`; não executar as migrações antigas em cadeia.

**Próximo após CI:** abrir uma PR separada de implantação **no momento em que existir staging e as PRs de UX estiverem integradas**, gerar migrações novas pelo CLI, validar autorização real `anon`/usuário comum/editor e só depois submeter a promoção à produção para aprovação explícita. Nenhuma implantação até então.

---

## Sprint V8.1 — ponte de leitura para reportagens Git

**Implementado na PR #27, sem dados de banco:** leitura tipada de `materia` separada de `editorial` em Casos e Bairros. O permalink canônico é `/materias/<slug>` e só se materializa se `getMaterias()` devolver publicação Git com `status='published'` e `reviewed=true`; slug órfão, rascunho ou inválido não ganha URL pública no resolvedor. As páginas de dossiê e bairro recebem o mesmo catálogo, sem cópias da matéria nem vínculos inferidos. A seção de leituras territoriais apresenta reportagens e pautas sem confundir as categorias. O editor ainda não oferece a opção e as ações do servidor bloqueiam gravação de `materia` até o esquema e a RLS serem validados em staging.

**Contrato novo:** `tests/materia-links-v8.test.mjs`, com tipos, rotas, revisão editorial, bloqueio de escrita e slugs aprovados. Ainda faltam CI, TypeScript, build, Chromium, axe/reflow e Preview do mesmo SHA. Não integrar em produção nem migrar o banco a partir deste commit.

---

## Sprint V8.2 — núcleo editorial isolado, RLS real em PostgreSQL efêmero

**PR de staging empilhada:** [#31](https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/pull/31) baseada na PR #27, sem rebase sobre main e sem aplicação em produção. **Nenhuma DDL foi executada no Supabase do usuário.**

**Pacote entregue:**
- `scripts/sql/staging/v82_phase1_editorial_core.sql`: blueprint transacional com exatamente cinco tabelas, sem seeds e fora de `supabase/migrations`. O script exige confirmação explícita de sessão de staging e falha quando a confirmação está ausente; isso não substitui identificar projeto e responsável.
- `scripts/sql/staging/v82_verify_rls.sql`: fixtures sintéticas transacionais, verificação real de visibilidade e recusa de escrita para `anon` e `authenticated`, descarte integral dos dados via `ROLLBACK`.
- `.github/workflows/validate-v82-staging-db.yml`: PostgreSQL 17 efêmero, criação de papéis públicos de teste, execução negativa do guard, aplicação do schema, testes RLS e verificação de ausência de fixtures residuais.
- `tests/staging-editorial-schema-v82.test.mjs`: seis contratos estáticos de segurança da proposta. `docs/QA_STAGING_EDITORIAL_V82.md` contém checklist de homologação em Supabase staging.

**Resultado do banco efêmero:** [workflow de RLS](https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/actions/runs/40980991718) aprovado no primeiro commit da PR; PostgreSQL aplicou cinco tabelas e cinco políticas, testou guard sem autorização, papéis `anon` e `authenticated`, negação de escrita e rollback. O workflow do Next.js/Chromium será revalidado no HEAD após qualquer alteração documental.

**Sem liberar escrita editorial:** RLS concede apenas leitura a visitantes e usuários autenticados, restrita a pais públicos; nenhum usuário autenticado pode escrever só por estar logado. Atualizações requerem `published=true` e pai visível. `link_type=materia` é tipo distinto de pauta; existência/revisão do slug continua sendo validada pela aplicação.

**Próximo bloqueio de produção:** criar staging Supabase realmente isolado, configurar papéis e políticas de autorização editorial com testes, auditar exposição de `created_by`/`updated_by`, garantir grants da Data API, testar migração versionada gerada pelo CLI e revisar com responsável antes de promover. O roadmap V8 de acervo mantém quatro tabelas em fase separada. **Não executar as migrações 0003–0033 em bloco, nem integrar #31 à main sem revisão da cadeia #25 → #26 → #27.**

---

## Sprint V8.3 — monitoramento diário das jornadas públicas

**Após a integração da PR #33:** o GitHub já auditava diariamente homepage, robots, sitemap, RSS e até cinco matérias. A nova etapa amplia a mesma rotina (sem criar tarefa duplicada) para `/noticias`, `/materias`, `/dossies`, `/acervo` e `/territorios`, além de comparar publicações aprovadas no Git com índice de matérias, sitemap, RSS, referências do Acervo, investigações de Casos e bairros expressamente marcados como foco territorial. O monitor não infere relação por menções contextuais e não consulta denúncias, arquivos privados ou fontes externas. O fluxo de alertas deduplicados por Issues existente é preservado.

**Contrato:** `tests/public-site-journeys.test.mjs` cobre cenários simulados de sucesso, falha HTTP, reportagem/investigação desaparecida e fontes/permalinks ausentes. O monitor precisa de CI da nova branch antes do merge; uma auditoria agendada com sucesso indica apenas disponibilidade/coerência do HTML público naquele momento, não certifica indexação, acessibilidade em dispositivo real nem disponibilidade de documentos externos.

---

## Sprint V8.4 — autorização editorial na aplicação antes do staging

**Auditoria após integração #33/#34 e inspeção da PR #29:** as páginas internas de dossiês e bairros e suas Server Actions verificavam `auth.getUser()`, mas não confirmavam autorização administrativa, ao contrário da rotina de captura que já usava `isAdminEmailAllowed`. A página de novo território sequer fazia sua própria checagem. Login não é autorização editorial.

**Implementação proposta na branch V8.4:** criar guarda única `requireEditorialAdmin()` com `server-only`, `supabase.auth.getUser()`, verificação de e-mail na allowlist existente e redirecionamento na falha; aplicá-la antes de qualquer acesso interno ou escrita em dez superfícies (8 páginas e 2 Server Actions). O componente de novo território passa a ser assíncrono para exigir a guarda. Testes de contrato impedem regressões nos pontos de entrada.

**Limites:** a guarda de aplicação é defesa adicional, **não substitui RLS**. O blueprint do banco continua somente leitura para `anon` e `authenticated`, sem cadastros `materia` habilitados. A PR #29 permanece histórica e não deve ser mesclada diretamente; a seleção de reportagens no editor só será proposta em nova etapa depois de staging dedicado, autorização baseada em identidade e RLS real. Não foram consultadas ou modificadas denúncias, permissões do banco, dados de produção nem a allowlist original.

---

## V8.5 — proteção de autoria interna na Data API

**Achado:** as projeções públicas de dossiês, atualizações e bairros requisitavam colunas `created_by`/`updated_by` que podem conter e-mails de editores. O blueprint staging V8.2 também concedia `SELECT` da tabela inteira, permitindo que esses campos fossem solicitados diretamente pela API caso o esquema fosse instalado. **Isso é risco potencial, não evidência de que um vazamento ocorreu em produção.**

**Mudança:** separar projeções públicas/internas no código e, no blueprint staging não aplicado, substituir grants gerais por SELECT por coluna para cinco tabelas; testar com `has_column_privilege` em PostgreSQL temporário como `anon` e `authenticated`. RLS e bloqueio de escrita permanecem. **Sem mudanças no Supabase real;** nem editores têm autorizações novas de gravação.

**Validação pendente:** CI Node, TypeScript/lint/build, PostgreSQL RLS e Chromium no commit exato; staging Supabase dedicado, permissões por identidade e revisão de campos da API antes de habilitar curadoria da PR #29.

---

## Auditoria estratégica de SEO, experiência e plataforma — 30/10/2026

**Escopo e evidência:** revisão documental do código `main` no commit `7830e42ec1b224346354e5206d59b23c6fff14d2`, roadmap e lista de PRs; pesquisa em documentação primária. Não é auditoria visual, Lighthouse, medição de tráfego ou prova HTTP. A ferramenta de pesquisa não conseguiu abrir os domínios; isso não prova indisponibilidade. O SHA do deploy ativo deve ser confirmado na Vercel.

### O que já existe no código

- Next.js 15, GitHub e Vercel; três arquivos de matérias no repositório. O arquivo da Rua 33 marca `published` e `reviewed`, e registra fontes, limites e contraditório ainda não solicitado. Estado em Git não prova publicação no domínio.
- Template de matéria fornece título, descrição, canonical, Open Graph, Article/NewsArticle, datas, fontes, correções e links relacionados. O sitemap contempla matérias, pautas, dossiês, territórios e Instagram; robots restringe área interna, API, auth e offline. Não confirma indexação ou conteúdo servido.
- `lib/site-url.ts` normaliza hosts .com.br para `www.vrabandonada.online`. O roadmap anterior relata .com.br misconfigured: checar novamente DNS, HTTPS, 301/308 e caminho/query antes de decidir mudança. Não inverter canonical por suposição.
- PR #37 propõe papéis e RLS de staging; #29 é histórica e depende de base antiga; #7 trata intake/storage; #6 contém rascunho antigo. Nenhuma dessas PRs abertas equivale a recurso em produção. Revisar dependências, CI e divergências antes de qualquer integração.
- Diagnóstico V7.7/V8 anterior: tabelas editoriais ausentes no Supabase de produção à época da consulta. Revalidar antes de decisões; não aplicar migrations antigas em bloco ou expor documentos/identidades.

### Norte de produto

Uma redação local investigativa em que a pessoa encontra uma notícia verificável, entende o histórico, acessa documentos e acompanha mudanças. Manter COMUN como plataforma distinta para participação comunitária; ligar ao COMUN com contexto claro. Interface editorial documental, identidade VR e fotografias reais licenciadas/creditadas, sem adornos artificiais. Priorizar clareza, leitura móvel e prestação de contas.

### Decisões e fila priorizada

**P0 — linha de base e confiança**
1. [ ] Confirmar Vercel: deployment ativo, SHA, domínio e aliases; testar os dois hosts .online por HTTPS, cadeia 301/308, caminho, query, canonical, robots, sitemap, RSS e páginas de matérias. Evidenciar data e resposta; resolver DNS somente com estado confirmado.
2. [ ] Medir Search Console por propriedade e data: cobertura, URLs inspecionadas, sitemap, consultas, cliques e impressões. Não presumir indexação. Levantar baseline de Web Vitals reais, dispositivo móvel e desktop; alvo p75 LCP ≤2,5s, INP ≤200ms e CLS ≤0,1. Lighthouse é laboratório e TBT não é INP real.
3. [ ] Confirmar publicação e integridade das três matérias reais, situação de fontes/contraditório, imagem e atualização. Testar links internos e resultados de compartilhamento WhatsApp; sem publicar rascunhos automaticamente.
4. [ ] Reavaliar segurança do envio, anexos, privacidade, autorização e integrações antes de receber material sensível. Confirmar PR #7 e permissões reais; não presumir que RLS ou interface isoladamente protegem objetos.

**P1 — descoberta e produto**
5. [ ] Jornada mobile: Últimas → matéria → fonte → caso/bairro → próxima leitura, com Acervo ↔ Bairros por vínculos editoriais expressos. Evitar criar relação factual pela simples menção de um bairro.
6. [ ] Inspecionar home, notícia, investigação, Acervo, Bairros, Busca e Envie em 320/360/390/430px e desktop; zoom 200%, teclado, leitor de tela e contraste WCAG 2.2 AA. Registrar capturas e corrigir problemas por impacto; testes automáticos não substituem avaliação humana.
7. [ ] Fortalecer notícias e dossiês: fotos documentais com direitos/créditos e texto alternativo, contexto claro, datas corretas, autoria verificável, método, correções, contato e respostas das partes. Separar notícia, análise e opinião. Nas investigações, distinguir o comprovado, o que falta e quando houve atualização.
8. [ ] Validar metadata efetivamente entregue, URLs canônicas únicas, indexabilidade, links HTML, títulos, imagens OG, sitemap com lastmod verdadeiro e RSS. Avaliar News sitemap separado apenas para notícias recentes e operação que mantenha janela de dois dias; não é pré-requisito para aparecer no Google Notícias. Structured data ajuda compreensão, não garante resultados.
9. [ ] Testar Search Console e relatórios agregados com privacidade; métricas: conteúdos originais, tempo aprovação→URL, índice de URLs válidas, cliques orgânicos, retorno por caso, falhas e recuperação. Não rastrear dados sensíveis ou anexar informações de denunciantes a analytics.

**P2 — fluxo editorial e distribuição**
10. [ ] Fluxo único: apuração → rascunho → revisão de evidências e contraditório → aprovação editorial → publicação Git → verificação de produção → distribuição. Permalink e histórico preservados; edição sem nova URL. Preparar piloto em uma matéria real com capa autorizada, fotos e links.
11. [ ] Prototipar Decap CMS em ambiente isolado sobre conteúdo Git: validar autenticação, revisão via PR, schema JSON, prévia e imagens. Decap pode simplificar edição, mas requer adaptação de campos e segurança de acesso. Não instalar até piloto e avaliação de custo operacional.
12. [ ] Comparar Ghost (newsletter/membros integrados, nova operação/migração), WordPress (ecossistema amplo, manutenção de plugins e segurança) e Next.js atual + editor Git (preserva links e produto, exige desenvolvimento). Avaliar TCO, backup/exportação, permissões, design, fluxo e acesso editorial; sem migrar antes de teste de publicação e plano de redirects.
13. [ ] Planejar newsletter opt-in, RSS e distribuição social com medição proporcional e possibilidade de descadastro; considerar custos, consentimento e capacidade operacional antes de contratar plataforma.

### Fontes da pesquisa

- Google: Article schema https://developers.google.com/search/docs/appearance/structured-data/article ; AI features https://developers.google.com/search/docs/appearance/ai-features ; notícias e transparência https://developers.google.com/search/blog/2021/06/google-news-sources ; sitemap de notícias https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap .
- Web Vitals: https://web.dev/articles/vitals ; WCAG 2.2: https://www.w3.org/TR/WCAG22/ .
- Decap: https://decapcms.org/docs/intro/ e https://decapcms.org/docs/editorial-workflows/ ; Ghost: https://ghost.org/help/manual/ .

**Regra sobre SEO de IA:** Google informa que fundamentos de rastreabilidade e conteúdo útil se aplicam a seus recursos de IA, sem arquivo `llms.txt` ou schema especial obrigatório. Não prometer posição, indexação ou presença em respostas de IA.

**Status desta rodada:** pesquisa e atualização propostas em PR documental; sem modificações no produto, banco, DNS, métricas ou produção. Auditoria visual, desempenho, dados de campo, Search Console e domínio ainda pendentes. Critério de encerramento: resultado observado, fontes, data, risco e responsável para cada item, sem confundir código, preview e produção.


### Correção de domínio — informação do proprietário, 30/10/2026

O proprietário informa que perdeu `vrabandonada.com.br` por falta de renovação. O domínio disponível para o projeto é **vrabandonada.online**. Descartar propostas anteriores de recuperar ou migrar para `.com.br`; não presumir controle sobre ele nem redirecionamento funcional. Manter `www.vrabandonada.online` como canonical previsto no código, sujeito a confirmação HTTP/DNS e configuração real do `.online` com e sem `www`. Rever referências históricas ao `.com.br` à luz desta correção. Não alterar DNS ou código de domínio sem verificar o comportamento efetivo do `.online`.


### Verificação operacional — 30/10/2026

- Vercel: os aliases `www.vrabandonada.online` e `vrabandonada.online` apontam para o deployment de produção `dpl_FB8GM54BhAnW4KdrFh332WPAmLz1`, estado READY, commit `7830e42ec1b224346354e5206d59b23c6fff14d2`. A configuração de DNS de ambos retorna `misconfigured:false`; isto não é prova completa de HTTPS e navegação de todos os usuários.
- A Vercel não informa redirect para o apex, mas `middleware.ts` no commit de produção implementa 308 de `vrabandonada.online` para `www.vrabandonada.online`, preservando caminho e query. Confirmar com uma requisição real sem seguir redirecionamento. O canonical www está coerente com o código.
- Os dois nomes .com.br ainda constam na configuração Vercel, mas o proprietário informa que perdeu o domínio. A presença de aliases históricos/verificados NÃO demonstra posse ou tráfego atual. Inventariar referências antes de propor remoção; não depender dele, nem fazer alteração DNS.
- Em 29/10, a auditoria agendada detectou HTTP 404 na matéria da explosão e abriu [issue #30](https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/issues/30). Um [teste HTTP posterior em 29/10 às 22h07 de Brasília](https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/actions/runs/40983892662) passou com 12 URLs, incluindo as três matérias, home, robots, sitemap, RSS e cinco jornadas. Isso evidencia recuperação naquele momento, não garante resposta hoje. A issue #30 continua aberta; não fechá-la sem nova verificação independente.
- **Achado P1 de observabilidade:** o workflow agendado captura falha do script para criar issue e conclui com sucesso se o tratamento do alerta funcionou. Logo, bolinha verde não prova que a auditoria passou: consultar o log e a issue. Ajustar o workflow para registrar falha após executar o tratamento de alertas, sem perder deduplicação, e testar sucesso e falha. Verificar também janela entre publicação no Git e deploy, que pode causar alerta temporário; não afirmar causa do 404 histórico sem prova.
- **Pendente:** HTTPS/308 real, teste visual e acessibilidade em dispositivos, Search Console e métricas de campo. Estes resultados não substituem teste ao vivo nem medição de indexação.
