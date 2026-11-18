# Fábrica Aço Gráfico v0.21 — acesso a imagens históricas REAIS de Volta Redonda

**02/11/2026 · Projeto VR Abandonada · PR #44 (draft) · nenhuma publicação**

## Nova descoberta com referência documental exata

O Arquivo Nacional publicou em 06/11/2023 o artigo [Uma invasão registrada em vídeo](https://querepublicaeessa.an.gov.br/index.php/que-republica-e-essa/assuntos/temas/78-secoes-anteriores/66-filme/487-uma-invasao-registrada-em-video), que identifica a filmagem **BR_RJANRIO_FJ_0_FIL_0001_0003**, do **Fundo Ernesto Germano Parés (FJ)**, como imagens da greve dos funcionários da Companhia Siderúrgica Nacional e da ocupação militar de Volta Redonda em novembro de 1988. Cita um segundo vídeo correlato, sem notação individual confirmada na mesma referência.

Esse é o **primeiro alvo de aquisição**, porque oferece ações reais e contexto local de forte importância histórica. Não é prova de que a filmagem possa ser livremente editada ou reproduzida. A página pode apresentar vídeo para consulta, sem permitir reaproveitamento.

O [instrumento do fundo](https://www.gov.br/arquivonacional/pt-br/servicos/copy_of_instrumentos-de-pesquisa/pars-final-6-nov.pdf) registra imagens em movimento de 1988 e condições de acesso **com restrição, acessível por meio eletrônico**. Não confundir acesso ao documento com autorização de uso em um Reel.

## Caminho real para solicitar uma cópia

O procedimento do Arquivo Nacional, atualizado em 09/04/2026, permite solicitar cópias pelo [Módulo de Atendimento à Distância](https://consulta.an.gov.br/) e determina a assinatura do **Termo de utilização de documento custodiado** para reproduções de vídeos, fotos e áudio. Pode haver cobrança via GRU; não presumir preço. [Fonte oficial](https://www.gov.br/arquivonacional/pt-br/servicos/atendimento/reproducao-e-transcricao-de-documentos).

Canais institucionais para consulta: **saladeconsultas@arquivonacional.gov.br**, no [FAQ](https://www.gov.br/arquivonacional/pt-br/acesso-a-informacao/perguntas-frequentes), e **consultas@arquivonacional.gov.br**, no instrumento de pesquisa [Guia de Fundos e Coleções — Imagens em Movimento](https://www.gov.br/arquivonacional/pt-br/servicos/copy_of_instrumentos-de-pesquisa/GuiadeFundoseColeesImagensemMovimento.pdf). Confirmar canal operacional antes de iniciar o atendimento. A solicitação não foi protocolada ou enviada.

### Pedido técnico e editorial — texto preparado, não enviado

Assunto: Solicitação de acesso, cópia e condições de reprodução de filme do Fundo Ernesto Germano Parés — BR_RJANRIO_FJ_0_FIL_0001_0003

Prezada equipe do Arquivo Nacional,

Produzimos conteúdo documental e jornalístico sobre a história do trabalho e da cidade de Volta Redonda (RJ), incluindo a memória dos trabalhadores da CSN. Identificamos em publicação institucional de 06/11/2023 a filmagem de notação **BR_RJANRIO_FJ_0_FIL_0001_0003**, pertencente ao Fundo Ernesto Germano Parés (FJ), que registra a greve de novembro de 1988 e a ocupação militar da cidade.

Solicitamos, por gentileza:

1. Orientações para o visionamento integral e para obtenção de cópia digital no melhor formato/resolução disponíveis, com metadados de origem, tempo total e autoria/produção, se conhecidos.
2. Identificação e notação do **segundo vídeo** sobre o episódio mencionado na mesma publicação.
3. Informações sobre titularidade de direitos e possibilidade de empregar **breves trechos com cortes, legendas e tratamento gráfico identificado**, sem alterar o sentido factual, em Reels documentais nas redes sociais e no projeto VR Abandonada, inclusive publicações acessíveis gratuitamente.
4. Regras de atribuição, eventuais restrições de uso, termo de utilização, custos e procedimento de formalização, para eventual solicitação regular.

Não solicitamos autorização tácita nem consideramos o conteúdo da página livre de direitos. Nosso objetivo é preservar os créditos e os arquivos originais, acompanhados de contexto e referências verificáveis.

Agradecemos as orientações.

Equipe editorial — VR Abandonada

## Outras fontes qualificadas

- [NPC — Volta Redonda: Memorial da Greve (1989)](https://nucleopiratininga.org.br/volta-redonda-memorial-de-greve-2/), direção Eduardo Coutinho e Sérgio Goldenberg, realização Diocese de Barra do Piraí e Volta Redonda. O conteúdo usa trechos de arquivos de terceiros: licenciar segmentos individualmente.
- [Memória Globo — Greves na CSN](https://memoriaglobo.globo.com/jornalismo/coberturas/greves-na-csn/noticia/greves-na-csn.ghtml), registros de junho de 1984 e novembro de 1988. Acesso para assistir não é licença de reutilização.
- [AEL/Unicamp — Sindicato dos Metalúrgicos de Volta Redonda](https://ael.ifch.unicamp.br/node/176), 1.636 fotografias e documentação sindical; fotografias são evidências e não substituem cenas filmadas.
- [Fundação Perseu Abramo — Greve, foto do fotógrafo Homero](https://acervo.fpabramo.org.br/index.php/greve-dos-trabalhadores-metalurgicos-da-companhia-siderurgica-nacional-csn-volta-redonda-rj-9-nov-1988-credito-homero%3Bisad?sf_culture=pt): referência de acesso com reprodução proibida sem autorização prévia. **Não reutilizar sem licença**.

## Engenharia v0.21: separação explícita de estados

Novos `studio/archive_intake_v21.py` e `examples/acervo_arquivistico_v21.json`:
- Inventário de cinco pistas com fonte, referência, custódia, data/época, propósito e situação de direitos.
- **Encontrado na web ≠ arquivo original recebido ≠ autorização de cópia ≠ autorização de remix ≠ aprovação editorial.**
- Restrições duras impedem declarar, no cadastro de pesquisa, `COPY_RECEIVED` ou `CLEARED_FOR_SPECIFIC_PROJECT` sem outro processo.
- `export_pending_catalog` entrega somente candidatos com `license_gate=pending`, sem marcar `event_verified` nem preencher falsos timestamps.
- A rotina `inspect_received_copy` confere SHA-256 e bytes quando houver arquivo recebido por via regular; o resultado continua com `rights_cleared=false` e `publication_approved=false`. Os testes usam bytes sintéticos.
- Catálogo coleções mistas separado de arquivos individuais; gravações sonoras não são declaradas filmagens.
- Nenhum download automático de material jornalístico/arquivístico protegido. Nenhum contato enviado. Nenhuma imagem histórica incorporada ao MP4.

## Critérios de filme para a v0.22

Quando houver arquivo cuja reprodução e montagem tenham condições autorizadas, investigar a sequência e o conteúdo dos planos antes de decidir a pauta: `ação → situação urbana → fonte histórica original`. Exigir contextualização de tempo e lugar, e preservar a gravidade histórica sem estilização jocosa. Não atribuir planos genéricos à CSN ou a datas sem prova. Voz Alexandre continua pendente de transferência física de áudio previamente gerado.

**A v0.21 é avanço de pesquisa e preparação de acesso, não um novo Reel.** A nota da fábrica permanece 8,14/10 e a v0.19 permanece como último ensaio audiovisual local. Sem merge ou publicação.
