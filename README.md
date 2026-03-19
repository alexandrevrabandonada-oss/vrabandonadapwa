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
