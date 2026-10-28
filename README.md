# VR Abandonada

Casa digital do **VR Abandonada**: uma landing page com base de PWA para memória, denúncia, investigação e organização popular sobre Volta Redonda.

## O que este projeto é

- Uma base editorial e de produto para um projeto popular, combativo e enraizado no território.
- Não é um site institucional comum.
- A fundação já vem preparada para App Router, Vercel, PWA e integração com Supabase.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

- `npm run dev` - desenvolvimento
- `npm run build` - build de produção
- `npm run start` - iniciar build de produção
- `npm run lint` - análise estática
- `npm run typecheck` - checagem de tipos

## Estrutura principal

- `app/` - rotas, layout global, manifest e ícones do PWA
- `components/` - peças de interface reutilizáveis
- `lib/` - dados do site, domínio de intake e base para Supabase
- `supabase/migrations/` - migrations do banco
- `reports/` - relatórios de estado do projeto

## Acesso interno

- A entrada protegida fica em `/interno/entrar`.
- O e-mail precisa existir na tabela `public.admin_email_allowlist` no Supabase.
- Depois do login, a fila interna fica em `/interno/intake`.

## Migrations

1. Aplicar `supabase/migrations/0001_create_intake_submissions.sql`.
2. Aplicar `supabase/migrations/0002_intake_security_and_triage.sql`.
3. Inserir o seu e-mail em `public.admin_email_allowlist`.

## Próximos passos

1. Confirmar a migration e testar um envio real de ponta a ponta.
2. Refinar a triagem com observações e estados editoriais mais ricos.
3. Adicionar acervo real de memória da cidade.
4. Montar a primeira trilha de publicação: pauta, apuração, publicação e atualização.

## Preparação e publicação editorial segura

O portal só mostra arquivos de `content/materias/*.json` que passam pela validação e têm aprovação. O fluxo em **duas etapas** permite receber conteúdo do Instagram sem expor rascunhos:

1. **Importar/gerar rascunhos localmente** a partir de `public/data/instagram-posts.json` (se houver posts reais importados pela API Meta): `npm run editorial:prepare`. Também aceita uma publicação JSON que você forneceu: `npm run editorial:prepare -- --file caminho/publicacao.json`.
2. **Revisar o arquivo** em `editorial/drafts/<slug>.json`: confirmar título, subtítulo, precisão, contexto, fontes, datas, resposta dos envolvidos e segurança de fontes. Preencher `review.factChecked`, `sourcesChecked`, `rightOfReplyChecked`, `privacyChecked`, `approved` como `true`; identificar `approvedBy` e `approvedAt`. Esses campos registram a decisão editorial humana e não substituem a conferência real.
3. **Verificar sem escrever**: `npm run editorial:release -- --slug <slug>`. Se aprovado, `npm run editorial:release -- --slug <slug> --write` grava um novo arquivo em `content/materias/` (não sobrescreve existentes).
4. **Revisar o diff e abrir PR no GitHub**. Somente após a aprovação e merge na `main` a Vercel poderá publicar o artigo. O sitemap, a página `/materias/<slug>`, metadados, Open Graph e Article JSON-LD aproveitam o pipeline existente.

**Importante:** rascunhos locais são ignorados pelo Git. Não versionar relatos confidenciais, dados pessoais de fontes ou provas não autorizadas. O arquivo de origem `public/data/instagram-posts.json` está vazio enquanto não for conectado/importado um feed real. Nunca inventar manchetes, fontes, falas ou datas. O importador preserva a legenda original no campo `originalInstagram.caption` do rascunho e usa a data de aprovação para a publicação do SITE.

O script não conecta ou autentica o Instagram: para sincronização via Graph API, configure a conta Meta e os secrets com permissões adequadas nos locais seguros da plataforma. Não cole tokens no chat. A integração direta via ChatGPT/Codex pode criar uma PR após a aprovação expressa da matéria; não há autopublicação de denúncias.

## Importação automática do Instagram com revisão (proposta)

Há um agendador em `.github/workflows/import-instagram.yml` que verifica novos posts a cada quatro horas e aceita execução manual em **GitHub → Actions → Importar Instagram para revisão editorial → Run workflow**.

**Importante:** a rotina anterior fazia `git push` diretamente para `main`. A versão nova foi desenhada para criar **uma PR em modo rascunho** com as legendas e capas públicas, sem publicar automaticamente. Antes de integrar a alteração ao site, um editor inspeciona o diff e decide a aprovação. As legendas importadas não equivalem a reportagens verificadas.

Para conectar a conta, configure no **GitHub → Settings → Secrets and variables → Actions**:

- Secret `INSTAGRAM_ACCESS_TOKEN`: token válido da conta profissional gerado e autorizado na plataforma Meta (não enviar pelo chat).
- Variáveis opcionais `INSTAGRAM_USER_ID` (padrão `me`), `INSTAGRAM_GRAPH_HOST` (padrão `graph.instagram.com` para login Instagram) e `INSTAGRAM_GRAPH_VERSION` (padrão previsto no importador, sujeito a revisão conforme a API vigente).
- Em **Settings → Actions → General**, habilitar permissão para GitHub Actions criar pull requests e conferir autorização do `GITHUB_TOKEN`. Se a conta/org impedir, o workflow falhará na abertura da PR sem inserir dados na `main`.

O script não acessa informações privadas dos seguidores; apenas posts de conta autorizada. Sem secret, a rotina não executa a importação e informa que a conexão falta. Antes de publicar a PR, valide `npm run instagram:validate` e `node --test tests/instagram-*.test.mjs`. Notar que PRs abertas com o token padrão do GitHub Actions não acionam automaticamente outras workflows; marcar PR como "Ready for review" após inspecionar e executar os checks obrigatórios. Consulte o log da própria rotina importadora para validar os registros.

As novas matérias continuam exigindo **aprovação editorial separada** pelo fluxo `editorial:prepare` → `editorial:release`. O Instagram já publicado e o texto jornalístico verificado são camadas diferentes.
