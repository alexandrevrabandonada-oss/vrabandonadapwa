# Estado da Nação 043

## O que mudou
A navegação global foi enxugada para reduzir sobrecarga cognitiva e melhorar o uso real no celular.

## Arquitetura nova
### Navegação primária no desktop
- Início
- Agora
- Buscar
- Acompanhar
- Participe

### Ações e utilidades
- Ouvir / Acessibilidade
- Menu agrupado

### Navegação móvel
- Agora
- Buscar
- Acompanhar
- Salvos
- Menu

## Menu agrupado
O restante do site saiu do topo e passou a morar no menu por grupos:
- Uso diário
- Entender
- Investigar
- Cidade
- Arquivo
- Participar

## O que saiu do topo
- Linha do tempo
- Campanhas
- Impacto
- Edições
- Compartilhar
- Salvos
- Começar
- Sobre
- Pautas
- Memória
- Acervo
- Dossiês
- Eixos
- Territórios
- Atores
- Padrões
- Apoie
- Método
- Envie
- Manifesto

## Camada de acessibilidade
A leitura assistida continua visível no shell, mas agora entra por ação clara de "Ouvir". O botão de acessibilidade foi reposicionado como utilidade, não como concorrente da navegação principal.

## Ganhos práticos
- menos itens no primeiro olhar
- menos varredura no mobile
- retorno diário mais claro
- menu mais organizado por contexto
- acesso rápido às ações mais usadas sem poluir o topo
- melhor convivência entre navegação e acessibilidade

## Páginas e componentes afetados
- `app/layout.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `components/site-menu.tsx`
- `components/mobile-bottom-nav.tsx`
- `components/reading-assistant-trigger.tsx`
- `components/reading-trail-quick-link.tsx`
- `components/reading-assistant.tsx`
- `app/globals.css`
- `lib/site.ts`

## Limitações atuais
- o menu ainda pode crescer se o projeto adicionar novas camadas sem disciplina
- a navegação foi reorganizada, mas ainda depende de uso real para validar os grupos
- a leitura assistida segue dependente do suporte nativo do navegador

## Próximos passos recomendados
1. observar uso real no celular e cortar mais itens se algum grupo ficar pesado
2. revisar microcopy dos itens do menu se algum nome ainda estiver longo
3. testar a bottom nav com usuários reais em tela pequena
4. considerar uma segunda passada fina no rodapé para reduzir mais ruído
