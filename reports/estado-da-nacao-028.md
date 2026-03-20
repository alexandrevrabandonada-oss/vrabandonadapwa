# Estado da Nacao 028

## O que entrou
- Camada publica e interna de share packs para transformar conteudos do site em pecas prontas para circular.
- Rota publica `/compartilhar` com indice de pacotes por tipo de conteudo.
- Rota publica individual `/compartilhar/[contentType]/[contentKey]` com resumo, legenda, copy e share nativo.
- Area interna `/interno/compartilhar` para criar, editar, destacar e publicar pacotes.
- Integracao de share nas paginas centrais: edicoes, campanhas, impacto, dossies, pautas e padroes.
- CTA de compartilhamento na home, especialmente na secao da edicao do momento.
- Navegacao publica com acesso direto a `Compartilhar`.

## Modelagem
A migracao `0023_share_packs.sql` criou `share_packs` com:
- `content_type`
- `content_key`
- `title_override`
- `short_summary`
- `share_caption`
- `share_status`
- `cover_variant`
- `featured`
- `public_visibility`
- `sort_order`
- metadados de criacao e atualizacao

Tambem foi criada a indexacao por `content_type` + `content_key`, policies de RLS e seeds iniciais para:
- edicao
- campanha
- impacto
- dossie
- pauta
- padrao

## Como a camada ficou publica
### `/compartilhar`
A pagina funciona como vitrine editorial da circulacao:
- mostra pacotes em destaque
- agrupa por tipo de conteudo
- deixa claro que a unidade de circulacao nao e o link cru, mas a leitura condensada

### `/compartilhar/[contentType]/[contentKey]`
A pagina individual do pacote entrega:
- manchete do pacote
- resumo curto
- legenda pronta
- copia de link
- copia de resumo
- copia de legenda
- compartilhamento nativo quando existe suporte do navegador
- retorno para o conteudo original

## Como o share foi incorporado nas paginas
Apos a entrada editorial de cada conteudo, entrou um bloco curto de circulacao com acesso ao pacote correspondente:
- edicao -> `/compartilhar/edicao/[slug]`
- campanha -> `/compartilhar/campanha/[slug]`
- impacto -> `/compartilhar/impacto/[slug]`
- dossie -> `/compartilhar/dossie/[slug]`
- pauta -> `/compartilhar/pauta/[slug]`
- padrao -> `/compartilhar/padrao/[slug]`

Isso faz a pagina original continuar sendo o arquivo vivo, mas abre uma saida clara para WhatsApp, Instagram e circulacao direta.

## Como a home passou a apontar essa camada
- A secao da edicao do momento ganhou a acao de compartilhar.
- A navegação publica agora inclui `Compartilhar`.
- O pacote em destaque pode ser aberto diretamente da home sem exigir que a pessoa descubra a rota sozinha.

## Como a area interna ficou
Em `/interno/compartilhar` a equipe consegue:
- criar pacote a partir de um conteudo publico existente
- editar titulo, resumo e legenda
- escolher variante visual
- marcar destaque e visibilidade
- ver preview antes de publicar

## Limites atuais
- Ainda nao existe automacao de postagem em redes.
- Ainda nao existe programacao de campanhas por canal.
- Ainda nao existe editor visual avancado para cards de circulacao.
- Ainda nao existe analitica de performance de share.
- A camada depende de conteudo publico ja publicado e sanitizado.

## Proximos passos recomendados
1. Preparar uma chamada mais forte de share em campanhas ativas.
2. Criar variações visuais de pacote para edicao, campanha e impacto.
3. Adicionar um bloco de share diretamente em `/agora` quando houver foco urgente.
4. Quando fizer sentido, medir quais pacotes sao mais usados na circulacao externa.

## Observacao editorial
A camada de share nao substitui o conteudo original. Ela serve para condensar, legendar e devolver o leitor ao arquivo com menos atrito e mais contexto.
