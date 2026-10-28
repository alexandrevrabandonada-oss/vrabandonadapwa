# Arquitetura editorial unificada — VR Abandonada

## Princípio

**Uma reportagem original, vários caminhos de leitura.** A URL canônica de cada notícia/investigação/explicação é `/materias/[slug]`. As páginas temáticas não duplicam o texto: fazem curadoria de links para a origem.

| Experiência | Pergunta que responde | Papel |
|---|---|---|
| `/noticias` | O que aconteceu? | Notícias breves, apuradas e verificadas |
| `/agora` | O que mudou recentemente? | Fluxo cronológico de publicações e atualizações |
| `/dossies` | O que está sendo investigado? | Dossiês e acompanhamento de casos documentados |
| `/acervo` | O que o veículo já registrou? | Porta permanente para matérias e coleção de documentos/anexos |
| `/territorios` | O que já publicamos sobre este bairro? | Índice geográfico baseado em matérias aprovadas e hubs existentes |
| `/buscar` | Onde está a informação que preciso? | Índice transversal de conteúdos públicos com filtros |
| `/materias` | Quero filtrar tudo que publicaram | Listagem editorial e filtros por formato e assunto |

## Ligação concreta entre matéria e bairro

Novo atributo opcional em `content/materias`: `territories: [{slug, label, role}]`, com `role = main | mentioned`.
- **main:** local principal do fato ou objeto investigado; pode gerar uma página de bairro a partir da matéria.
- **mentioned:** local citado com base verificável mas não foco do fato central. A página do lugar mostra a referência numa área separada, com aviso de que fatos diferentes não necessariamente estão relacionados.
- Não extrair bairros automaticamente por regex no texto. Um lugar citado num relato não confirmado não vira território validado por mera coincidência vocabular.
- Uma publicação pode estar ligada a mais de um bairro e mantém sempre **uma só URL canônica**.
- Bairros publicados no Supabase continuam preservados com suas informações e relacionamentos; a camada editorial complementa essas páginas, sem substituir cadastros verificados.

### Primeiros vínculos reais

- Investigação Rua 33 => `Vila Santa Cecília` (`main`).
- Notícia troca do 28º BPM => `Vila Brasília` (`main`), `Água Limpa` (`mentioned`, homicídio independente).
- Jardim Amália e Monte Castelo **não** receberam página editorial baseada apenas em relatos noturnos não confirmados da matéria.

## Acervo

Acervo público passa a exibir notícias e investigações reais mesmo quando `archive_assets` e as coleções documentais ainda não têm conteúdo aprovado. O arquivo de documentos continua separado por direitos, proveniência e visibilidade. Não transferir nem expor material do bucket não classificado, dados pessoais ou fontes.

## Busca, SEO e atualização viva

- `lib/search/index.ts` inclui bairro primário como facet e rótulos de todos os lugares como palavras pesquisáveis, sem confundir menções com epicentro.
- `/territorios/[slug]` tem página editorial real quando existe publicação aprovada, com SEO, links para as matérias e URL permanente; hubs territoriais do Supabase continuam compatíveis.
- Sitemap lista as páginas territoriais derivadas, sem duplicar URLs dos hubs existentes.
- Atualizações de uma matéria viva preservam slug, histórico e referências territoriais; o índice é calculado a cada build/request conforme publicação verificada.
- Os vínculos são editoriais, não dados de geolocalização exata ou alegação de causalidade.

## Governança

Não competir com o COMUN: o site publica e relaciona notícias, investigações e fontes. Interação comunitária, organização e acompanhamento participativo são projetos distintos. Conteúdo sensível jamais fica público apenas por entrar no acervo interno.

## Próximos sprints

1. Catalogar e anexar documentos públicos comprovados às matérias, com licenças e proveniência; sem expor o bucket legado.
2. Adicionar territórios obrigatórios nas próximas matérias quando houver confirmação documental.
3. Revisar links e Core Web Vitals no celular, cobertura no sitemap e Search Console.
4. Consolidar um dossiê canônico por investigação, com atualizações e documentos vinculados, sem reproduzir em várias URLs.
