# Sprint 0 — confiança pública e operação editorial

**Projeto:** VR Abandonada V2 — 27/10/2026

## Alterações executadas em branch de revisão

- Guard para que fixtures e dados demonstrativos de módulos públicos nunca sejam publicados em ambiente de produção, mesmo quando a base estiver vazia ou indisponível.
- O guard também alcança coleções de arquivo e marcos de cronologia, além dos módulos básicos.
- Reforço do servidor para Captura Universal: ação de publicar e enriquecer requer sessão de editor autorizada; formulário exige confirmação explícita de revisão.
- Condição anti-duplo-clique na mudança de status da captura, mantendo possibilidade de devolver à inbox caso falhe o insert.
- Busca passa a incluir matérias originais do conteúdo Git; sitemap inclui URLs reais de pautas, investigações e territórios; matérias reais ganharão destaque antes das seções institucionais da homepage.
- Documentação de publicação corrigida para o domínio canônico atualmente ativo `www.vrabandonada.online`.

## Importante antes de produção

1. **Não alegar que o fluxo é transacional**: a publicação ainda depende de 2 escritas no Supabase e precisa de uma RPC transacional em próxima sprint.
2. Conferir o papel de editor na política Supabase, não depender apenas do fallback estático de e-mail legado. Planejar migração para tabela de permissões e políticas RLS verificadas.
3. Conferir que a homepage continua útil quando não há matérias reais, porque os mocks desaparecerão corretamente.
4. Rodar testes, compilação, preview e abrir login, publicação, busca e sitemap. Sem teste E2E, não promover automaticamente.
5. Corrigir também arquivos `mock` ainda referenciados em componentes públicos fora das queries auditadas, se identificados.
6. Nenhuma reportagem real foi publicada sem checagem editorial e aprovação explícita.

## Revisão adicional de segurança
- Verificado nas migrações 0031/0032 que `archive-assets` e `universal_captures` foram criados com `public=true` e leitura pública. Logo, `public_visibility=false` em uma linha não torna o arquivo privado.
- Na branch, anexos da Captura Universal e arquivamento rápido de arquivos foram suspensos até migração a um bucket realmente privado, com assinatura de URLs e teste de RLS.
- O envio de texto continua, com orientação para não incluir dados sensíveis. Arquivos já enviados permanecem passíveis de acesso direto; é necessária auditoria de objetos existentes e remoção/migração conforme autorização.
- Publicação rápida recebe trava `VR_ENABLE_FAST_PUBLISH` desabilitada por padrão, inclusive no servidor. Quando desligada, encaminhar a nota para enriquecimento/edição.
- Categorias temáticas de memória continuam visíveis como navegação, mas não geram falsos itens publicados.
- Não ativar `VR_ENABLE_FAST_PUBLISH` até corrigir atomicidade do banco e comprovar as políticas do Supabase em uso.
