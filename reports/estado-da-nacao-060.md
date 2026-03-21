# Estado da Nação 060

## O que mudou
Foi criada a **Central de Entrada Simplificada** em [`/interno/entrada`](/C:/Projetos/VR%20Abandonada/app/interno/entrada/page.tsx), com foco em reduzir fricção para subir conteúdo quando a carga editorial está alta.

A entrada agora parte de uma porta única, com **três tipos de entrada** e um fluxo de 1 a 2 minutos antes de qualquer enriquecimento mais pesado.

## Os 3 tipos de entrada

### 1. Post do dia
Para:
- post rápido
- fato quente
- denúncia curta
- atualização breve
- relato de campo

### 2. Documento / artigo / PDF
Para:
- artigo científico
- relatório
- estudo
- parecer
- processo
- clipping importante

### 3. Foto histórica / imagem de acervo
Para:
- foto antiga
- recorte de jornal
- documento escaneado
- imagem histórica
- memória visual

## Como ficou o fluxo rápido
Cada entrada abre um formulário mínimo com poucos campos e três ações claras:
- **publicar rápido** quando fizer sentido
- **guardar para depois**
- **guardar e enriquecer depois**

A lógica evita escolher camada cedo demais.

## Lógica de duas etapas
### Etapa 1
- guardar o mínimo
- registrar o essencial
- reduzir a hesitação inicial

### Etapa 2
- vincular a território
- vincular a ator
- vincular a eixo
- conectar ao acervo, memória, dossiê, campanha, impacto ou edição

A etapa 2 não trava a etapa 1.

## Como a distinção ficou clara
A central deixou visível a diferença entre:
- **publicar rápido**
- **guardar para depois**

Isso aparece tanto na tela inicial da central quanto nos botões de ação de cada tipo.

## Revisão leve
Foi criado um painel de revisão interna que mostra:
- entradas recentes
- status da fila
- tipo de entrada
- caminho de retorno para abrir e enriquecer depois

A ideia é manter uma fila curta, não um CMS pesado.

## Integração com a arquitetura existente
A central conversa com:
- arquivos e storage já existentes
- acervo
- memória
- editorial
- intake público
- triagem interna
- dossiês, campanhas, impacto, edições e demais camadas como destino futuro de enriquecimento

## Como ficou o padrão operacional
- [`app/interno/page.tsx`](/C:/Projetos/VR%20Abandonada/app/interno/page.tsx) agora aponta para a nova central.
- [`app/auth/callback/route.ts`](/C:/Projetos/VR%20Abandonada/app/auth/callback/route.ts) também passou a devolver para a central.
- A fila pública de `intake` segue existindo, mas deixou de ser a porta principal de trabalho interno.

## Limitações atuais
- A central ainda não cria automaticamente os vínculos profundos de dossiê, campanha, impacto ou edição.
- A passagem da etapa 1 para a etapa 2 ainda é manual.
- O documento e a imagem ainda dependem da revisão posterior para virar memória, acervo ou narrativa pública.

## Próximos passos recomendados
1. Adicionar um painel leve de "pronto para enriquecer" com links diretos para acervo, memória e editorial.
2. Permitir pré-preenchimento de algumas camadas futuras a partir da entrada guardada.
3. Observar se os três tipos cobrem mesmo a carga real de trabalho ou se algum ajuste fino ainda é necessário.
4. Só depois, conectar mais forte essa central aos fluxos de publicação pública.
