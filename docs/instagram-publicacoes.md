# VR Abandonada — arquivo automático do Instagram

Complementa, sem competir, a infraestrutura de participação COMUN (https://comunsocial.online).

## Configurar a primeira sincronização

1. Verifique que o Instagram está como conta profissional, com permissões de leitura de mídia no app Meta.
2. Em GitHub Actions Secret, adicione INSTAGRAM_ACCESS_TOKEN. Nunca escreva credenciais em código, commits ou chat.
3. Em Actions Variables, defina INSTAGRAM_USER_ID (se necessário) e INSTAGRAM_GRAPH_HOST: graph.instagram.com ou graph.facebook.com, conforme o tipo de login autorizado.
4. Execute manualmente o workflow 'Importar publicações do Instagram'. Depois ocorrerão novas tentativas a cada quatro horas, sem garantia de horário exato.
5. O workflow salva as legendas originais, datas e capas locais no GitHub, gerando novo deploy via Vercel conectado ao repositório.
6. Tokens podem expirar; a renovação automática via OAuth ainda não foi implementada. Sem token, a sincronização não publica conteúdo fictício.

## SEO

- Páginas /publicacoes/[id] com URL permanente, title, description, canonical, tags e fonte original.
- Sitemap automático e robots.txt; RSS em /feed.xml; Schema.org SocialMediaPosting em páginas importadas.
- Google Search Console deve ser conectado ao domínio www.vrabandonada.com.br e sitemap.xml enviado.
- A indexação efetiva depende do Google: nenhum schema, sitemap ou importação garante posicionamento.
- A legenda é reproduzida fielmente; uma reportagem original precisa de apuração e revisão separadas antes de receber marcação NewsArticle.

## Segurança e limites

- Fotos importadas somente de URLs HTTPS controladas pela infraestrutura de mídia Meta e pertencentes ao perfil conectado.
- O importador nunca carrega documentos privados do COMUN nem cria denúncias em outro sistema.
- Não duplicar automaticamente dados pessoais sensíveis ou conteúdos removidos por segurança: definir processo de retirada/correção editorial antes de ativar o fluxo.
- Para mídia extensa e muitos posts, migrar armazenamento de imagens para R2/Supabase Storage em vez do histórico Git.

## Próximas integrações

- OAuth Meta com renovação automática; alerta de falha de token; editor de correções e retiradas; Search Console e analytics de conversão.
- Importar transcrições próprias de Reels, links para os respectivos dossiês e documentação editorial.
