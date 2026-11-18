# Fábrica Aço Gráfico v0.41 — laboratório privado de mídia

**03/11/2026. PR #44 (rascunho). Não publicado.**

## Decisão de escopo
Na fase atual, o objetivo é aprimorar a fábrica de vídeos e testes de montagem/animação com o maior número possível de imagens, vídeos, sons e documentos reais acessíveis. **A falta de comprovação de direitos de publicação não impede um experimento privado.** Direitos de reutilização pública ficam para uma etapa separada, caso a equipe decida publicar.

O laboratório não implementa bypass de DRM, invasão de contas, distribuição de filmes completos nem postagem automatizada. A origem declarada e a função jornalística de cada imagem continuam necessárias para não criar falsas evidências.

## Mudança implementada
- `archive_rights_gate_v40.py`: duas finalidades explícitas: `internal_research` (padrão, aceita arquivo local independentemente da licença de publicação) e `public_release` (exige liberação separada e revisão editorial).
- `private_media_ingest_v41.py`: importa fotos, filmes e gravações locais para pasta privada; faz cópia atômica e SHA-256, preserva ano/origem/identificação, grava recibos. Registra `publication_approved=false` e `upload_to_public_repo=false`.
- `tests/test_archive_rights_gate_v40.py` e `tests/test_private_lab_v41.py`: 18 testes locais aprovados, incluindo uso interno com licença pendente, checagem de hash, importação idempotente, respeito a datas e bloqueio separado de distribuição.
- Workflow de CI sem mídia de terceiros ou downloads externos, para testar o código sem distribuí-la em artefatos do repositório.

## Ensaio com arquivos reais
O importador local recebeu com sucesso:
1. arquivo de filmagem siderúrgica francesa de 2011, 2.095.117 bytes, sha256 `bcb29366bccab34b03abff5b2ae2fe0b106514d1342e160625a9fe4c7e59a7c8`;
2. fotografia do interior da CSN, 1969, 742.278 bytes, sha256 `2c5ee05164cadb06cc438faceaa4c37c6985d1e375ec4b0a4698464488b0a325`.

Ambos ficaram em cofre local `private_assets/`, com status de direitos para publicação `pending`. **Nenhum arquivo de mídia foi commitado no GitHub**. O teste comprova ingestão de arquivos reais, não que o filme de 1953 tenha sido obtido.

## Filme ainda a captar
*Cinemateca Brasileira, O Minério e o Carvão (1953), catálogo 013614*:
https://www.bcc.org.br/filmes/443375 .
O registro oficial confirma a existência de cenas da usina e do transporte de minério/carvão; **não houve transferência da cópia do documentário** nesta rodada. Quando uma cópia estiver acessível sem contornar proteções, ela pode entrar no cofre como fonte de ensaio privado, com o mesmo protocolo dos arquivos acima.

## Próximo ensaio tecnológico
Executar testes com diferentes tipos de fonte — filme 4:3, cinejornal P&B, entrevista, vídeo de rua, documento filmado, plano geral e arquivo de áudio — e medir legibilidade, velocidade das transições, cortes por palavra e montagem em camadas. A identidade Aranhaverso-brutalista é **animação/movimento narrativo**, não apenas uma paleta.

**Notas artísticas e de processo:** mantidas; esta rodada implementa método e ingestão, não uma nova peça artística julgada.
