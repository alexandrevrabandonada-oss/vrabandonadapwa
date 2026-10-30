# VR Abandonada — Design System Editorial V7

**Estado:** proposta implementada em branch dependente da UX V6, sujeita a inspeção visual antes de qualquer merge. **Não é um redesenho da marca** e não substitui o símbolo fornecido pelo projeto.

## Norte do produto

**Uma notícia, muitas portas de acesso.** Início e Últimas informam; Investigações acompanham; Bairros organizam a dimensão territorial; Acervo permite consultar reportagens, referências e documentos; Busca encontra tudo. O leitor não precisa conhecer o banco de dados, o fluxo editorial, o nome de uma tabela ou a estrutura interna do jornal.

### Princípios UI/UX
1. **Jornalismo antes de apresentação:** manchete, contexto, data, evidências e acompanhamento precedem blocos explicando o produto.
2. **Toda seção responde a uma tarefa:** abrir, ler, localizar, conferir, acompanhar ou enviar informação. Remover atalho sem destino real.
3. **Mesmo vocabulário em todo o site:** usar "Últimas", "Investigações", "Bairros", "Documentos e fontes"; "Casos" é o rótulo curto da barra móvel para Investigações.
4. **Identidade estável:** contraste preto/amarelo, branco quente e tipografia de impacto com leitura confortável, sem regenerar logo ou criar fotos fictícias.
5. **Padrões compartilhados:** `EditorialHubIntro` é responsável pelo H1 e atalhos de Acervo/Bairros. Cartões, metadados e links consomem tokens de design compartilhados.
6. **Legibilidade e controle:** não esconder fontes, correções nem indicações de "menção contextual"; foco visível, alvo mínimo de 44 px nas novas ações, conteúdo responsivo e redução de movimento.
7. **Sem migração destrutiva:** não remover URLs, antigas folhas CSS ou conteúdo jornalístico como consequência desta rodada.

## Tokens canônicos

Arquivo `app/design-tokens.css`, carregado após `globals.css` e antes dos estilos específicos.

- **Cores:** `--ds-canvas`, `--ds-surface`, `--ds-surface-raised`, `--ds-text`, `--ds-text-secondary`, `--ds-accent`, `--ds-ink-on-accent`, `--ds-focus` e bordas.
- **Espaçamento:** `--ds-space-1/2/3/4/5/6/8/10/12` em rem.
- **Tipografia:** `--ds-step-xs/sm/base/lg/h3/h2/h1`, `--ds-leading-body` e `--ds-leading-headline`.
- **Superfícies/interação:** `--ds-radius-sm/card/panel/pill`, `--ds-stroke`, `--ds-tap-target`.
- **Compatibilidade:** variáveis V2 e V6 continuam disponíveis como aliases dos tokens enquanto migramos o restante.

## Áreas já migradas nesta rodada
| Superfície | Contrato |
| --- | --- |
| Acervo | Cabeçalho compartilhado, entrada por reportagens/fontes/documentos, sem mudar filtros de ano, tipo, lugar ou memória |
| Bairros | Mesmo cabeçalho e padrão de atalho, preserva distinção entre foco territorial e menção |
| Matéria | Escala de título contida, corpo de leitura confortável, tokens de cor e raios, largura segura |
| Índices editoriais | Cores, bordas e radius em tokens, títulos hierárquicos consistentes |
| Homepage | Variáveis cromáticas V2 conectadas ao sistema canônico |
| Barra móvel | Início · Últimas · Casos (Investigações) · Buscar · Menu; Notícias preservada no menu e na URL |
| Rodapé/Menu | Menos destinos duplicados; prioridade às jornadas reais e ao envio à redação |

## Decisões de implementação

- **Não** colocar `!important` em todo o projeto nem apagar CSS V2–V6 em massa: risco de regressão alto. Migrar módulo por módulo com screenshots e comparação lado a lado.
- **Não** alterar JSON das reportagens, metadados factuais, fontes ou labels de correção por motivos puramente visuais.
- **Não** tomar Vercel `READY` ou teste de regex como prova de uma experiência visual boa; isso exige inspeção de renderização em dispositivos reais.
- **Não** exibir links para seções vazias ou dados privados. Esses estados são responsabilidade dos componentes de conteúdo, não do tema.

## Controle de qualidade

- [ ] Checks CI do SHA de PR (testes Node, TypeScript, lint, build) verdes
- [ ] Prévia Vercel `READY` do mesmo SHA
- [ ] Revisão Android real 320, 360, 390 e 430 px: header, barra fixa, manchetes, fontes e documentos sem overflow
- [ ] Desktop, zoom 200%, navegação por teclado, foco e preferência de movimento reduzido
- [ ] Sem regressões em URLs /noticias, /agora, /dossies, /buscar, /territorios, /acervo e permalinks
- [ ] Verificação em rede real de deep-links, filtros, fontes e estados vazios
- [ ] Comparar página de matéria V6/V7 para evitar que tipografia comprimida reduza clareza

## Próxima migração após aceite

1. Extrair componentes comuns de cards para notícia, investigação, bairro e documento, preservando diferenças semânticas.
2. Reduzir gradualmente regras duplicadas em `globals.css`, `portal-v2.css` e `editorial-v4.css`, medindo impacto visual.
3. Adicionar observabilidade de performance (Web Vitals), acessibilidade com leitor de tela e telemetria mínima respeitando privacidade.
4. Conectar casos a documentos com proveniência e atualização editorial, sem reclassificar automaticamente fontes externas como acervo hospedado.
