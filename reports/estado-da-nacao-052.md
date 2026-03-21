# Estado da Nação 052

A camada de leitura assistida foi refinada para conviver melhor com o fluxo real do app, especialmente no celular.

O que foi implementado
- o assistente passou a trabalhar com dois estados claros: painel recolhido e expandido
- entrou um mini-player fixo com ações rápidas de `Ouvir`, `Pausar`, `Parar` e `Abrir painel`
- a leitura continua por seções, com destaque do trecho ativo e retomada local
- o modo baixa visão continua integrado à mesma superfície

Como ficou o painel recolhível
- o painel agora pode ficar recolhido sem sumir da tela
- o estado recolhido reduz o peso visual no topo e evita disputar espaço com a leitura principal
- o estado expandido abre os controles completos, contexto e seção atual
- a preferência de abertura fica salva localmente no aparelho

Como ficou o mini-player
- o mini-player aparece como uma barra curta e fixa, pronta para tocar rápido no celular
- ele traz os controles essenciais sem obrigar a abrir o painel completo
- a pessoa pode pausar, retomar, parar e abrir o painel de leitura quando precisar
- quando a leitura está ativa, o mini-player passa a funcionar como ponto de controle contínuo

Como a lógica de exibição foi resolvida
- o mini-player é a superfície constante
- o painel expandido aparece quando há intenção de leitura mais detalhada
- o evento explícito de abrir a leitura assistida continua funcionando a partir do shell
- o estado é local e previsível entre páginas públicas

Como a persistência local funciona
- a preferência de painel aberto/fechado fica salva no dispositivo
- a velocidade de leitura continua salva localmente
- a posição por página continua sendo lembrada localmente
- não há login nem sincronização em nuvem

Como a leitura assistida ficou mais leve no fluxo
- o topo da página não fica mais tão carregado quando a pessoa não precisa do painel aberto
- o mini-player oferece acesso rápido sem ocupar a primeira dobra inteira
- o uso com baixa visão segue disponível, mas com menos ruído visual
- a convivência com navegação, hero e CTAs ficou mais equilibrada

Páginas priorizadas para validação
- home
- `/agora`
- `/acompanhar`
- `/edicoes/[slug]`
- `/dossies/[slug]`
- `/campanhas/[slug]`
- `/impacto/[slug]`
- `/memoria/[slug]`

Arquivos alterados
- [`components/reading-assistant.tsx`](C:/Projetos/VR%20Abandonada/components/reading-assistant.tsx)
- [`app/globals.css`](C:/Projetos/VR%20Abandonada/app/globals.css)

Validação
- `npm run lint` passou
- `npm run build` passou
- `npm run typecheck` passou

Limitações atuais
- a leitura ainda depende do TTS nativo do navegador/dispositivo
- a leitura por seções depende da estrutura do HTML público de cada página
- o mini-player é intencionalmente simples; não há fila longa, catálogo de vozes nem export de áudio

Próximos passos recomendados
- observar o comportamento do mini-player em uso real no mobile para decidir se o painel deve vir aberto em alguma superfície específica
- revisar se páginas muito longas precisam de uma marcação estrutural ainda mais fina para melhorar a leitura por blocos
- testar a convivência do mini-player com o bottom nav em aparelhos menores

