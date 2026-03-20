"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone;
    setInstalled(Boolean(isStandalone));

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const label = useMemo(() => {
    if (installed) {
      return "App instalado";
    }

    return promptEvent ? "Instalar app" : "Abrir no celular";
  }, [installed, promptEvent]);

  if (installed) {
    return <span className="pwa-install-status">{label}</span>;
  }

  if (!promptEvent) {
    return null;
  }

  return (
    <button
      type="button"
      className="button-secondary pwa-install-button"
      onClick={async () => {
        await promptEvent.prompt();
        await promptEvent.userChoice.catch(() => null);
        setPromptEvent(null);
      }}
    >
      {label}
    </button>
  );
}