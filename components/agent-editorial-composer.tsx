"use client";

import { useMemo, useState } from "react";

type Mode = "noticiar" | "investigar" | "redigir" | "revisar";
const modeLabels: Record<Mode, string> = {
  noticiar: "Preparar notícia a partir de post ou relato verificado",
  investigar: "Investigar uma pauta",
  redigir: "Preparar uma matéria",
  revisar: "Revisar para publicação",
};

export function AgentEditorialComposer() {
  const [mode, setMode] = useState<Mode>("noticiar");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [sources, setSources] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const prompt = useMemo(() => {
    const action = mode === "noticiar"
      ? "Transforme a legenda, post, documento ou relato público em NOTÍCIA para o site, com título factual, lide (quem/o quê/quando/onde), contexto breve, fontes e ressalvas. Classifique kind=news, preserve o link do Instagram se fornecido, sem depender da Meta. Exiba versão revisável para minha aprovação explícita antes de publicar."
      : mode === "investigar"
      ? "Investigue esta pauta, confira as fontes externas disponíveis, identifique lacunas, contraditório e perguntas verificáveis. Não publique."
      : mode === "redigir"
        ? "Prepare uma matéria jornalística completa e revisável para o VR Abandonada, com título, subtítulo, contexto, fatos verificáveis, incertezas, fontes, SEO e sugestão de capa. Não publique antes de eu aprovar a versão final."
        : "Audite a matéria e suas fontes, confira datas, nomes, provas, riscos de privacidade e contraditório; apresente alterações e o texto final para minha aprovação expressa. Só publique no site depois de eu autorizar esta versão exata.";

    return [
      "PROJETO: VR Abandonada — https://www.vrabandonada.online/",
      "ATUAÇÃO: você é meu agente editorial, com GitHub e Vercel conectados.",
      "TIPO DE SOLICITAÇÃO: " + modeLabels[mode],
      "AÇÃO: " + action,
      "PAUTA / TÍTULO: " + subject.trim(),
      "MATERIAL / CONTEXTO FORNECIDO:",
      context.trim() || "(nenhum material anexado neste pedido)",
      "FONTES E DOCUMENTOS PÚBLICOS:",
      sources.trim() || "(pesquisar e pedir validação se necessário)",
      "RESTRIÇÕES / CUIDADOS:",
      restrictions.trim() || "Não expor fontes, testemunhas ou informações privadas.",
      "PROTOCOLO OPERACIONAL:",
      "1. Separar comprovado, relatado, hipótese e pergunta em aberto. Não inventar declarações, provas ou imagens.",
      "2. Conferir links e datas; incluir a resposta dos envolvidos quando disponível, ou registrar a tentativa/pendência.",
      "3. Quando o pedido for publicável, preparar uma versão que possa ir a content/materias/<slug>.json; usar o modelo já existente, sem conteúdo fictício.",
      "4. Só após minha aprovação textual explícita, usar o conector GitHub para abrir/atualizar a PR, validar CI/preview e integrar, observando as permissões.",
      "5. Confirmar Vercel READY e URL canônica; checar SEO, sitemap e feed quando acessíveis; nunca afirmar indexação no Google sem prova.",
      "6. Não alterar banco Supabase, buckets, credenciais nem a PR #7; não depender de tokens da Meta.",
      "7. Relatar: ENTREGUE, VERIFICADO, PENDENTE e PRÓXIMO MOVIMENTO.",
    ].join("\n\n");
  }, [mode, subject, context, sources, restrictions]);

  async function copyBrief() {
    setError("");
    setCopied(false);
    if (subject.trim().length < 8) {
      setError("Escreva um tema ou título com pelo menos oito caracteres.");
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setError("Seu navegador não autorizou copiar automaticamente. Selecione e copie o comando abaixo.");
    }
  }

  return (
    <section className="agente-composer" aria-labelledby="agente-preparar">
      <div className="agente-composer__heading">
        <p className="eyebrow">Preparar comando para o agente</p>
        <h2 id="agente-preparar">Uma pauta. Um comando. Uma entrega.</h2>
        <p>O material fica neste dispositivo até você copiá-lo. O formulário não salva rascunhos nem envia informações automaticamente ao ChatGPT.</p>
      </div>
      <div className="agente-composer__fields">
        <label htmlFor="agent-mode">O que vamos fazer?</label>
        <select id="agent-mode" value={mode} onChange={(e) => { setMode(e.target.value as Mode); setCopied(false); }}>
          {Object.entries(modeLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
        </select>

        <label htmlFor="agent-subject">Tema ou título da pauta</label>
        <input id="agent-subject" value={subject} maxLength={180} onChange={(e) => { setSubject(e.target.value); setCopied(false); }} placeholder="Ex.: Obra da Rua 33 — contratos e atrasos" />

        <label htmlFor="agent-context">Texto, legenda ou contexto já disponível</label>
        <textarea id="agent-context" value={context} onChange={(e) => { setContext(e.target.value); setCopied(false); }} rows={5} maxLength={40000} placeholder="Cole aqui apenas material adequado para revisão editorial. Não cole denúncias sigilosas ou contatos privados." />

        <label htmlFor="agent-sources">Links de fontes públicas e documentos</label>
        <textarea id="agent-sources" value={sources} onChange={(e) => { setSources(e.target.value); setCopied(false); }} rows={3} maxLength={15000} placeholder="Um link por linha; indique o que cada fonte comprova." />

        <label htmlFor="agent-guardrails">Observações editoriais (opcional)</label>
        <textarea id="agent-guardrails" value={restrictions} onChange={(e) => { setRestrictions(e.target.value); setCopied(false); }} rows={2} maxLength={4000} placeholder="Pontos ainda não comprovados, cuidado com nomes, contraditório pendente..." />
      </div>

      <div className="agente-composer__actions">
        <button type="button" className="button" onClick={copyBrief}>Copiar comando editorial</button>
        <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="button-secondary">Abrir ChatGPT ↗</a>
      </div>
      {copied && <p role="status" className="agente-composer__success">Comando copiado. Cole na conversa em que estamos trabalhando para eu executar a próxima etapa.</p>}
      {error && <p role="alert" className="agente-composer__error">{error}</p>}
      <details className="agente-composer__preview">
        <summary>Ver o comando que será copiado</summary>
        <pre>{prompt}</pre>
      </details>
    </section>
  );
}
