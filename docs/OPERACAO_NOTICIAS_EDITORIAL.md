# Notícias no VR Abandonada — protocolo operacional (sem Meta)

## Conceito

Instagram é canal de circulação, não editoria do site. A notícia é uma unidade editorial verificável, com texto, fonte, data e URL própria, esteja ela ou não no Instagram.

Áreas públicas:
- /noticias: notícias breves verificadas, sem rascunhos ou conteúdos fictícios.
- /agora: últimas notícias e atualizações de investigações e pautas públicas.
- /dossies: investigações longas, documentos e acompanhamento.
- /materias: coleção pesquisável de notícias, investigações e explicações.

O índice antigo /publicacoes redireciona para /noticias. Links individuais /publicacoes/[id] continuam preservados, com a legenda de origem, como registro social e não como notícia verificada. O RSS e o fluxo Últimas não misturam automaticamente importações sociais com notícias.

## Formato de publicação

Usar o pipeline já existente content/materias/<slug>.json, agora com kind: news | investigation | explainer.

- title: fato claro, sem afirmar alegações como provas.
- subtitle: apoio com contexto e localização.
- summary: lide (o quê, onde, quando, segundo quem), útil ao SEO.
- section: tema (Cidade, Segurança, Saúde, Trabalho, Educação etc.).
- publishedAt: data da publicação NO SITE; não retrodata o post no Instagram.
- sources: referências públicas de origem, conforme a situação; registrar se contraditório está pendente.
- blocks: notícia escrita em parágrafos, sem publicar hashtags ou legendas sem revisão.
- instagramUrl (opcional): permalink original da própria marca.
- status=published e reviewed=true somente após aprovação explícita de versão final.
- kind=news distingue notícias da Rua 33, que segue como investigação viva.

Exemplo técnico não publicável em docs/modelo-noticia.json.

## Modo de operação pelo ChatGPT

1. Usuário fornece post, legenda, print, texto de apuração, relato ou link.
2. Agente identifica o fato, confere fontes, datas, imagens e contraditório; separa opiniões, denúncias em apuração e fatos.
3. Agente redige notícia factual com título, lide, contexto e atribuições; apresenta para aprovação específica.
4. Após autorização expressa, agente gera JSON classificado como notícia, abre PR, valida CI/preview, faz merge e verifica deploy Vercel READY.
5. Matéria ganha permalink, metadados, sitemap e RSS. Indexação Google exige monitoramento, não é garantida.
6. Correções e respostas alteram o mesmo slug e acrescentam histórico com updatedAt / updates e correctionNote quando material.

Comando exemplo: Transforme esta legenda do Instagram numa notícia, confira as fontes e prepare a publicação no VR Abandonada.

Meta API é opcional, não bloqueia o site. O ChatGPT funciona como agente editorial usando GitHub e Vercel conectados.

O COMUN permanece o espaço separado de participação e acompanhamento; o VR Abandonada mantém jornalismo e arquivo público.
