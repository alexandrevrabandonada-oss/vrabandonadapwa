# Estado da Nação 035

## Panorama geral

O VR Abandonada hoje funciona como um ecossistema editorial, documental, investigativo e territorial sobre Volta Redonda.

A arquitetura deixou de ser um site com páginas isoladas e passou a operar como uma rede de camadas públicas que se cruzam:
- leitura inicial e entrada guiada
- acompanhamento do momento
- casos e dossiês vivos
- temas e eixos
- territórios e lugares
- atores e instituições
- padrões e recorrências
- impacto e consequência pública
- cronologia ampla e marcos centrais
- edições e circulação
- share packs e export visual
- PWA com offline leve, salvos e acompanhamento local
- busca transversal

O resultado é um projeto que já não depende só de navegação por tipo de conteúdo. Ele permite entrar por tema, tempo, lugar, responsabilidade, consequência, leitura guiada ou busca livre.

## O que o projeto entrega hoje

### 1. Entrada e orientação
O site tem rotas de entrada claras para novos visitantes:
- [`/comecar`](C:/Projetos/VR%20Abandonada/app/comecar/page.tsx)
- [`/buscar`](C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- home com blocos curtos para leitura e ação

Essas rotas ajudam a reduzir dispersão para quem chega sem contexto.

### 2. Pulso editorial
A camada de agora e radar organiza o que está em curso:
- [`/agora`](C:/Projetos/VR%20Abandonada/app/agora/page.tsx)
- home com sinal do momento

Essa camada mostra o que mudou recentemente e o que está quente no projeto.

### 3. Casos e continuidade
Os dossiês viraram unidade central de caso vivo:
- [`/dossies`](C:/Projetos/VR%20Abandonada/app/dossies/page.tsx)
- [`/dossies/[slug]`](C:/Projetos/VR%20Abandonada/app/dossies/%5Bslug%5D/page.tsx)
- updates de dossiê
- status narrativos
- peça principal
- timeline leve
- próximos passos
- convocação pública responsável

### 4. Eixos temáticos
Os hubs temáticos organizam o projeto por grandes frentes:
- [`/eixos`](C:/Projetos/VR%20Abandonada/app/eixos/page.tsx)
- [`/eixos/[slug]`](C:/Projetos/VR%20Abandonada/app/eixos/%5Bslug%5D/page.tsx)

Eles atravessam pautas, dossiês, memória, acervo, territórios e impacto.

### 5. Territórios e lugares
A camada territorial dá entrada por bairro, lugar, equipamento ou marco urbano:
- [`/territorios`](C:/Projetos/VR%20Abandonada/app/territorios/page.tsx)
- [`/territorios/[slug]`](C:/Projetos/VR%20Abandonada/app/territorios/%5Bslug%5D/page.tsx)

O território funciona como condensador de memória, conflito e consequência no espaço concreto da cidade.

### 6. Atores e responsabilidade
A camada de atores e instituições organiza recorrência por quem atravessa os conflitos:
- [`/atores`](C:/Projetos/VR%20Abandonada/app/atores/page.tsx)
- [`/atores/[slug]`](C:/Projetos/VR%20Abandonada/app/atores/%5Bslug%5D/page.tsx)

Isso ajuda a ler responsabilidade, repetição e estrutura de poder sem virar banco jurídico frio.

### 7. Padrões e leitura estrutural
A camada de padrões mostra recorrências e padrões sistêmicos:
- [`/padroes`](C:/Projetos/VR%20Abandonada/app/padroes/page.tsx)
- [`/padroes/[slug]`](C:/Projetos/VR%20Abandonada/app/padroes/%5Bslug%5D/page.tsx)

Ela sintetiza o que se repete na cidade e o que revela estrutura.

### 8. Impacto e consequência
A camada de impacto presta contas de forma editorial:
- [`/impacto`](C:/Projetos/VR%20Abandonada/app/impacto/page.tsx)
- [`/impacto/[slug]`](C:/Projetos/VR%20Abandonada/app/impacto/%5Bslug%5D/page.tsx)

Ela mostra o que mudou, o que segue em disputa e o que foi observado ou consolidado.

### 9. Método, participação e confiança
O projeto tem uma camada pública de confiança operacional:
- [`/metodo`](C:/Projetos/VR%20Abandonada/app/metodo/page.tsx)
- [`/participe`](C:/Projetos/VR%20Abandonada/app/participe/page.tsx)
- [`/envie`](C:/Projetos/VR%20Abandonada/app/envie/page.tsx)
- [`/envie/recebido`](C:/Projetos/VR%20Abandonada/app/envie/recebido/page.tsx)
- [`/apoie`](C:/Projetos/VR%20Abandonada/app/apoie/page.tsx)

Isso ajuda a explicar como o projeto trabalha, como lida com cuidado e o que acontece depois do envio.

### 10. Radar, busca e descoberta
A descoberta deixou de depender só de navegação manual:
- [`/buscar`](C:/Projetos/VR%20Abandonada/app/buscar/page.tsx)
- cronologia transversal
- busca indexada por múltiplas camadas
- estados vazios úteis e filtros simples

A busca já atravessa o ecossistema inteiro.

### 11. Cronologia e marcos centrais
A leitura temporal foi dividida em duas camadas:
- cronologia transversal ampla em [`/linha-do-tempo`](C:/Projetos/VR%20Abandonada/app/linha-do-tempo/page.tsx)
- marcos curados em [`/linha-do-tempo/marcos/[slug]`](C:/Projetos/VR%20Abandonada/app/linha-do-tempo/marcos/%5Bslug%5D/page.tsx)

A cronologia ampla mostra o índice; os marcos curados mostram as viradas que realmente estruturam a história pública.

### 12. Edições e circulação
O projeto já produz sínteses compartilháveis:
- [`/edicoes`](C:/Projetos/VR%20Abandonada/app/edicoes/page.tsx)
- [`/edicoes/[slug]`](C:/Projetos/VR%20Abandonada/app/edicoes/%5Bslug%5D/page.tsx)
- OG próprio
- share packs
- export visual de cards

As edições condensam o que importa e ajudam a circular a leitura para fora do site.

### 13. Share packs e export visual
O conteúdo já pode virar peça pronta de circulação:
- [`/compartilhar`](C:/Projetos/VR%20Abandonada/app/compartilhar/page.tsx)
- [`/compartilhar/[contentType]/[contentKey]`](C:/Projetos/VR%20Abandonada/app/compartilhar/%5BcontentType%5D/%5BcontentKey%5D/page.tsx)
- export de cards quadrados e verticais

Isso transforma a leitura em material compartilhável.

### 14. PWA forte
O VR Abandonada também funciona como aplicação móvel local:
- instalação
- offline leve
- leitura salva em [`/salvos`](C:/Projetos/VR%20Abandonada/app/salvos/page.tsx)
- acompanhar local em [`/acompanhar`](C:/Projetos/VR%20Abandonada/app/acompanhar/page.tsx)

O uso no celular deixa de ser só navegação e vira retorno recorrente.

## Como as camadas se cruzam

A arquitetura atual permite cruzamentos reais entre:
- pauta
- memória
- acervo
- coleção
- dossiê
- campanha
- impacto
- eixo
- território
- ator
- padrão
- edição
- cronologia
- marco curado
- share pack
- salvos
- acompanhar
- busca

Isso significa que o projeto já funciona como ecossistema, não como lista de páginas independentes.

## O que mudou em relação às primeiras etapas

No início, o projeto precisava provar existência editorial.
Agora ele precisa provar hierarquia, recorrência e circulação.

A evolução foi esta:
- primeiro, home e pautas
- depois, memória, acervo e coleções
- depois, dossiês vivos e updates
- depois, eixos, radar e métodos de participação
- depois, impacto, territórios, atores e padrões
- depois, edições, share packs e export visual
- depois, PWA com offline, salvos e acompanhamento local
- depois, busca transversal e linha do tempo viva
- por fim, marcos centrais como leitura histórica curada acima da cronologia ampla

## Estado atual do produto

Hoje o VR Abandonada já responde a perguntas diferentes de forma estruturada:
- o que está acontecendo agora?
- por onde começar?
- como participar?
- como confiar no método?
- o que mudou?
- o que importa?
- quem aparece sempre?
- onde isso acontece?
- como isso se repete no tempo?
- como circular essa leitura fora do site?
- como voltar depois no celular?

Esse conjunto já sustenta um projeto editorial vivo e territorialmente enraizado.

## Limitações atuais

- A camada de marcos centrais ainda depende de curadoria manual.
- A cronologia ampla ainda é a base principal; os marcos são uma camada editorial por cima.
- A busca ainda é textual e editorial, não vetorial.
- O PWA ainda não tem push, sync em nuvem ou recomendações automáticas.
- A circulação ainda depende de escolha editorial humana, não de automação social.
- Há alguns warnings de lint em módulos compartilhados antigos, sem quebrar compilação.

## Próximos passos recomendados

1. Refazer o diagnóstico da cronologia para apontar melhor origem, ruptura e consequência.
2. Melhorar a exposição dos marcos centrais em home, radar e acompanhamento.
3. Criar uma curadoria mais explícita de marcos por campanha e por caso.
4. Dar mais peso para a camada de circulação recorrente no PWA.
5. Reduzir warnings antigos nos módulos compartilhados da timeline.
6. Expandir o uso de cards exportáveis para campanhas e impactos mais urgentes.
7. Continuar alimentando as camadas já existentes com dados reais e revisão editorial.
