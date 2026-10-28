# Plano de implantação editorial segura — VR Abandonada

**Estado:** especificação V1 para revisão; **não é uma migração executada nem autorização para alterar produção**. Auditoria de referência: 28/10/2026, projeto Supabase identificado pela URL de produção do Vercel. Documento subordinado ao roadmap canônico `docs/ROADMAP_PORTAL_VR_ABANDONADA.md`.

## Decisão de produto

A matéria aprovada em `content/materias/*.json` continua sendo a **publicação canônica**: título, texto, fontes, revisão, correções e URL `/materias/<slug>`. O Supabase passa a armazenar **organização editorial curada**, não uma segunda cópia da notícia. As tabelas devem fornecer vínculos explícitos com artigos Git por `slug` e classificação revisada por humano — jamais criar relação por semelhança de bairro/título.

- **Casos**: dossiê como investigação continuada com pergunta, status, ligações e atualizações publicadas.
- **Bairros**: páginas territoriais curadas e links de contexto com papéis claros, junto do índice automático das matérias Git.
- **Acervo**: documentos com proveniência, direitos, visibilidade, coleção e vínculos editoriais; arquivo original privado por padrão, referência pública apenas após revisão.
- **Intake**: denúncias e dados de contato ficam segregados. Nunca reproduzir relato confidencial em campos de leitura pública.

## Evidência e escopo

A consulta read-only versionada em `scripts/sql/portal-editorial-readiness.sql` foi executada **com sucesso** no projeto Supabase efetivamente configurado em produção, sem consultar linhas de dados pessoais. Encontrou **9/9 tabelas editoriais faltantes**:

| Fase | Tabelas exigidas pelos consumidores atuais | Estado em produção |
| --- | --- | --- |
| 1, Casos | `investigation_dossiers`, `investigation_dossier_links`, `investigation_dossier_updates` | Ausentes |
| 1, Bairros | `place_hubs`, `place_hub_links` | Ausentes |
| 2, Acervo | `archive_assets`, `archive_collections` | Ausentes |
| 2, dependências do Acervo | `editorial_items`, `memory_items` | Ausentes |

**IMPORTANTE:** `archive_assets` na migração legada `0009` possui chaves estrangeiras para `editorial_items` e `memory_items`. Não implantar a tabela isoladamente sem rever as dependências e o modelo de armazenamento. As variáveis Supabase no Vercel estão configuradas para **production**, não para **preview**; um preview sem elas não demonstra a funcionalidade do banco.

O diagnóstico do banco de produção também registrou apenas `intake_submissions`, `admin_email_allowlist` e `universal_captures` em `public`; as três têm RLS habilitada. Isso não significa que todas as políticas são seguras: o advisor sinalizou função `SECURITY DEFINER` publicamente executável, exposição de objetos no GraphQL e configuração de proteção de senhas. Essas recomendações exigem análise própria, especialmente porque remover `EXECUTE` da função administrativa pode quebrar políticas existentes. **Não alterar a função ou as políticas de intake sem teste e rollback.**

## Portões para a implantação — ordem obrigatória

### 0. Preparação e isolamento

1. Abrir PR separada de **implantação de esquema**, baseada na branch efetivamente integrada depois das PRs de UI #25 → #26 → #27. Não misturar o rollout do banco com alterações de navegação.
2. Preparar ambiente Supabase de staging ou ramo de banco de testes, separado do projeto real e sem copiar denúncias/contatos de produção. Registrar snapshot somente de **esquema**, sem linhas sensíveis; planejar backup e rollback com responsável.
3. Gerar novas migrações através de `supabase migration new <nome>` na instalação apropriada do CLI e confirmar a numeração, sem criar nomes manualmente. **Não executar as migrações 0003–0033 em bloco.**
4. Proibir `INSERT`/seeds demonstrativos nas migrações DDL iniciais. Conteúdo só entra em etapa editorial separada, com fontes e revisão explícita.

### 1. Núcleo de Casos e Bairros (cinco tabelas)

Implantar em staging as cinco tabelas da fase 1, com campos e `SELECT` alinhados a `lib/dossiers/queries.ts` e `lib/territories/queries.ts`. Usar `id` estável e `slug` único. No lançamento, **zero linhas** por padrão.

Invariantes:
- `investigation_dossiers.status` admite os estados atuais da aplicação `draft`, `in_progress`, `monitoring`, `concluded`, `archived`. A versão legada `0011` aceitava `published`, que foi substituída pela `0012`; não copiar `0011` isolada.
- Publicar somente com `public_visibility=true` e `status <> 'draft'`, com política pública `SELECT` explícita. As consultas devem continuar filtrando da mesma forma.
- Links e atualizações públicas exigem **pai público**. Para atualizações, exigir `published=true`; não permitir que chaves de referência exponham pistas não revisadas. O vínculo `link_type/link_key` com reportagem do Git só será criado depois de confirmar o permalink.
- Campos como `created_by`, `updated_by`, `timeline_note`, `body` e `lead_question` precisam de revisão de privacidade: metadata pública só quando intencional e segura. Nenhum contato de denunciante nas tabelas públicas.
- `anon` e `authenticated` recebem somente privilégios necessários; **jamais** políticas `FOR ALL USING (true)`, `WITH CHECK (true)`, ou `auth.role() = 'authenticated'` como única autorização administrativa. Escrita exige mecanismo de autorização atual com teste de usuário não autorizado, e RLS com `USING` e `WITH CHECK`.
- Administrar por identidade editorial validada; não presumir que todo usuário autenticado é editor. Funções `SECURITY DEFINER` devem ser auditadas e com execução restrita ao necessário.

### 2. Acervo e dependências (quatro tabelas)

Após a fase 1, habilitar separadamente `editorial_items`, `memory_items`, `archive_collections` e `archive_assets` com tipos compatíveis e restrições coerentes. **O Git continua canônico** para reportagens novas: não migrar artigo para `editorial_items` sem uma regra concreta de atribuição e de URL. Avaliar se `editorial_items` e `memory_items` são apenas tabelas legadas de compatibilidade ou se o novo desenho requer FKs alternativas.

Requisitos de segurança adicionais:
- `memory_items` só pode ser lida publicamente quando `published=true AND editorial_status='published'`; a migração legada `0033` possui política pública `using (true)` e não serve como modelo seguro.
- `archive_assets.public_visibility` inicia `false`; `file_url`, `thumb_url`, `rights_note` e proveniência só aparecem após autorização da publicação. Não criar bucket público nem conceder acesso amplo ao Storage como efeito colateral da primeira migração.
- `archive_collections.public_visibility` inicia `false` no desenho seguro, diferentemente da migration antiga `0010`, em que o default era `true`.
- Documentos não devem ter campos de origem sensíveis expostos por `SELECT *`. Os consumidores usam colunas explícitas: preservar esse comportamento.
- A coleção e o documento publicados só podem apontar para links válidos, verificáveis e permitidos; documentos não publicados não entram na busca pública ou em feeds.

### 3. Validação de segurança e funcionalidade em staging

- Reexecutar `scripts/sql/portal-editorial-readiness.sql`: nove tabelas presentes, RLS habilitada, grants mínimos, políticas de leitura intencionais.
- Executar testes de RLS **como `anon`, `authenticated` não editor e editor autorizado**: `anon` pode ler apenas itens públicos; não pode criar/editar/excluir; usuário autenticado não editor não pode escrever; editor aprovado pode trabalhar em rascunho.
- Testar RLS em links filhos, atualizações e documentos não publicados; validar que o pai privado nunca vaza através dos filhos.
- Exercitar `/dossies`, `/territorios`, `/acervo`, pesquisa e permalinks com um conjunto de **dados sintéticos isolados em staging**. Remover esse conjunto ao término.
- Rodar Supabase Security Advisor e comparar com a auditoria baseline; nenhum novo warning crítico e justificativa registrada para os anteriores.
- Confirmar Data API grants **e** políticas RLS: os dois mecanismos são independentes. Verificar autorização no browser com chave pública, nunca usar `service_role` no cliente.
- Validar staging com o mesmo SHA de código, build, HTTP, Chromium, axe, reflow e revisão humana em aparelho físico. Planejar backup/restore e caminho de reversão antes de promover esquema.

### 4. Promoção controlada à produção

A promoção depende de **autorização explícita**, checklist assinada, migrações novas revisadas e plano de reversão. Operar em janela controlada. Confirmar o esquema após a aplicação via consulta read-only; publicar inicialmente **sem conteúdo**. Depois, cadastrar **um dossiê e um bairro reais** curados com links para a reportagem canônica, revisar visualmente e repetir os testes de segurança antes de liberar mais dados. Acervo documental fica numa etapa seguinte.

Não copiar variáveis de ambiente de produção para previews públicos; staging deve usar credenciais próprias e proteção de acesso adequada.

## Riscos que bloqueiam aplicar scripts históricos

1. `0010_archive_collections.sql`: contém fragmentos literais `\`r\`n` que exigem correção sintática, além de `authenticated ... using (true)` e visibilidade inicialmente pública.
2. `0011_investigation_dossiers.sql`, `0013_dossier_updates.sql` e `0019_place_hubs.sql`: incluem **seeds publicados** e políticas administrativas `authenticated using (true)` ou `auth.role() = 'authenticated'`.
3. `0012_investigation_dossiers_timeline.sql`: modifica status e dados demonstrativos de dossiês; não serve como patch isolado sobre banco vazio.
4. `0033_memory_schema_bootstrap.sql`: leitura pública ampla `using (true)` em memória, além de função `SECURITY DEFINER` e políticas de Storage que exigem auditoria.
5. `0028_admin_allowlist_seed.sql`: insere uma identidade concreta de administrador. Não executar sementes de autorização implícitas.

## Aceite desta especificação

**Entregue:** inventário da dependência de nove tabelas, verificação real read-only, avaliação de riscos legados e protocolo de rollout sem conteúdo fictício. **Não entregue:** novas migrações SQL, staging, RLS validada em novos objetos ou alteração de produção. Criar essas entregas somente dentro do rollout separado, com validação de migração e aprovação.
