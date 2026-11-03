# Fábrica Aço Gráfico v0.22 — filme verdadeiro da CSN em 1953 e palco de arquivo sem recorte

**02/11/2026 · pesquisa documental e engenharia · NÃO É REEL PUBLICADO · PR #44 draft**

## Principal descoberta, mais pertinente que as amostras anteriores

A Cinemateca Brasileira registra o filme **O MINÉRIO E O CARVÃO** (**código 013614**, **Série Volta Redonda**, 1953, Humberto Mauro, direção; José A. Mauro, fotografia, produção Ministério da Educação e Cultura / INCE). O filme de não-ficção em preto e branco tem duração catalográfica de aproximadamente **12 minutos**, original em 35 mm / 24 quadros por segundo. A ficha descreve vistas da cidade e do complexo CSN, chegada de trem carregado, pesagem de vagões, descarregamento de carvão e transporte de minerais por esteiras.

**Fontes primárias:** [ficha filmográfica da Cinemateca](https://bases.cinemateca.org.br/cgi-bin/wxis.exe/iah/?IsisScript=iah%2Fiah.xis&base=FILMOGRAFIA&exprSearch=ID%3D013614&format=detailed.pft&lang=p&nextAction=lnk) · [registro BCC com opção de visionamento](https://www.bcc.org.br/filmes/443375).

O filme é provavelmente uma fonte muito superior em **ação industrial realmente filmada em Volta Redonda** à entrevista da Rodovia do Contorno de 2017. Contudo, a descrição de cenas vem de **sinopse oficial**, não de inspeção integral de frames pela fábrica: não inventar tempos, distância de câmera, planos específicos, trabalhadores visíveis ou continuidade de cada ação.

### Natureza editorial do acervo

- **Filme 013614 (1953):** imagem histórica real da atividade siderúrgica, sujeito prioritário. A descrição explicita trens, carvão e esteiras; o número de planos e a duração de cada trecho são desconhecidos.
- **Cine Jornal Brasileiro V.2 N.012 (014181, 1941):** referência contextual da Cinemateca com nexo à CSN; não presumir que toda sequência mostra o interior da UPV.
- **Milagre do Desenvolvimento (028619, 1968):** filme de **animação educativa**, não registro fotográfico de operações da CSN. Poderá servir como documento de propaganda/ideário de época, **jamais** como imagem factual de trabalhadores operando máquinas.
- **Arquivo Nacional — FJ_0_FIL_0001_0003 (1988):** registro histórico de greve e presença militar citado na publicação institucional do AN; outro eixo de pesquisa, com direitos e cópia pendentes.

Índice: [Filmes com assunto CSN catalogados no BCC](https://bcc.org.br/assuntos-de-filmes/csn-companhia-sider%C3%BArgica-nacional).

## Direito autoral e aquisição: bloqueio não negociável

O [Termo de Uso do BCC](https://www.bcc.org.br/termo-de-uso) declara que o visionamento não libera reprodução, distribuição, modificação nem obras derivadas e orienta contato com **atendimento@cinemateca.org.br**. O [serviço oficial de licenciamento](https://www.gov.br/pt-br/servicos/obter-licenciamento-de-conteudos-de-titularidade-da-cinemateca-brasileira-cb?id=13611&origem=servico) exige identificação dos trechos, finalidade, direitos e eventualmente proposta contratual e pagamento. Não afirmar que obra produzida por órgão público está automaticamente livre de direitos: titularidade, natureza da obra, condições de cópia e eventuais direitos de terceiros exigem confirmação.

**Realizado nesta rodada:** rascunho de Gmail preparado na conta editorial do VR Abandonada para pedir cópia/visionamento, condições de edição e licenciamento da obra 013614 e outros filmes da série. **Não enviado, não protocolado, sem resposta.**

## Engenharia entregue no ramo da PR #44

- `examples/fontes_industriais_v22.json` com quatro candidatos e quatro **hipóteses de planos** documentadas pela sinopse de 1953. Nenhuma contém timestamp ou falso status de visualização.
- `studio/archival_storyboard_v22.py`: registra as hipóteses, recusa fontes que se declarem licenciadas sem processo próprio, recusa planos de animação como ação física e não cria timecodes falsos; um cutlist verificado ainda **não autoriza renderização**.
- `studio/archival_stage_v22.py`: mantém o fotograma original inteiro num palco vertical 540×960; só os grafismos ao redor se movem. Exibe data, código da fonte e disclosure. Teste em pixels confirma preservação da área da fonte, sem zoom que destrua conteúdo histórico.
- `tests/test_v22.py` com regressão de enquadramento, fontes, restrição de licença, textos de sinopse e falsificação de ação histórica.
- Workflow `.github/workflows/reels-studio-v22-archive-stage.yml`: executa testes, exporta ideias sem timecodes e gera um quadro **100% sintético** (círculo e linhas) apenas para provar integridade visual. **Não representa a CSN**, não é produto artístico, não foi combinado com arquivo protegido e não está pronto para postar.

**Verificado:** [GitHub Actions execução 41559538411](https://github.com/alexandrevrabandonada-oss/vrabandonadapwa/actions/runs/41559538411) concluída com sucesso; `v22-archival-storyboard-without-restricted-media` gerado como artefato interno.

## Avaliação crítica da arte da v0.22

A imagem sintética é um **teste de composição extremamente elementar**, com título, moldura, cores da identidade e imagem em escala correta. Não satisfaz a direção Aço Gráfico cinematográfica: não possui textura real de película, variação de planos, ação relevante, hierarquia de movimento ou narração. Não deve ser promovida a prova visual 10/10 nem a novo Reel. A regra de preservar originais históricos *funciona*; a criação artística de alto nível ainda depende do filme original e de uma direção mais rica.

## Próxima estação real

1. Receber orientação da Cinemateca e obter cópia licenciada ou autorização documentada da reprodução/montagem, sem presumir que o filme acessível é livre.
2. Assistir e decupar por **ação real e ritmo**, anotando segundos exatos para trem → vagões → carvão → esteiras apenas se os planos existirem no material recebido.
3. Montar três tratamentos cinematográficos diferentes, construídos a partir dos planos efetivamente observados. Identificação: **1953**, não "CSN 1962".
4. Sincronizar locução já existente de Alexandre quando o arquivo real estiver disponível; sem regenerar voz para provar metadados.
5. Exportar MP4 em alta qualidade, verificar direitos, mixagem, QA e avaliação humana em celular antes de pontuar estética.

## Contabilidade honesta

Capacidade previamente autoavaliada da fábrica **8,14/10** continua igual; v0.22 tem ganho de acervo documentado e proteção editorial, **não um Reel artisticamente melhor**. Nenhum master final, vídeo industrial arquivístico, voiceover ou publicação foi concluído. O PR permanece draft, sem merge.
