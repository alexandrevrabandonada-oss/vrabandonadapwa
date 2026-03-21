# Estado da Nação 036

## Objetivo da auditoria

Esta etapa não criou uma camada nova de produto. O foco foi reduzir atrito real de uso, corrigir pontos de organização e fortalecer acessibilidade estrutural para o uso cotidiano no celular.

O diagnóstico partiu de um princípio simples:
- o VR Abandonada já tem profundidade suficiente
- o risco agora é a complexidade virar barreira
- o site precisa continuar forte editorialmente, mas com fluxo mais claro e previsível

## Fluxos auditados

### 1. Visitante novo chegando pela home
Fluxo esperado:
- entra pela home
- entende o que é o projeto
- identifica um próximo passo claro
- segue para `Agora`, `Começar`, `Buscar`, `Edições` ou `Participe`

Leitura atual:
- a home já cumpre bem o papel de porta editorial
- ainda existe densidade alta de camadas, então o usuário precisa de sinais visuais muito claros para não dispersar

### 2. Visitante chegando por share/link externo
Fluxo esperado:
- abre uma peça compartilhada
- entende contexto mínimo
- consegue voltar para a camada maior do projeto
- consegue salvar, seguir, buscar ou acompanhar

Leitura atual:
- pages de edição, campanha, impacto e dossiê já ajudam nisso
- ainda é importante manter CTA de retorno explícito em conteúdos profundos

### 3. Pessoa querendo entender por onde começar
Fluxo esperado:
- encontra `Começar`
- entende os percursos editoriais
- escolhe uma entrada sem precisar conhecer toda a arquitetura

Leitura atual:
- a camada de entrada está boa
- o problema deixa de ser falta de guia e passa a ser excesso de opções ao redor

### 4. Pessoa querendo acompanhar um tema, caso ou lugar
Fluxo esperado:
- usa `Acompanhar`
- segue um eixo, território, ator, dossiê, campanha ou edição
- vê retorno recorrente no PWA

Leitura atual:
- essa camada já existe e é útil
- a leitura cotidiana funciona melhor quando o CTA de seguir é consistente nas páginas profundas

### 5. Pessoa querendo buscar algo específico
Fluxo esperado:
- entra em `Buscar`
- filtra por tipo, ator, território ou termo
- chega rápido ao alvo

Leitura atual:
- a busca transversal está forte
- ainda há margem para torná-la mais visível nos pontos de decisão da navegação

### 6. Pessoa querendo salvar ou seguir
Fluxo esperado:
- salva uma peça para voltar depois
- segue uma frente para acompanhar no tempo
- entende a diferença entre os dois gestos

Leitura atual:
- a distinção entre `Salvar` e `Seguir` está correta
- o risco é a consistência visual variar demais de página para página

### 7. Pessoa querendo enviar pista, documento ou relato
Fluxo esperado:
- encontra `Envie`
- entende o método
- sabe o que pode mandar e o que esperar depois

Leitura atual:
- o fluxo já está claro
- o ponto de confiança vem mais do método e do pós-envio do que da interface em si

### 8. Pessoa querendo apoiar
Fluxo esperado:
- encontra `Apoie`
- entende por que o apoio existe
- encontra o caminho sem fricção

Leitura atual:
- o apoio está legível
- ainda pode ganhar mais centralidade em momentos de mobilização

### 9. Uso mobile/PWA no dia a dia
Fluxo esperado:
- instala ou abre no celular
- vê o que está quente agora
- volta para salvos e acompanhamentos
- consegue ler offline o que já acessou

Leitura atual:
- o PWA já é funcional
- o maior ganho de agora é tornar o fluxo mais previsível, com landmarks, foco visível e hierarquia estável

## Diagnóstico de navegação

### Header
Problemas encontrados:
- a navegação principal não indicava claramente a página ativa
- em um ecossistema grande, isso aumenta desorientação

Correção feita:
- [`components/site-header.tsx`](/C:/Projetos/VR%20Abandonada/components/site-header.tsx) passou a usar estado ativo com `aria-current="page"`
- o cabeçalho agora comunica melhor onde a pessoa está

### Skip link e conteúdo principal
Problemas encontrados:
- não havia atalho explícito para o conteúdo principal

Correção feita:
- [`app/layout.tsx`](/C:/Projetos/VR%20Abandonada/app/layout.tsx) ganhou skip link e `id="conteudo"` no `<main>`
- isso melhora navegação por teclado e leitores de tela

### Footer
Problemas encontrados:
- a área de links do rodapé estava semanticamente menos clara do que poderia ser

Correção feita:
- [`components/site-footer.tsx`](/C:/Projetos/VR%20Abandonada/components/site-footer.tsx) passou a usar `<nav aria-label="Links do rodapé">`

### CTAs e continuidade
Leitura geral:
- os CTAs principais existem, mas o ecossistema está grande o suficiente para exigir mais padrão entre páginas
- `voltar`, `continuar`, `salvar` e `seguir` precisam manter a mesma lógica visual e verbal

## Diagnóstico de acessibilidade total

### O que estava bom
- foco visual global já existe
- a maior parte das páginas tem hierarquia razoável
- os botões e links principais já estão em HTML semântico
- o conteúdo é majoritariamente textual e legível no celular

### O que foi corrigido agora
- skip link funcional
- landmark principal explícito
- navegação principal com estado ativo
- rodapé com região navegável semântica

### O que ainda merece atenção
- alguns blocos internos repetem muita densidade visual e podem cansar em telas pequenas
- há warnings antigos de lint em módulos compartilhados da timeline, sem quebra de compilação
- ainda é possível reforçar mais a consistência de rótulos e textos de apoio em ações repetidas

## Diagnóstico de uso cotidiano

### O que funciona bem hoje
- abrir a home e entrar em um fluxo editorial claro
- voltar ao que segue no PWA
- salvar leituras para depois
- acompanhar frentes locais
- buscar uma peça específica
- compartilhar uma edição, campanha ou impacto

### O que ainda gera atrito
- muita camada disponível pode virar excesso de decisão
- a navegação entre páginas profundas ainda depende bastante de sinais editoriais manuais
- algumas rotas internas ficam muito cheias para leitura de bolso

### Conclusão de uso diário
O produto já serve à rotina real, mas precisava de uma camada mais forte de orientação estrutural. A auditoria atacou exatamente os pontos que mais prejudicam o uso contínuo: orientação, landmark, foco e consistência de navegação.

## Problemas encontrados

### Críticos
- ausência de skip link e landmark principal explícito
- navegação ativa não sinalizada no header
- rodapé com semântica menos clara do que o ideal

### Médios
- excesso de densidade em páginas profundas
- CTAs variando de forma demais entre camadas
- alguns textos de ação podem ser mais consistentes

### Ajustes rápidos
- padronizar retorno para páginas anteriores ou camadas maiores
- reforçar continuidade entre salvar, seguir e compartilhar
- manter os blocos de contexto e próximos passos mais visíveis

### Ajustes estruturais para depois
- uniformizar alguns padrões de CTA em páginas profundas
- limpar warnings antigos do módulo de timeline
- revisar cada página longa com foco em leitura de bolso

## Correções realizadas nesta etapa

- [`app/layout.tsx`](/C:/Projetos/VR%20Abandonada/app/layout.tsx)
  - skip link para o conteúdo principal
  - `id="conteudo"` no `<main>`
- [`components/site-header.tsx`](/C:/Projetos/VR%20Abandonada/components/site-header.tsx)
  - navegação principal com `aria-current`
  - estado ativo visível
- [`components/site-footer.tsx`](/C:/Projetos/VR%20Abandonada/components/site-footer.tsx)
  - links do rodapé dentro de `<nav>` com rótulo acessível
- [`app/globals.css`](/C:/Projetos/VR%20Abandonada/app/globals.css)
  - estilos de skip link
  - destaque visual para item ativo da navegação

## Checklist de acessibilidade

- [x] skip link presente
- [x] landmark principal explícito
- [x] navegação principal com estado ativo
- [x] rodapé com navegação semântica
- [x] foco visível no CSS global
- [x] labels e botões principais seguem semântica nativa
- [x] leitura funcional no celular
- [ ] revisão completa de contraste por página longa
- [ ] revisão fina de headings em todos os blocos densos
- [ ] padronização total de mensagens de erro e sucesso
- [ ] limpeza de warnings antigos de lint em módulos compartilhados

## Checklist de uso mobile/cotidiano

- [x] abrir e entender o que está quente agora
- [x] salvar leitura para voltar depois
- [x] seguir uma frente localmente
- [x] buscar algo específico
- [x] compartilhar uma peça
- [x] ler offline o que já foi acessado
- [ ] reduzir ainda mais a densidade de algumas páginas longas
- [ ] revisar blocos de CTA repetidos para manter consistência editorial
- [ ] simplificar alguns trechos de navegação profunda em telas pequenas

## O que ficou para a próxima etapa

1. Revisar páginas muito densas com foco em leitura de bolso.
2. Normalizar melhor os blocos de `continue lendo`, `próximos passos` e retorno.
3. Limpar warnings técnicos antigos nos módulos compartilhados da timeline.
4. Fazer uma varredura fina de contraste e headings em páginas longas.
5. Padronizar ainda mais os CTAs de salvar, seguir, compartilhar e participar.

## Resultado prático

A auditoria não reinventou o produto. Ela fez o que precisava:
- diminuiu fricção estrutural
- melhorou orientação
- reforçou acessibilidade base
- preservou a força editorial do ecossistema

O VR Abandonada continua grande, mas agora está um pouco mais legível, mais navegável e mais confiável para uso cotidiano no celular.
