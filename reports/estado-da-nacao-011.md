# Estado da Nação 011

## O que foi implementado

Este tijolo criou a camada base de acervo do VR Abandonada.

Entraram:
- tabela `archive_assets`
- bucket `archive-assets`
- helpers de upload e remoção para acervo
- painel interno em `/interno/acervo`
- criação em `/interno/acervo/novo`
- edição em `/interno/acervo/[id]`
- lote pequeno com múltiplos arquivos
- vínculo com memória e pauta
- bloco público de anexos no detalhe da memória
- assets de demonstração para fallback editorial

## Como funciona a tabela de acervo

A nova tabela guarda o material-base do arquivo vivo.

Campos principais:
- `memory_item_id`
- `editorial_item_id`
- `title`
- `asset_type`
- `file_url`
- `thumb_url`
- `source_label`
- `source_date_label`
- `approximate_year`
- `place_label`
- `rights_note`
- `description`
- `public_visibility`
- `featured`
- `sort_order`

Campos operacionais extras:
- `file_path`
- `thumb_path`
- `created_by`
- `updated_by`

A modelagem foi mantida simples para não virar DAM nem catálogo arquivístico pesado.

## Como funciona o upload

O upload usa o bucket `archive-assets` no Supabase Storage.

Fluxo:
- o arquivo entra pelo formulário interno
- a action gera um caminho único por asset
- o helper salva o arquivo no bucket
- o registro recebe `file_url` e `file_path`
- se a mídia for visual, a prévia usa `thumb_url`

Na edição:
- um novo arquivo substitui o anterior
- o arquivo velho é removido do bucket, quando possível

## Como funciona o lote pequeno

A tela `/interno/acervo/novo` aceita múltiplos arquivos.

O fluxo é:
- selecionar um conjunto pequeno de arquivos
- preencher metadados mínimos comuns
- enviar tudo de uma vez
- corrigir os registros um a um depois, se preciso

Isso ajuda a subir material bruto sem travar a operação editorial.

## Como o acervo se conecta à memória

A memória interna agora pode receber anexos diretamente.

Na prática:
- `/interno/memoria/[id]` mostra os anexos ligados à memória
- há atalho para criar um novo anexo já vinculado à memória
- `memory_item_id` faz o vínculo estrutural
- quando um anexo é público, ele aparece no detalhe público da memória

A relação com pauta existe também via `editorial_item_id`, mas o uso principal neste estágio continua sendo memória.

## Como os assets aparecem no público

No detalhe público da memória (`/memoria/[slug]`):
- só aparecem assets marcados como `public_visibility = true`
- o bloco é curto, editorial e funcional
- o layout mostra fonte, tipo, lugar e ano aproximado
- anexos visuais usam prévia; documentos e mídias não visuais caem para fallback gráfico

Quando não houver asset real, o projeto ainda mantém um fallback de demonstração com SVGs locais para não quebrar a leitura.

## Limitações atuais

Ainda não existe:
- OCR
- indexação profunda de documentos
- organização por coleções de acervo mais avançadas
- busca avançada no acervo
- ingestão em massa inteligente
- gestão de direitos mais sofisticada

O desenho continua leve de propósito.

## Mudanças de schema

Nova migration:
- `supabase/migrations/0009_archive_assets.sql`

Ela cria:
- `public.archive_assets`
- policies de RLS para leitura pública controlada e gestão por admin autenticado
- bucket `archive-assets`
- policies de Storage para leitura pública e gestão autenticada

## Arquivos principais

- `supabase/migrations/0009_archive_assets.sql`
- `lib/archive/types.ts`
- `lib/archive/mock.ts`
- `lib/archive/navigation.ts`
- `lib/archive/queries.ts`
- `lib/media/archive.ts`
- `components/archive-asset-card.tsx`
- `components/archive-asset-form.tsx`
- `app/interno/acervo/actions.ts`
- `app/interno/acervo/page.tsx`
- `app/interno/acervo/novo/page.tsx`
- `app/interno/acervo/[id]/page.tsx`
- `app/memoria/[slug]/page.tsx`
- `app/interno/memoria/[id]/page.tsx`
- `next.config.ts`
- `app/globals.css`

## Próximos passos recomendados

1. Alimentar o acervo com fotos, scans e documentos reais.
2. Começar a separar tipos de fonte em recortes mais precisos.
3. Introduzir uma curadoria mínima de direitos e restrições por arquivo.
4. Quando o volume crescer, criar filtros melhores por período e tipo de material.
