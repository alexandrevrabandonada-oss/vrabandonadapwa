# Estado da Nação 071

## O que foi resolvido
- o acesso interno deixou de depender da entrega de e-mail do Supabase
- a allowlist continua existindo, mas agora o link é gerado direto no servidor
- o fluxo de login passa a abrir o link imediatamente quando o e-mail está autorizado

## Mudança principal
- `requestAdminAccessAction` trocou `signInWithOtp` por `auth.admin.generateLink`
- o e-mail autorizado segue validado antes da geração do link
- a página de entrada explica que o acesso abre direto quando o endereço está liberado

## Efeito prático
- não há mais espera pela caixa de entrada para o fluxo normal de acesso
- o painel interno volta a ser acessível por um caminho direto e previsível
- o restante do painel interno continua protegido pela sessão do Supabase

## Limites
- o e-mail precisa continuar na allowlist para o fluxo liberar o acesso
- se o projeto Supabase estiver com credenciais quebradas, o link ainda pode falhar
- o acesso continua dependendo da sessão autenticada que o link gera

## Próximo passo sugerido
- testar o acesso em produção com o e-mail autorizado
- se necessário, revisar também o template/roteamento de auth do Supabase no dashboard
- manter a allowlist enxuta para o painel interno
