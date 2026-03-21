# Estado da Nação 072

## Problema identificado
- o fluxo interno estava gerando o link com base localhost em produção
- isso fazia o auth abrir o callback no ambiente errado

## Correção aplicada
- criei `getSiteUrl()` para resolver a base pública a partir de `NEXT_PUBLIC_SITE_URL` ou `VERCEL_URL`
- passei o layout e a ação de acesso a usar essa base única
- mantive a allowlist e a geração direta do link no servidor

## O que o usuário deve ver agora
- o link interno precisa abrir no domínio público do projeto
- o callback precisa seguir para `/interno/entrada`
- o painel interno precisa abrir sem cair em `localhost:3000`

## O que ainda depende de ambiente
- `SUPABASE_SERVICE_ROLE_KEY` em produção
- `NEXT_PUBLIC_SITE_URL` apontando para o domínio público
- `Auth -> URL Configuration` do Supabase com o callback correto

## Próximo passo sugerido
- redeploy da Vercel após confirmar as variáveis
- novo teste com o e-mail autorizado
