# V8.2 — Plano de homologação do núcleo editorial em staging

**Situação:** especificação pronta para revisão, **não executada**. Abrir somente em projeto Supabase isolado que não contenha dados de denunciantes nem URLs/credenciais de produção. Esta etapa tem cinco tabelas de Casos e Bairros. Acervo fica para V8.3.

## Escopo técnico
- `scripts/sql/staging/v82_phase1_editorial_core.sql` é um **blueprint de staging**, NÃO um arquivo em `supabase/migrations`. O SQL começa com guarda de confirmação manual e é transacional; falha ao encontrar tabelas preexistentes. A guarda **não identifica o projeto**: quem executar precisa comparar o project ref e ambiente independentemente.
- Todas as tabelas possuem RLS; `anon` e `authenticated` recebem somente SELECT e nenhuma política de escrita. Nem usuário autenticado/editor consegue gravar nesta fase. O editor do portal permanece bloqueado até instalar política de edição separada e auditar identidade, nunca `authenticated using (true)`.
- Pai invisível ou em `draft` oculta dossiê/bairro e respectivas linhas de links. Update de dossiê exige `published=true` e pai público. O tipo `materia` é aceito no CHECK, mas a validação de existência/revisão da reportagem acontece no código do portal; **não** afirmar integridade referencial SQL sobre Git.
- A publicação de autores, `created_by`, `updated_by`, notas e URLs depende de auditoria de privacidade adicional antes de admitir qualquer escrita. DDL sem dados não gera conteúdo público.
- Não aplicar migrações legadas 0003–0033 em sequência; elas contêm seeds e permissões incompatíveis.

## Pré-condições para qualquer execução
1. A equipe revisa em PR o schema e verifica que o projeto é uma instância dedicada a staging, criada sem clonagem de `intake_submissions`, `universal_captures` e contatos.
2. Confirmar identidade do projeto, orçamento, conexão, backups, região e ausência das cinco tabelas. Registrar responsável/rollback.
3. Gerar migração com a versão de Supabase CLI instalada (consultar `supabase migration new --help`) **após** integrar as PRs de UI; não aplicar este blueprint automaticamente.
4. Conceder opt-in na **sessão de staging** com `SET vrabandonada.editorial_staging_approved = 'yes';`. O guard não impede um operador de usar projeto errado: revisão do destino é obrigatória.

## Matriz de aceite no banco real de testes
| Caso | Papel | Resultado esperado |
| --- | --- | --- |
| Dossiê em draft ou public_visibility=false | anon / authenticated | Zero linhas |
| Dossiê público in_progress, monitoring, concluded, archived | anon / authenticated | Linha visível |
| Link para pai privado | anon / authenticated | Zero linhas |
| Update publicado de pai privado | anon / authenticated | Zero linhas |
| Update não publicado de pai público | anon / authenticated | Zero linhas |
| Bairro em draft/privado | anon / authenticated | Zero linhas |
| Link de bairro com pai privado | anon / authenticated | Zero linhas |
| Escrita direta em qualquer tabela | anon / authenticated | Permission denied |
| Acesso a dados de intake existentes | anon / authenticated | Não modificado pela V8.2 |
| Vínculo materia com slug Git inválido | app Next.js | Recusado na resolução, sem URL clicável |
| Vínculo materia validado em Git | app Next.js | Link /materias/slug correto |

**Execução da matriz ainda pendente.** Usar fixtures exclusivamente sintéticas sob transação com rollback e clientes distintos anon/authenticated, sem cookies nem tokens de produção e sem publicá-las em preview externo. Executar `supabase test db`/pgTAP após preparar staging. Conferir grants com `has_table_privilege`, RLS com `pg_class.relrowsecurity`, políticas via `pg_policies`, e repetir `scripts/sql/portal-editorial-readiness.sql`.

## Rollback e limites
Se o SQL falhar, transação aborta sem tabelas parciais. Se aplicado em staging, o rollback deve ser migração revisada para o mesmo ambiente; não executar DROP em produção. Não promover código com UI de edição habilitada sem construir autorização editorial para administrador. A V8.2 não comprova RLS em ambiente real; testes Node verificam invariantes estáticos do blueprint.

## Verificação de privacidade V8.5

O blueprint passa a restringir SELECT às colunas públicas de cada tabela. `created_by` e `updated_by` permanecem restritas, inclusive quando o pai está publicado. Conferir com `has_column_privilege` (anon e authenticated), validar que o `select` público da aplicação não pede autoria e tentar consulta direta da coluna como visitante (espera-se permissão negada). **Não aplicar esta proposta SQL no banco real sem um staging dedicado.**