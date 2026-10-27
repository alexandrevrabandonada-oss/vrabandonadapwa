# VR Abandonada | Publicação direta pelo ChatGPT e Codex

**Esta é a rota principal de publicação.** O site não exige API do Instagram para receber notícias. Toda matéria aprovada é um arquivo JSON versionado no GitHub e publicado automaticamente na Vercel pela integração Git existente.

## Fluxo de publicação sem painel

1. No ChatGPT, o usuário aprova o conteúdo e pede: **Publique no site VR Abandonada**.
2. Preparar o conteúdo estruturado conforme docs/modelo-materia.json, após conferir fatos, fontes, datas, nomes e contraditório. Usar autor correto. Datas em ISO 8601 com fuso -03:00.
3. Criar um slug único, legível, com foco no tema e território. Antes de criar, verificar content/materias/<slug>.json; se existir, não sobrescrever inadvertidamente.
4. Preferir gerar numa branch de revisão e ver o Preview. Quando houver aprovação explícita para publicar, criar/atualizar content/materias/<slug>.json na branch main usando a integração GitHub conectada ao ChatGPT. A conexão já autorizada dispensa novo token ou acesso à Meta.
5. O projeto Vercel vrabandonadapwa recebe push em main pela integração Git, constrói o site e publica a URL https://www.vrabandonada.online/materias/<slug> depois do deploy READY.
6. Verificar URL final, status HTTP, sitemap.xml, feed.xml e metadados; caso não esteja disponível, informar que ficou pendente. Não afirmar publicação sem confirmar.
7. Para corrigir uma matéria, editar o mesmo arquivo no GitHub com o SHA atual, atualizar updatedAt e documentar correções importantes em correctionNote. Manter slug e URL permanentes.
8. Instagram: usar o mesmo material para adaptar legenda, carrossel ou Reel. A importação automática da Meta é opcional e separada, não obrigatória.

## Campos do conteúdo

- slug: id estável e legível com palavras-chave
- title, subtitle, summary: linguagem jornalística verificável; summary visível em motores de busca
- section: categoria editorial (ex.: Cidade, Trabalho, Ambiente, Saúde, Memória)
- publishedAt: data da publicação no site (não confundir com data do fato)
- author: autoria real, VR Abandonada ou nome do autor
- status: published e reviewed: true somente após revisão e autorização
- sources: fontes públicas e links, quando houver; não revelar dados de denunciantes
- blocks: paragraph, heading, quote ou list (lista com items)
- cover opcional: src de imagem local, alt e credit. Sem capa, OG 1200×630 gerado automaticamente
- instagramUrl opcional: permalink original
- updatedAt e correctionNote: histórico de atualização e transparência

## SEO automático

- HTML renderizado no servidor, URL estável, título e descrição exclusivos
- Sitemap XML com matérias aprovadas e datas de modificação; feed RSS para distribuição
- Canonical da produção, Open Graph e Twitter Card, incluindo capa automática
- JSON-LD Article, autor, publicador, data, fontes e localidade
- Links internos por editoria e painéis na home
- Verificar propriedade e sitemap no Google Search Console após deploy. Não existe garantia de indexação ou posição.

## Proteções

- Não gerar publicações factuais automaticamente sem revisão editorial explícita.
- Arquivos JSON de demonstração não devem entrar em content/materias.
- Se a matéria estiver incompleta ou pendente de contraditório importante, manter em branch/PR, não main.
- Git guarda histórico, mas não é local apropriado para anexos sensíveis, documentos privados, dados de denunciantes.
- COMUN tem seus próprios fluxos. Não replicar relatos privados nem construir caixas duplicadas.
- Cron Instagram pode ser desabilitado sem afetar o site.
- O comando por conversa funciona quando a conexão GitHub está autorizada; sem ela, fornecer JSON para publicação manual ou via Codex.

## Testes

- node --test tests/materias-validation.test.mjs
- npm run build executa o pré-build de validação das matérias.
- Conferir deploy de Preview antes do merge da branch no site principal.
## Política de confiança (Sprint 0)

O conteúdo de demonstração só pode aparecer em desenvolvimento local com `VR_ENABLE_DEMO_FIXTURES=true`. Não deve aparecer no build de preview/produção. `/buscar` passa a incluir matérias reais do pipeline GitHub. A Captura Universal exige confirmação explícita e autorização editorial no servidor para publicação rápida; nenhum formulário público publica automaticamente.
