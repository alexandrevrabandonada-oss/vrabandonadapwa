# Estado da Nação 020

## O que foi implementado
- Nova área pública de participação em `/participe`.
- Páginas públicas individuais em `/participe/[slug]`.
- Painel interno leve em `/interno/participe`, `/interno/participe/novo` e `/interno/participe/[id]`.
- Nova modelagem persistida para caminhos de participação.
- Integração da home com um bloco curto de colaboração.
- Ponte reforçada entre participação, `/envie`, `/apoie`, `/memoria`, `/acervo`, `/agora` e `/comecar`.

## Como a modelagem funciona
A camada usa duas tabelas simples:

- `participation_paths`: representa o caminho público de colaboração.
- `participation_path_items`: representa os passos editoriais de cada caminho.

Campos principais da rota:
- `title`
- `slug`
- `excerpt`
- `description`
- `audience_label`
- `featured`
- `public_visibility`
- `sort_order`
- `status`

Campos principais dos passos:
- `item_type`
- `item_key`
- `role`
- `sort_order`
- `note`

Os papéis editoriais mantêm o percurso simples:
- `start`
- `context`
- `proof`
- `deepen`
- `follow`

## Como ficou `/participe`
A página pública organiza a participação por gesto:
- enviar pista, relato ou documento
- apoiar o projeto
- colaborar com memória e acervo
- acompanhar e compartilhar o que está em curso

Ela mostra rotas curatoriais curtas e um bloco de caminhos diretos para o visitante entender qual ação faz mais sentido.

## Como ficou `/participe/[slug]`
A página individual mostra:
- abertura forte
- público-alvo da rota
- peça principal
- sequência guiada
- próximos passos para continuar o percurso no site

A ideia é converter leitura em ação sem virar menu frio de links.

## Como a home passou a apontar essa camada
A home ganhou um bloco de participação curto com rotas de colaboração em destaque.
Esse bloco aparece como continuação natural da leitura do projeto, logo depois da entrada pelo conteúdo.

## Como apoio, envio e acervo passaram a conversar melhor
- `/participe` agora organiza a decisão antes do clique.
- `/envie` continua sendo o canal de entrada para pista, relato e documento.
- `/apoie` passa a dialogar com a rota de participação em vez de ficar isolado.
- `/memoria` e `/acervo` entram como caminhos claros para quem quer colaborar com o arquivo vivo.

## Como a conversão em participação foi fortalecida
O visitante não precisa escolher sozinho entre várias páginas soltas.
Agora ele encontra:
- um hub de participação
- uma página para cada gesto principal
- CTA coerente ao final da leitura
- ponte direta para enviar, apoiar, preservar e acompanhar

## Limitações atuais
- Ainda não há curadoria automática por perfil de visitante.
- Ainda não há personalização ou recomendação baseada em comportamento.
- Ainda não há fila de moderação ou respostas estruturadas para material enviado.
- A edição dos caminhos é manual e leve.

## Próximos passos recomendados
- Criar um caminho de participação focado em colaboração com acervo/memória ainda mais explícito.
- Melhorar a superfície de apoio quando o fluxo financeiro estiver fechado.
- Se fizer sentido, criar uma chamada fixa de participação na home para campanhas temporárias.
- Avaliar uma pequena página de confirmação pós-envio para orientar o próximo passo do visitante.