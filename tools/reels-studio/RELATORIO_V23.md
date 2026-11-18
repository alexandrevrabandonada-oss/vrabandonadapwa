# Fábrica Aço Gráfico v0.23 — direção cinematográfica automatizada

**Pesquisa e implementação: 02/11/2026. PR #44 draft. Nenhum Reel publicado.**

## Mudança de prioridade

A prioridade deixa de ser ampliar relatórios de direitos/acervo e passa a ser **produção real, montagem automática, som, linguagem cinematográfica e avaliação artística no celular**. Permanecem bloqueios de publicação em código, mas a experimentação interna não fica paralisada pela investigação jurídica.

## Entrega comprovada: 2 Reels A/B

Implementado `studio/auto_director_v23.py` no repositório e exportadas duas amostras reais de **14,0 s, 540×960, 24 fps, H.264/AAC**, geradas com o mesmo motor, sete gramáticas visuais e batidas musicais em **120 BPM**:

- **V23_EXPRESSIVO.mp4:** laranja energético, contrastes fortes e ritmo mais intenso; QA medido na renderização local: **−18,9 LUFS / −1,8 dBTP**.
- **V23_CONTIDO.mp4:** cor fria, tratamento mais editorial; QA local: **−18,4 LUFS / −2,3 dBTP**.
- O programa `studio.qa_v18` aprovou dimensões, framerate, presença de áudio e black frames amostrados para ambas as variantes. O artefato interno desta conversa foi `VR_FABRICA_REELS_V23_AB_CINEMA.zip`, contendo as duas variantes, contato A/B, JSONs, notas e QA.

### Fontes **realmente usadas**

- Fotografia CSN em **Volta Redonda, 2014**, por HenriqueBarraMansa, arquivo `CSN01.jpg` / Commons; plano de contextualização territorial.
- Vídeo **real de siderurgia na França, 2011**, por Damien Vicart, `Vicart - Aciérie.webm`, arquivo Commons com SHA-1 `c1129cac8654866856c7bec31196206f16eac6c7`. Este vídeo demonstra ação industrial e não é afirmado como registro da CSN.
- Música industrial **original sintetizada em laboratório**; não é som captado na usina nem trilha comercial. Sem inventar testemunhos, imagens ou eventos.

## Capacidade nova do motor

- Sete planos/composições editoriais distintos num só Reel; cortes em batidas musicais, câmera virtual parametrizada, hierarquia tipográfica expressiva e duas assinaturas A/B.
- Rótulos de procedência específicos para foto de 2014 em VR e vídeo de 2011 francês. Exige SHA e metadados para usar originais.
- Com opção `--voice`, mede a duração real via FFprobe e estende o último plano conforme necessário para não cortar voz. Não presume alinhamento palavra por palavra.
- EBU R128, limiter e QA de alto-falantes; script não pressupõe que passar no QA é prova de beleza artística.
- Testes novos `tests/test_auto_director_v23.py` com nove cenários (cortes, composição, provenance, duração e defesa de mixagem). `Reels Studio isolated CI` testou 136 cenários, 1 skip, após correção de fonte ausente no GitHub runner, no run **41564774615** (**success**).

## Narrador Alexandre: geração real, integração ainda incompleta

No conector ElevenLabs da própria conta foi gerada uma única tomada no clone profissional Alexandre (`uM5sFrRJkaxDKSD5SLWM`) com roteiro de distinção de fontes:
> Volta Redonda tem memória. Aqui, a CSN em dois mil e quatorze. As cenas de siderurgia vêm de um arquivo francês. Nossa tarefa é transformar imagens em histórias, sem apagar sua origem.

A síntese retornou **14,071 s** e consumiu **183,9816 créditos ElevenLabs**. Flow `kyxg6hlu1YvywVBXNdFQ`, geração `tTaWVNJWncvWAk4CoyUd`. É produção real de áudio, mas **o arquivo MP3 não chegou ao renderizador** porque a URL assinada do conector não foi transferida para o ambiente local. Nenhum dos dois MP4 contém a voz profissional; a sincronização da narração não foi testada nem declarada aprovada. Não gerar novamente a mesma narração sem necessidade.

## Integração automática pronta em código, não executada em produção

Novo `studio/voice_bridge_v23.py` usa o endpoint público documentado da ElevenLabs `POST /v1/text-to-speech/{voice_id}/with-timestamps`: retorna áudio em base64 e timestamps de caracteres, transformados em timestamps de palavras e arquivos JSON. O bridge exige `--generate` **e** a variável secreta `ELEVENLABS_API_KEY`; por padrão não gasta créditos, não reenvia o mesmo pedido quando há cache SHA256, não repete chamadas por erro e mantém registro de duração e hash do arquivo. Testes `tests/test_voice_bridge_v23.py` cobrem extração de palavras, incompatibilidade temporal, ausência de autorização/chave e cache que evita re-geração. A autenticação direta da API é pendência operacional, não fornecida pelo conector criativo.

## O que falta para nos aproximar de Reels 10/10

1. Transferir com segurança o MP3 de 14,07 s já gerado ou fornecer acesso direto ao endpoint de narração com timestamps, **sem gastar créditos duplicados**.
2. Produzir uma versão narrada e legendar por word timing real; testar mix em celular e loudness de voz com a trilha.
3. Aumentar repertório de cenas com **movimento real local** e mix de fotos/documentos, não só contexto internacional.
4. Comparar as variantes com revisão humana cega, pelo menos três pautas com imagens diferentes e análise de retenção/legibilidade; iterar continuamente em cima de critérios verificáveis.
5. Testar master 1080×1920, ritmo, tipografia, CTA e conformidade às áreas seguras de Instagram, preservando os fatos.

**Status editorial:** 2 Reels A/B internos renderizados, sem locução, não publicados, nem avaliados por público. CI está separado da avaliação estética; nota legada da capacidade da fábrica **8,14/10**, e **não** se afirma “Reel 10/10”.
