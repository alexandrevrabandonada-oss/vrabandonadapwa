# VR Abandonada

Casa digital do **VR Abandonada**: uma landing page com base de PWA para memória, denúncia, investigação e organização popular sobre Volta Redonda.

## O que este projeto é

- Uma base editorial e de produto para um projeto popular, combativo e enraizado no território.
- Não é um site institucional comum.
- A fundação já vem preparada para App Router, Vercel, PWA e futura integração com Supabase.

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
- `lib/` - dados do site e base para Supabase
- `reports/` - relatório de estado do projeto

## Próximos passos

1. Conectar Supabase para envio e organização de pautas/denúncias.
2. Definir um fluxo seguro para recebimento de material sensível.
3. Evoluir a home com conteúdo real, fotos, acervo e editoria viva.
4. Criar observabilidade, moderação e trilha de publicação.
