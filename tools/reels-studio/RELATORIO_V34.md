# Aço Gráfico v0.34 — a identidade está na coreografia

**03/11/2026. PR #44 draft. Estudo local, sem merge/publicação.**

O objetivo desta rodada é testar a referência Aranhaverso-brutalista como **linguagem autoral de animação**, e não como paleta ou filtro. O núcleo versionado em `studio/choreography_v34.py` define oito gestos, deslocamentos opostos, chegada com antecipação, repouso, câmera em 30 fps e poses gráficas em 15 fps. `tests/test_choreography_v34.py` testa esses princípios; o workflow de testes é `.github/workflows/reels-studio-v34-motion.yml`.

## Prévia audiovisual local realmente produzida

Duas versões de **14,5 s / 540 × 960 / 30 fps / H.264/AAC**, com exatamente as mesmas fontes e as mesmas cores, variando apenas **amplitude e timing**:

- **Cinética:** maior amplitude, entradas rápidas, oito métodos de animação.
- **Contida:** entradas mais lentas e repousos mais longos.

No pacote local `VR_FABRICA_ACO_GRAFICO_V34_MOVIMENTO_AB.zip` estão motor Python `motion_director_v34.py`, suporte separado `motion_base_v34.py`, auditor `motion_qa_v34.py`, testes, MP4s, folhas de contato e manifestos. Esses módulos de renderização **não estão todos no PR**; o PR integra o núcleo reutilizável de coreografia e sua suíte, com o renderizador completo fornecido no pacote local.

**Teste local**: 13 testes aprovados, QA técnico aprovado, -17,6 LUFS / -2,8 dBTP para a versão A. Média de **30,5% de pixels diferentes** entre amostras correspondentes das duas versões, apesar de a paleta ser idêntica. Alteração visual não é teste de engajamento, retenção nem certificação estética.

## Proveniência e limites

Fotos da CSN de 1941, 1969 e 2014 são registros históricos reais. Para a demonstração local, o movimento siderúrgico de 2011 na França é **recortado de um master v0.31 anterior**, não dos bytes originais da filmagem francesa. Cada plano retém seu crédito, sem fingir que as imagens industriais estrangeiras mostram a CSN.

As legendas usam 32 timestamps reais da tomada Alexandre de 14,071 s. **A voz não está audível**: o conector mostrou URL temporária, mas o MP3 existente não foi transferido. A trilha é sintética original de laboratório, não som ambiente da usina. Não gerar novamente a mesma fala.

## Notas internas conservadoras

- **Arte Reel A: 7,45/10**; **B: 7,35/10**, como *estudos de direção de animação*.
- **Fábrica: 8,86/10 provisório após CI** (+0,03 sobre a v0.33), por núcleo de animação testável e verificação visual.
- Referência anterior **master Full HD v0.33: 7,71/10**. O estudo local v0.34 não substitui aquele master em 1080×1920.
- Notas estimadas internamente, sem revisão humana independente ou teste com público. CI comprova integração de código, não qualidade artística.

**Pendente:** CI novo aprovado; motor completo integrado e reproduzido com fonte original em Full HD; transferência do áudio Alexandre; filmagens em movimento da região; revisão artística humana.
