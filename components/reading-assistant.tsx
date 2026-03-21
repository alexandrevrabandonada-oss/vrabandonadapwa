"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import {
  collectReadingAssistantSections,
  getLowVisionStorageKey,
  getReadingAssistantOpenKey,
  getReadingAssistantRateKey,
  getReadingAssistantStorageKey,
  isA11yPublicPath,
  type ReadingAssistantSection,
} from "@/lib/a11y/tts";

const RATES = [0.9, 1, 1.15, 1.3] as const;

function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function formatRate(rate: number) {
  if (rate <= 0.9) return "0,9x";
  if (rate === 1) return "1x";
  if (rate === 1.15) return "1,15x";
  return "1,3x";
}

function readProgress(storageKey: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { index?: number; updatedAt?: string };
    return typeof parsed.index === "number" ? parsed : null;
  } catch {
    return null;
  }
}

function saveProgress(storageKey: string, index: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ index, updatedAt: new Date().toISOString() }));
  } catch {
    // local storage is best-effort
  }
}

function clearCurrentHighlights() {
  document.querySelectorAll(".vr-reading-current").forEach((item) => item.classList.remove("vr-reading-current"));
}

function markCurrentSection(element: HTMLElement | null) {
  clearCurrentHighlights();
  if (!element) return;
  element.classList.add("vr-reading-current");
  element.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

function getTrailExcerpt(text: string) {
  return text.slice(0, 170) + (text.length > 170 ? "…" : "");
}

export function ReadingAssistant() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const [sections, setSections] = useState<ReadingAssistantSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lowVisionEnabled, setLowVisionEnabled] = useState(false);
  const [message, setMessage] = useState("Pronto para ouvir esta página.");

  const storageKey = getReadingAssistantStorageKey(pathname);
  const lowVisionStorageKey = getLowVisionStorageKey();
  const openStorageKey = getReadingAssistantOpenKey();
  const rateStorageKey = getReadingAssistantRateKey();
  const activeSection = sections[currentIndex] ?? null;

  useEffect(() => {
    if (!isA11yPublicPath(pathname)) return;

    setMounted(true);
    setSupported(isSpeechSupported());

    try {
      const storedOpen = window.localStorage.getItem(openStorageKey);
      if (storedOpen !== null) {
        setOpen(storedOpen === "true");
      }

      const storedLowVision = window.localStorage.getItem(lowVisionStorageKey);
      const lowVisionActive = storedLowVision === "true";
      setLowVisionEnabled(lowVisionActive);
      document.body.classList.toggle("vr-low-vision", lowVisionActive);

      const storedRate = window.localStorage.getItem(rateStorageKey);
      if (storedRate) {
        const parsedRate = Number(storedRate);
        if (RATES.includes(parsedRate as (typeof RATES)[number])) {
          setRate(parsedRate);
        }
      }
    } catch {
      // best effort only
    }
  }, [lowVisionStorageKey, openStorageKey, pathname, rateStorageKey]);

  useEffect(() => {
    if (!mounted || !isA11yPublicPath(pathname)) return;

    const timer = window.setTimeout(() => {
      const root = document.getElementById("conteudo");
      if (!root) {
        setSections([]);
        return;
      }

      const collected = collectReadingAssistantSections(root);
      setSections(collected);

      const saved = readProgress(storageKey);
      const nextIndex = saved ? Math.min(saved.index ?? 0, Math.max(collected.length - 1, 0)) : 0;
      setCurrentIndex(nextIndex);
      if (collected[nextIndex]) {
        markCurrentSection(collected[nextIndex].element);
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [mounted, pathname, storageKey]);

  useEffect(() => {
    if (!sections.length) return;
    const section = sections[currentIndex] ?? null;
    saveProgress(storageKey, currentIndex);
    markCurrentSection(section?.element ?? null);
  }, [currentIndex, sections, storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(openStorageKey, String(open));
    } catch {
      // best effort only
    }
  }, [open, openStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(rateStorageKey, String(rate));
    } catch {
      // best effort only
    }
  }, [rate, rateStorageKey]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const onOpenAssistant = () => {
      setOpen(true);
      window.setTimeout(() => {
        document.getElementById("a11y-reading-assistant")?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }, 0);
    };

    window.addEventListener("vr:open-reading-assistant", onOpenAssistant as EventListener);

    return () => {
      window.removeEventListener("vr:open-reading-assistant", onOpenAssistant as EventListener);
    };
  }, []);

  const stop = () => {
    if (isSpeechSupported()) {
      window.speechSynthesis.cancel();
    }

    setPlaying(false);
    setPaused(false);
    setMessage("Leitura interrompida.");
  };

  const speakSection = (index: number) => {
    if (!supported || !sections[index]) {
      setMessage("Seu navegador não oferece leitura por voz nativa.");
      return;
    }

    const section = sections[index];
    stop();
    const utterance = new SpeechSynthesisUtterance(`${section.title}. ${section.text}`);
    utterance.lang = "pt-BR";
    utterance.rate = rate;
    utterance.onstart = () => {
      setPlaying(true);
      setPaused(false);
      setCurrentIndex(index);
      setOpen(true);
      setMessage(`Lendo seção ${index + 1} de ${sections.length}: ${section.title}.`);
    };
    utterance.onend = () => {
      const next = index + 1;
      if (next < sections.length) {
        window.setTimeout(() => speakSection(next), 120);
      } else {
        setPlaying(false);
        setPaused(false);
        setMessage("Leitura concluída.");
      }
    };
    utterance.onerror = () => {
      setPlaying(false);
      setPaused(false);
      setMessage("Não foi possível ler esta seção.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!sections.length) {
      setMessage("Abra uma página pública com texto para começar a leitura por voz.");
      return;
    }

    if (playing && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      setMessage("Leitura retomada.");
      return;
    }

    speakSection(currentIndex);
  };

  const handlePause = () => {
    if (!supported || !playing || paused) return;
    window.speechSynthesis.pause();
    setPaused(true);
    setMessage("Leitura pausada.");
  };

  const handlePrevious = () => {
    if (!sections.length) return;
    const nextIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(nextIndex);
    setMessage(`Seção ${nextIndex + 1} selecionada.`);
    if (playing) {
      speakSection(nextIndex);
    }
  };

  const handleNext = () => {
    if (!sections.length) return;
    const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
    setCurrentIndex(nextIndex);
    setMessage(`Seção ${nextIndex + 1} selecionada.`);
    if (playing) {
      speakSection(nextIndex);
    }
  };

  const toggleLowVision = () => {
    const next = !lowVisionEnabled;
    setLowVisionEnabled(next);
    document.body.classList.toggle("vr-low-vision", next);
    try {
      window.localStorage.setItem(lowVisionStorageKey, String(next));
    } catch {
      // best effort only
    }
    setMessage(next ? "Modo baixa visão ativado." : "Modo baixa visão desativado.");
  };

  if (!mounted || !isA11yPublicPath(pathname)) return null;

  return (
    <Container className="a11y-reading-assistant-shell">
      <section
        id="a11y-reading-assistant"
        className={`a11y-reading-assistant ${open ? "a11y-reading-assistant--open" : "a11y-reading-assistant--closed"} ${playing ? "a11y-reading-assistant--active" : ""}`}
        aria-labelledby="a11y-reading-assistant-title"
      >
        <div className="a11y-reading-assistant__mini" aria-label="Mini-player de leitura assistida">
          <div className="a11y-reading-assistant__mini-copy">
            <p className="eyebrow">leitura assistida</p>
            <strong>{playing ? (paused ? "Pausada" : "Lendo") : "Pronta"}</strong>
            <span>{activeSection ? activeSection.title : "Abra uma página para ouvir por seções."}</span>
          </div>

          <div className="a11y-reading-assistant__mini-actions" role="group" aria-label="Controles rápidos de leitura assistida">
            <button type="button" className="button" onClick={handlePlay} disabled={!supported} aria-label={playing && paused ? "Retomar leitura por voz" : "Ouvir esta página"}>
              {playing && paused ? "Retomar" : "Ouvir"}
            </button>
            <button type="button" className="button-secondary" onClick={handlePause} disabled={!supported || !playing || paused} aria-label="Pausar leitura por voz">
              Pausar
            </button>
            <button type="button" className="button-secondary" onClick={stop} disabled={!supported && !playing} aria-label="Parar leitura por voz">
              Parar
            </button>
            <button type="button" className="button-secondary" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="a11y-reading-assistant-panel" aria-label={open ? "Recolher painel de leitura assistida" : "Abrir painel de leitura assistida"}>
              {open ? "Recolher" : "Abrir painel"}
            </button>
          </div>
        </div>

        <p className="a11y-reading-assistant__message" aria-live="polite">
          {message}
        </p>

        {open ? (
          <div id="a11y-reading-assistant-panel" className="a11y-reading-assistant__panel">
            <div className="a11y-reading-assistant__controls" role="group" aria-label="Navegação por seções e ajustes">
              <button type="button" className="button-secondary" onClick={handlePrevious} disabled={!sections.length} aria-label="Ir para a seção anterior">
                Seção anterior
              </button>
              <button type="button" className="button-secondary" onClick={handleNext} disabled={!sections.length} aria-label="Ir para a próxima seção">
                Próxima seção
              </button>
              <button type="button" className="button-secondary" onClick={toggleLowVision} aria-pressed={lowVisionEnabled} aria-label="Alternar modo baixa visão">
                Baixa visão
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setRate(RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length])}
                aria-label={`Velocidade de leitura atual ${formatRate(rate)}. Alterar velocidade.`}
              >
                {formatRate(rate)}
              </button>
            </div>

            <div className="a11y-reading-assistant__context">
              <p className="meta-row">
                <span>{sections.length ? `${currentIndex + 1}/${sections.length} seções` : "Sem seções detectadas"}</span>
                <span>{supported ? "Voz nativa disponível" : "Sem suporte a voz nativa"}</span>
              </p>
              {activeSection ? (
                <article className="a11y-reading-assistant__active">
                  <p className="eyebrow">seção atual</p>
                  <h3>{activeSection.title}</h3>
                  <p>{getTrailExcerpt(activeSection.text)}</p>
                  <div className="stack-actions">
                    <button type="button" className="button-secondary" onClick={() => markCurrentSection(activeSection.element)} aria-label={`Retomar o foco visual na seção ${activeSection.title}`}>
                      Centralizar trecho
                    </button>
                    <Link href="/salvos" className="button-secondary">
                      Abrir salvos
                    </Link>
                  </div>
                </article>
              ) : (
                <p className="a11y-reading-assistant__empty">
                  Abra uma página pública com conteúdo para ouvir seção por seção e usar o reforço visual de leitura.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </Container>
  );
}
