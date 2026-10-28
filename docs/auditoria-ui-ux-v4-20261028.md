## Revisão UI/UX V4 — 28/10/2026 | Navegação coerente e notícia em primeiro lugar

**Escopo desta passada:** código `main` e capturas Android fornecidas nas conversas anteriores; **não** há medição Lighthouse, vídeo E2E ou captura autenticada de produção nesta rodada. Vercel READY não constitui teste visual.

### Achados que fundamentam as correções

1. **Primeira dobra:** o cabeçalho editorial da home ainda é um hero grande, antes de qualquer notícia real. O leitor precisa rolar muito até ver matéria; o modelo antigo com bloco institucional ocupa a atenção.
2. **Falsa capa visual:** reportagem sem foto recebe retângulo 16:9 com letras VR enormes. Funciona como preenchimento artificial e desloca a manchete. Decisão: matéria sem capa exibe manchete diretamente; nunca gerar fotografia sem licença.
3. **Investigações desconectadas:** a home lê dossiês Supabase e, se não houver, mostra apenas temas de busca, embora haja investigação Git-first da Rua 33 publicada em `content/materias`. A home deve considerar ambos os fluxos e priorizar casos reais.
4. **Navegação desencontrada:** desktop oferece Notícias, barra móvel oferece Buscar, mas não Notícias; menu repete itens e a busca fica invisível se for retirada da barra. Decisão: quatro destinos móveis Início, Notícias, Últimas, Dossiês + Menu; busca iconográfica com nome acessível no cabeçalho do celular.
5. **Menu não modal de verdade:** embora marcado aria-modal, o componente não controla foco, não impede Tab de escapar, nem evita scroll do documento. Corrigir ciclo de foco, Escape e retorno ao acionador.
6. **Leitura de matérias:** H1 no celular com tamanho mínimo de 2.8rem e uppercase força excessiva altura e quebra. Ajustar para tipo editorial em caixa natural, largura responsiva e espaçamento controlado.
7. **Rodapé e navegação fixa:** bottom bar pode tapar links finais em telas pequenas. Acrescentar respiro considerando `safe-area-inset-bottom`.

### Implementação na PR V4

- Home com masthead textual compacto, atalhos claros e bloco de destaques logo depois; mantém identidade preto/dourado e conteúdo honesto.
- Card principal sem foto vira card editorial tipográfico. Fotos existentes autorizadas permanecem.
- Home prioriza `kind=investigation` Git-first e só recorre a dossiês Supabase e temas de cobertura quando não existirem matérias correspondentes.
- Barra de navegação móvel alinhada ao percurso jornalístico, busca no cabeçalho e menu mais acessível.
- CSS V4 separado, carregado após os estilos legados, com melhorias específicas de mobile (320–430 px), tipografia, foco, reduzido movimento e respiro inferior.
- Testes de regressão do desenho editorial, ordem dos blocos, integridade, menu e acessibilidade.

### Fila de próximas grandes passadas

**P0, antes de considerar o redesign validado no mundo real:** capturas Android em 320/360/390/430 px e desktop 1280; navegar em /, /noticias, /agora, /materias/<slug>, /dossies e /buscar; validar menu aberto/fechado e botão Ouvir, scroll e teclado. Testar em sessão pública sem Vercel Toolbar. Validar ausência de overflow horizontal.

**P1:** consolidar arquitetura de URL editorial (a relação entre `/dossies` Supabase e investigações Git-first `/materias` é atualmente híbrida); unificar busca transversal e filtros sem duplicar itens. Criar taxonomia única para bairro/assunto/ator/temporalidade em notícias e investigações.

**P1:** melhorar capa e distribuição de notícias com imagens próprias licenciadas, proporções previsíveis e OG real; aprimorar compartilhamento no WhatsApp e Stories. Não gerar fotos documentais de fatos como se fossem registros reais.

**P1:** acompanhar Core Web Vitals e Lighthouse medidos (LCP, CLS, INP, contraste) com orçamento definido após linha de base real. Sem métricas verificadas, não atribuir nota à interface.

**P2:** revisão do sistema de design para reduzir as três folhas CSS legadas (globals.css, portal-v2.css, materias.css), extrair componentes reutilizáveis, tokens e padrões; não migrar tudo de uma vez.

**P2:** avaliar painel editorial próprio para publicação assistida, com prévia no mesmo layout, validação de fontes e agendamento, sem duplicar COMUN ou criar fluxo automático sem aprovação.

**Aceite para merge:** GitHub CI verde incluindo TypeScript, lint, build e testes, Vercel Preview READY; inspecionar alterações e conferir que matérias reais, SEO e PR #7 não sofrem mudanças. **O aceite visual em smartphone físico continua pendente**, mesmo com o deploy de código aprovado.
