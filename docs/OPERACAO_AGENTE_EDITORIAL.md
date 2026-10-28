# VR Abandonada — Manual de Operação do Agente Editorial

## Arquitetura

Publicação principal: ChatGPT conectado ao GitHub, com aprovação editorial do usuário, PR, testes e deploy Vercel. A API da Meta e a importação automática do Instagram são opcionais.

O painel autenticado /interno/agente ajuda a estruturar uma pauta e copiar um comando para a conversa. O formulário não envia texto a um LLM, não armazena rascunhos e não publica ao clicar.

## Comandos de conversa

- Investigue esta pauta para o site: pesquisar e confrontar fontes, sem publicar.
- Prepare uma matéria para o VR Abandonada: escrever texto completo com fontes, incertezas e revisão.
- Publique esta versão aprovada no VR Abandonada: somente após aprovação explícita do texto final, criar/atualizar matéria em content/materias, abrir PR, testar, integrar conforme autorização e verificar deploy.
- Atualize a matéria [URL] com estas informações: manter slug e URL, registrar updatedAt e nota de correção quando necessária.
- Audite nossas publicações: analisar páginas, sitemap, RSS e metadados; não afirmar indexação sem Search Console.

## Protocolo

1. Não inventar fatos, fontes, URLs, citações, imagens ou respostas de acusados.
2. Distinguir comprovado, relato, hipótese e pergunta em aberto; considerar contraditório, licenças de imagem e privacidade.
3. Não inserir documentos internos, identidades de fontes confidenciais ou denúncias sensíveis no GitHub.
4. Apresentar a versão completa ao usuário e obter autorização expressa para publicar aquela versão exata.
5. Criar PR e validar testes, preview, SEO e slug; mesclar somente se a publicação estiver aprovada.
6. Verificar deploy READY, URL canônica, sitemap.xml, feed.xml e dados estruturados. Indexação Google é outra etapa.

## Monitor automático do portal

O workflow audit-publication.yml é diário (12h17 UTC) e manual. Verifica a disponibilidade da homepage, robots.txt, sitemap.xml, feed.xml e até cinco matérias publicadas. Abre um único Issue de falha; fecha quando tudo volta ao normal. Não usa token Meta, não escreve no banco e não consulta Search Console.

Falsos positivos de rede são possíveis; o monitor repete requisições uma vez. A permissão Issues:write do GITHUB_TOKEN precisa estar disponível.

## Estado

Esta implementação adiciona cockpit e monitor; não cria um modelo LLM hospedado nem executa publicações sem aprovação. A primeira reportagem real é uma tarefa editorial separada. Não mexer na PR #7 ou em arquivos legados do Storage.
