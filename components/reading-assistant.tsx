"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  collectReadingAssistantSections,
  getLowVisionStorageKey,
  getReadingAssistantRateKey,
  getReadingAssistantStorageKey,
  isA11yPublicPath,
  type ReadingAssistantSection,
} from "@/lib/a11y/tts";

const RATES = [0.9, 1, 1.15, 1.3] as const;

function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function readProgress(key: string) {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return 0;
    const data: unknown = JSON.parse(value);
    if (typeof data === "object" && data !== null && "index" in data && typeof data.index === "number") {
      return Math.max(0, data.index);
    }
  } catch {
    // Progresso de leitura é opcional.
  }
  return 0;
}

function highlightCurrent(element: HTMLElement | null) {
  document.querySelectorAll(".vr-reading-current").forEach((node) => node.classList.remove("vr-reading-current"));
  if (!element) return;
  element.classList.add("vr-reading-current");
  element.scrollIntoView({
    block: "center",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export function ReadingAssistant() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<ReadingAssistantSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lowVision, setLowVision] = useState(false);
  const [message, setMessage] = useState("Pronto para ouvir esta página.");
  const tokenRef = useRef(0);
  const storageKey = getReadingAssistantStorageKey(pathname);
  const active = sections[currentIndex] ?? null;
  const supported = mounted && speechAvailable();

  useEffect(() => {
    setMounted(true);
    try {
      const enabled = window.localStorage.getItem(getLowVisionStorageKey()) === "true";
      setLowVision(enabled);
      document.body.classList.toggle("vr-low-vision", enabled);
      const savedRate = Number(window.localStorage.getItem(getReadingAssistantRateKey()));
      if (RATES.includes(savedRate as (typeof RATES)[number])) setRate(savedRate);
    } catch {
      // A leitura funciona mesmo com storage indisponível.
    }
    return () => {
      if (speechAvailable()) window.speechSynthesis.cancel();
      document.querySelectorAll(".vr-reading-current").forEach((node) => node.classList.remove("vr-reading-current"));
    };
  }, []);

  useEffect(() => {
    // Navegar pelo site nunca deve reabrir um painel guardado de outra sessão.
    setOpen(false);
    setPlaying(false);
    setPaused(false);
    tokenRef.current += 1;
    if (speechAvailable()) window.speechSynthesis.cancel();
    if (!isA11yPublicPath(pathname)) return;

    const timeout = window.setTimeout(() => {
      const root = document.getElementById("conteudo");
      const found = root ? collectReadingAssistantSections(root) : [];
      setSections(found);
      setCurrentIndex(Math.min(readProgress(storageKey), Math.max(found.length - 1, 0)));
      // Não rolar nem alterar o foco enquanto o visitante apenas navega.
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [pathname, storageKey]);

  useEffect(() => {
    if (!sections.length) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ index: currentIndex, updatedAt: new Date().toISOString() }));
    } catch {
      // best effort
    }
  }, [currentIndex, sections, storageKey]);

  useEffect(() => {
    const openFromHeader = () => setOpen(true);
    window.addEventListener("vr:open-reading-assistant", openFromHeader);
    return () => window.removeEventListener("vr:open-reading-assistant", openFromHeader);
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(getReadingAssistantRateKey(), String(rate)); } catch {}
  }, [rate]);

  const stop = () => {
    tokenRef.current += 1;
    if (speechAvailable()) window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    setMessage("Leitura interrompida.");
  };

  const speak = (index: number) => {
    if (!supported || !sections[index]) {
      setMessage("A leitura por voz não está disponível nesta página ou navegador.");
      return;
    }
    tokenRef.current += 1;
    const token = tokenRef.current;
    window.speechSynthesis.cancel();
    const section = sections[index];
    const utterance = new SpeechSynthesisUtterance(section.title + ". " + section.text);
    utterance.lang = "pt-BR";
    utterance.rate = rate;
    utterance.onstart = () => {
      if (token !== tokenRef.current) return;
      setCurrentIndex(index);
      setPlaying(true);
      setPaused(false);
      setOpen(true);
      setMessage("Lendo: " + section.title);
      highlightCurrent(section.element);
    };
    utterance.onend = () => {
      if (token !== tokenRef.current) return;
      if (index + 1 < sections.length) speak(index + 1);
      else {
        setPlaying(false);
        setPaused(false);
        setMessage("Leitura concluída.");
      }
    };
    utterance.onerror = () => {
      if (token !== tokenRef.current) return;
      setPlaying(false);
      setPaused(false);
      setMessage("Não foi possível ler este trecho.");
    };
    window.speechSynthesis.speak(utterance);
  };

  const play = () => {
    if (!supported) {
      setMessage("Seu navegador não oferece voz nativa.");
      return;
    }
    if (playing && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setMessage("Leitura retomada.");
      return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      tokenRef.current += 1;
    }
    speak(currentIndex);
  };

  const pause = () => {
    if (!supported || !playing || paused) return;
    window.speechSynthesis.pause();
    setPaused(true);
    setMessage("Leitura pausada.");
  };

  const chooseSection = (index: number) => {
    if (!sections.length) return;
    const next = Math.max(0, Math.min(index, sections.length - 1));
    setCurrentIndex(next);
    if (playing) speak(next);
    else setMessage("Trecho selecionado: " + sections[next].title);
  };

  const toggleLowVision = () => {
    const next = !lowVision;
    setLowVision(next);
    document.body.classList.toggle("vr-low-vision", next);
    try { window.localStorage.setItem(getLowVisionStorageKey(), String(next)); } catch {}
    setMessage(next ? "Alto contraste ativado." : "Alto contraste desativado.");
  };

  if (!mounted || !isA11yPublicPath(pathname) || !open) return null;

  return (
    <aside id="a11y-reading-assistant" className="vr2-listen" aria-label="Leitura assistida da página">
      <div className="vr2-listen__heading">
        <div>
          <span className="vr2-listen__eyebrow">ACESSIBILIDADE · VOZ</span>
          <strong>Ouvir esta página</strong>
        </div>
        <button type="button" className="vr2-listen__close" onClick={() => { stop(); setOpen(false); highlightCurrent(null); }} aria-label="Fechar o painel de leitura">Fechar <span aria-hidden="true">×</span></button>
      </div>

      <div className="vr2-listen__playback" role="group" aria-label="Controles de áudio">
        <button type="button" className="vr2-listen__play" onClick={play} disabled={!supported || !sections.length}>{playing && !paused ? "Reiniciar" : paused ? "Retomar" : "▶ Ouvir"}</button>
        <button type="button" onClick={pause} disabled={!playing || paused}>Pausar</button>
        <button type="button" onClick={stop} disabled={!playing}>Parar</button>
      </div>

      <p className="vr2-listen__status" aria-live="polite">{message}</p>
      <div className="vr2-listen__section">
        <span>Trecho {sections.length ? currentIndex + 1 : 0} de {sections.length}</span>
        <strong>{active?.title || "Nenhum trecho disponível"}</strong>
      </div>

      <div className="vr2-listen__options">
        <button type="button" onClick={() => chooseSection(currentIndex - 1)} disabled={currentIndex === 0}>← Anterior</button>
        <button type="button" onClick={() => chooseSection(currentIndex + 1)} disabled={currentIndex >= sections.length - 1}>Próximo →</button>
        <button type="button" onClick={() => setRate(RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length])} aria-label={"Velocidade: " + rate + " vezes"}>{rate.toLocaleString("pt-BR")}×</button>
        <button type="button" onClick={toggleLowVision} aria-pressed={lowVision}>Alto contraste</button>
      </div>
      {active && <button type="button" className="vr2-listen__find" onClick={() => highlightCurrent(active.element)}>Mostrar trecho na página ↗</button>}
    </aside>
  );
}
